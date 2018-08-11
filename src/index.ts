/**
 * @license
 *
 * chroma.js - JavaScript library for color conversions
 *
 * Copyright (c) 2011-2017, Gregor Aisch
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. The name Gregor Aisch may not be used to endorse or promote products
 *    derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL GREGOR AISCH OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

const { abs, atan2, cos, floor, log, max, round, sin, sqrt, PI } = Math

function newtonIterate1d(f: (x: number) => number, xStart: number, max_steps: number, eps: number = 1e-8): number {
	let x = xStart,
		fx
	while (max_steps-- && Math.abs((fx = f(x))) > eps) {
		const dfdx = (f(x + eps) - fx) / eps
		console.log("fx / dfdx", fx / dfdx, "fx", fx, "x", x)
		x = x - fx / dfdx
	}
	return x
}
function bisect(f: (x: number) => number, a: number, b: number, steps: number) {
	//assert(a < b)
	let fA = f(a),
		fB = f(b)
	//assert(fA * fB < 0)
	while (steps--) {
		const c = (a + b) / 2
		const fC = f(c)
		console.log("fC", fC, "c", c)
		if (Math.sign(fA) == Math.sign(fC)) {
			a = c
			fA = fC
		} else {
			b = c
			fB = fC
		}
	}
	//assert(a <= (b + a) / 2)
	//assert(b >= (b + a) / 2)
	return (a + b) / 2
}

const TWOPI = 2 * PI

const DEG2RAD = PI / 180

const RAD2DEG = 180 / PI
export class Color {
	//public readonly r: number
	//public readonly g: number
	//public readonly b: number
	private readonly _rgb: RGBA
	/** internal */
	constructor(rgb: RGB | RGBA) {
		if (rgb.length == 3) {
			rgb.push(1)
		}
		this._rgb = rgb as RGBA
	}
	public shade() {
		const shades: [string, string, number][] = [
			["ff0000", "red"],
			["ffa500", "orange"],
			["ffff00", "yellow"],
			["008000", "green"],
			["0000ff", "blue"],
			["ee82ee", "violet"],
			["a52a2a", "brown"],
			["000000", "black"],
			["808080", "grey"],
			["ffffff", "white"],
		] as any
		function angleDiff(a: number, b: number) {
			const d = (a - b) % 360
			if (d > 180) return d - 360
			if (d < -180) return d + 360
			return d
		}
		shades.forEach(arr => arr.push(chroma(arr[0]).hsl()[0]))
		const [h, s, l] = this.hsl()
		if (l > 0.9) return "white"
		//return withMax(shades, ([_hex, _name, _hue]) => {
		//	return -Math.abs(angleDiff(this.hsl()[0], _hue))
		//})[1]
		return withMax(shades, ([_hex, _name, _hue]) => {
			const [thisL, thisA, thisB] = this.lab()
			const [L, A, B] = chroma(_hex).lab()
			return -Math.hypot(thisL - L, thisA - A, thisB - B)
		})[1]
	}
	public interpolate(col2: Chromable, f: number, m?: ColorMode) {
		return chroma.interpolate(this, col2, f, m)
	}
	public rgb(round = true): RGB {
		return (round ? this._rgb.map(Math.round) : this._rgb).slice(0, 3) as RGB
	}
	public rgba(round = true, clamp_ = true): RGBA {
		const f = (t: number) => {
			if (round) t = Math.round(t)
			if (clamp_) t = clamp(t, 0, 255)
			return t
		}
		return [f(this._rgb[0]), f(this._rgb[1]), f(this._rgb[2]), this._rgb[3]]
	}

	public hex(mode: "rgb" | "rgba" | "argb" = "rgb") {
		return rgb2hex(this._rgb, mode)
	}

	public hsl(): HSL {
		const [r, g, b] = this._rgb
		return rgb2hsl(r, g, b)
	}

	public hsv() {
		const [r, g, b] = this._rgb
		return rgb2hsv(r, g, b)
	}

	public hcg() {
		const [r, g, b] = this._rgb
		return rgb2hcg(r, g, b)
	}

	public css(mode: "rgb" | "hsl" = "rgb") {
		if ("rgb" == mode) {
			const [r, g, b, a] = this._rgb
			return rgb2css(r, g, b, a)
		} else if ("hsl" == mode) {
			return hsl2css(this.hsl(), this.alpha())
		} else {
			throw new Error()
		}
	}

	public name(closest: true): string
	/**
	 * Get the name of a color. By default, this method will try to match the color exactly (comparing rounded RGB
	 * values). Pass `true` to return the name of the color which is closest to `this` in CIELAB color space. CIELAB is
	 * used as it is perceptually uniform.
	 * @param closest Whether this should find the closest color name. Defaults to false.
	 * @return If `closest == false`, the name of this color or `undefined` if there is no match. Otherwise, will always
	 * return a color name.
	 * @example chroma('#ff0000').name() // "red"
	 * @example chroma('#ff0001').name() // undefined
	 * @example chroma('#ff0001').name(true) // "red"
	 */
	public name(closest?: boolean): string | undefined
	public name(closest: boolean = false): string | undefined {
		const num = this.num()
		const name = Object.keys(chroma.w3cx11).find(name => (chroma.w3cx11 as any)[name] == num)
		if (!name && closest) {
			const [thisLStar, thisAStar, thisBStar] = this.lab()
			return withMax(Object.keys(chroma.w3cx11) as (keyof typeof chroma.w3cx11)[], name => {
				const [lStar, aStar, bStar] = chroma.num(chroma.w3cx11[name]).lab()
				return -Math.hypot(thisLStar - lStar, thisAStar - aStar, thisBStar - bStar)
			})
		}
		return name
	}

	public cmyk() {
		const [r, g, b] = this._rgb
		return rgb2cmyk(r, g, b)
	}

	public gl(): GL {
		const [r, g, b, a] = this._rgb
		return [r / 255, g / 255, b / 255, a]
	}

	/**
	 * Get luminance of the color. This is equal to the Y channel of the XYZ color space.
	 * @example chroma('black').luminance() // 0
	 * @example chroma('white').luminance() // 1
	 * @example chroma('red').luminance() // ~0.21
	 * @see https://en.wikipedia.org/wiki/Relative_luminance
	 */
	public luminance(): number
	/**
	 * Return a new [Color] with `lum0_1` by linearly interpolating `this` with white (when increasing the luminance) or
	 * black (otherwise) in the [XYZ] color space.
	 * @see https://en.wikipedia.org/wiki/Relative_luminance
	 * @example // Approximately doubling the luminance of red
	 * chroma('red').luminance(0.4) // #ff8686, "Vivid Tangerine"
	 * @param lum0_1 The desired luminance.
	 */
	public luminance(lum0_1: number): this
	public luminance(lum0_1?: number) {
		const [r, g, b, alpha] = this._rgb
		const [, Y] = rgb2xyz(r, g, b)
		if (undefined === lum0_1) {
			return Y
		}
		const inverseLerp = (a: number, b: number, val: number) => (val - a) / (b - a)
		if (lum0_1 > Y) {
			// lerp to white
			return chroma.interpolate(this, chroma("white"), inverseLerp(Y, 1, lum0_1), "xyz").alpha(alpha)
		} else {
			// lerp to black
			return chroma.interpolate(chroma("black"), this, inverseLerp(0, Y, lum0_1), "xyz").alpha(alpha)
		}
	}

	/**
	 * Get color temperature of this color in Kelvin. This only ma TODO
	 */
	public temperature() {
		const [r, g, b] = this._rgb
		return rgb2kelvin(r, g, b)
	}

	//public get(modeAndChannel: string) {
	//	const [mode, channel] = modeAndChannel.split(".") as [ColorMode, string]
	//	const src = this[mode]()
	//	if (channel) {
	//		const i = mode.indexOf(channel)
	//		if (-1 == i) throw new Error("invalid channel")
	//		return src[i]
	//	} else {
	//		return src
	//	}
	//}

	public set(modeAndChannel: string, value: string | number) {
		const [mode, channel] = modeAndChannel.split(".") as [ColorMode, string]
		let src
		if (channel) {
			src = this[mode]()
			const i = mode.indexOf(channel)
			if (-1 == i) throw new Error("invalid channel")
			if ("string" == typeof value) {
				switch (value.charAt(0)) {
					case "+":
					case "-":
						src[i] += +value
						break
					case "*":
						src[i] *= +value.substr(1)
						break
					case "/":
						src[i] /= +value.substr(1)
						break
					default:
						src[i] = +value
				}
			} else {
				src[i] = value
			}
		} else {
			src = value
		}
		const rgba = _input[mode](src) as RGBA
		rgba[3] = this.alpha()
		return new Color(rgba)
	}

	public clipped() {
		const [r, g, b] = this._rgb
		return !(0 <= r && r <= 255 && (0 <= g && g <= 255) && (0 <= b && b <= 255))
	}

	/**
	 * Returns black or white, whichever has the highest contrast to [this].
	 */
	public textColor() {
		return this.luminance() > 0.5 ? chroma.black : chroma.white
	}

	/**
	 * Get alpha value of color.
	 * @example chroma.rgb(0, 0, 255, 0.5).alpha() // 0.5
	 */
	public alpha(): number
	/**
	 * Return new [Color] with given alpha value.
	 * @example chroma('green').alpha(0.3).hex('rgba') // "#00ff004d"
	 * @param alpha0_1 The desired alpha value.
	 */
	public alpha(alpha0_1: number): Color
	public alpha(alpha0_1?: number): number | Color {
		if (undefined === alpha0_1) {
			return this._rgb[3]
		}
		const [r, g, b] = this._rgb
		return chroma.rgb(r, g, b, alpha0_1)
	}

	public darker(amount = 1) {
		const [l, a, b] = this.lab()
		return chroma.lab(l - LAB_Kn * amount, a, b, this.alpha())
	}

	public brighter(amount = 1) {
		return this.darker(-amount)
	}

	public saturate(amount = 1) {
		const [l, c, h] = this.lch()
		return chroma.lch(l, max(0, c + amount * LAB_Kn), h, this.alpha())
	}

	public desaturate(amount = 1) {
		return this.saturate(-amount)
	}

	public premultiplied() {
		const [r, g, b, a] = this._rgb
		return chroma.rgb(r * a, g * a, b * a, a)
	}

	public hsi() {
		const [r, g, b] = this._rgb
		return rgb2hsi(r, g, b)
	}
	public lab() {
		const [r, g, b] = this._rgb
		return rgb2lab(r, g, b)
	}

	public num() {
		const [r, g, b] = this._rgb
		return rgb2num(r, g, b)
	}
	public lch() {
		const [r, g, b] = this._rgb
		return rgb2lch(r, g, b)
	}

	public hcl(): HCL {
		const [r, g, b] = this._rgb
		return rgb2lch(r, g, b).reverse() as HCL
	}

	public xyz() {
		const [r, g, b] = this._rgb
		return rgb2xyz(r, g, b)
	}

	public equals(color: Color) {
		const [r, g, b, a] = this._rgb
		const [r2, g2, b2, a2] = color._rgb
		return r == r2 && g == g2 && b == b2 && a == a2
	}
}
export interface Color {
	mix(col2: Chromable, f: number, m: ColorMode): Color
	toString(): string
	//darker(amount: number): Color
	//brighter(amount: number): Color
	kelvin(): number
}
Color.prototype.mix = Color.prototype.interpolate
Color.prototype.toString = Color.prototype.hex

//Color.prototype.darker = Color.prototype.darken
//Color.prototype.brighter = Color.prototype.brighten

Color.prototype.kelvin = Color.prototype.temperature

function lerp(a: number, b: number, f: number) {
	return a + (b - a) * f
}
function clamp(x: number, min = 0, max = 1) {
	return x < min ? min : x > max ? max : x
}
export type Chromable = number | string | Color | number[]

function chroma(x: Chromable): Color
function chroma(red: number, green: number, blue: number, alpha?: number): Color
function chroma(x: Chromable, format: ColorFormat): Color
function chroma(channel0: number, channel1: Color, channel2: number, format: ColorFormat): Color
function chroma(channel0: number, channel1: Color, channel2: number, channel3: number, format: ColorFormat): Color
function chroma(...args: any[]) {
	if (args[0] instanceof Color) {
		return args[0]
	}
	if (args.length > 1 && "string" == typeof args[args.length - 1]) {
		return guess(args.slice(0, args.length - 1), args[args.length - 1])
	} else if (Array.isArray(args[0])) {
		return guess(args[0])
	} else {
		return guess(args)
	}
}
export default chroma
export { chroma }
namespace chroma {
	export const black = new Color([0, 0, 0, 1])
	export const white = new Color([255, 255, 255, 1])
	export const brewer = {
		OrRd: [0xfff7ec, 0xfee8c8, 0xfdd49e, 0xfdbb84, 0xfc8d59, 0xef6548, 0xd7301f, 0xb30000, 0x7f0000],
		PuBu: [0xfff7fb, 0xece7f2, 0xd0d1e6, 0xa6bddb, 0x74a9cf, 0x3690c0, 0x0570b0, 0x045a8d, 0x023858],
		BuPu: [0xf7fcfd, 0xe0ecf4, 0xbfd3e6, 0x9ebcda, 0x8c96c6, 0x8c6bb1, 0x88419d, 0x810f7c, 0x4d004b],
		Oranges: [0xfff5eb, 0xfee6ce, 0xfdd0a2, 0xfdae6b, 0xfd8d3c, 0xf16913, 0xd94801, 0xa63603, 0x7f2704],
		BuGn: [0xf7fcfd, 0xe5f5f9, 0xccece6, 0x99d8c9, 0x66c2a4, 0x41ae76, 0x238b45, 0x006d2c, 0x00441b],
		YlOrBr: [0xffffe5, 0xfff7bc, 0xfee391, 0xfec44f, 0xfe9929, 0xec7014, 0xcc4c02, 0x993404, 0x662506],
		YlGn: [0xffffe5, 0xf7fcb9, 0xd9f0a3, 0xaddd8e, 0x78c679, 0x41ab5d, 0x238443, 0x006837, 0x004529],
		Reds: [0xfff5f0, 0xfee0d2, 0xfcbba1, 0xfc9272, 0xfb6a4a, 0xef3b2c, 0xcb181d, 0xa50f15, 0x67000d],
		RdPu: [0xfff7f3, 0xfde0dd, 0xfcc5c0, 0xfa9fb5, 0xf768a1, 0xdd3497, 0xae017e, 0x7a0177, 0x49006a],
		Greens: [0xf7fcf5, 0xe5f5e0, 0xc7e9c0, 0xa1d99b, 0x74c476, 0x41ab5d, 0x238b45, 0x006d2c, 0x00441b],
		YlGnBu: [0xffffd9, 0xedf8b1, 0xc7e9b4, 0x7fcdbb, 0x41b6c4, 0x1d91c0, 0x225ea8, 0x253494, 0x081d58],
		Purples: [0xfcfbfd, 0xefedf5, 0xdadaeb, 0xbcbddc, 0x9e9ac8, 0x807dba, 0x6a51a3, 0x54278f, 0x3f007d],
		GnBu: [0xf7fcf0, 0xe0f3db, 0xccebc5, 0xa8ddb5, 0x7bccc4, 0x4eb3d3, 0x2b8cbe, 0x0868ac, 0x084081],
		Greys: [0xffffff, 0xf0f0f0, 0xd9d9d9, 0xbdbdbd, 0x969696, 0x737373, 0x525252, 0x252525, 0x000000],
		YlOrRd: [0xffffcc, 0xffeda0, 0xfed976, 0xfeb24c, 0xfd8d3c, 0xfc4e2a, 0xe31a1c, 0xbd0026, 0x800026],
		PuRd: [0xf7f4f9, 0xe7e1ef, 0xd4b9da, 0xc994c7, 0xdf65b0, 0xe7298a, 0xce1256, 0x980043, 0x67001f],
		Blues: [0xf7fbff, 0xdeebf7, 0xc6dbef, 0x9ecae1, 0x6baed6, 0x4292c6, 0x2171b5, 0x08519c, 0x08306b],
		PuBuGn: [0xfff7fb, 0xece2f0, 0xd0d1e6, 0xa6bddb, 0x67a9cf, 0x3690c0, 0x02818a, 0x016c59, 0x014636],
		Viridis: [0x440154, 0x482777, 0x3f4a8a, 0x31678e, 0x26838f, 0x1f9d8a, 0x6cce5a, 0xb6de2b, 0xfee825],
		Spectral: [
			0x9e0142,
			0xd53e4f,
			0xf46d43,
			0xfdae61,
			0xfee08b,
			0xffffbf,
			0xe6f598,
			0xabdda4,
			0x66c2a5,
			0x3288bd,
			0x5e4fa2,
		],
		RdYlGn: [
			0xa50026,
			0xd73027,
			0xf46d43,
			0xfdae61,
			0xfee08b,
			0xffffbf,
			0xd9ef8b,
			0xa6d96a,
			0x66bd63,
			0x1a9850,
			0x006837,
		],
		RdBu: [
			0x67001f,
			0xb2182b,
			0xd6604d,
			0xf4a582,
			0xfddbc7,
			0xf7f7f7,
			0xd1e5f0,
			0x92c5de,
			0x4393c3,
			0x2166ac,
			0x053061,
		],
		PiYG: [
			0x8e0152,
			0xc51b7d,
			0xde77ae,
			0xf1b6da,
			0xfde0ef,
			0xf7f7f7,
			0xe6f5d0,
			0xb8e186,
			0x7fbc41,
			0x4d9221,
			0x276419,
		],
		PRGn: [
			0x40004b,
			0x762a83,
			0x9970ab,
			0xc2a5cf,
			0xe7d4e8,
			0xf7f7f7,
			0xd9f0d3,
			0xa6dba0,
			0x5aae61,
			0x1b7837,
			0x00441b,
		],
		RdYlBu: [
			0xa50026,
			0xd73027,
			0xf46d43,
			0xfdae61,
			0xfee090,
			0xffffbf,
			0xe0f3f8,
			0xabd9e9,
			0x74add1,
			0x4575b4,
			0x313695,
		],
		BrBG: [
			0x543005,
			0x8c510a,
			0xbf812d,
			0xdfc27d,
			0xf6e8c3,
			0xf5f5f5,
			0xc7eae5,
			0x80cdc1,
			0x35978f,
			0x01665e,
			0x003c30,
		],
		RdGy: [
			0x67001f,
			0xb2182b,
			0xd6604d,
			0xf4a582,
			0xfddbc7,
			0xffffff,
			0xe0e0e0,
			0xbababa,
			0x878787,
			0x4d4d4d,
			0x1a1a1a,
		],
		PuOr: [
			0x7f3b08,
			0xb35806,
			0xe08214,
			0xfdb863,
			0xfee0b6,
			0xf7f7f7,
			0xd8daeb,
			0xb2abd2,
			0x8073ac,
			0x542788,
			0x2d004b,
		],
		Set2: [0x66c2a5, 0xfc8d62, 0x8da0cb, 0xe78ac3, 0xa6d854, 0xffd92f, 0xe5c494, 0xb3b3b3],
		Accent: [0x7fc97f, 0xbeaed4, 0xfdc086, 0xffff99, 0x386cb0, 0xf0027f, 0xbf5b17, 0x666666],
		Set1: [0xe41a1c, 0x377eb8, 0x4daf4a, 0x984ea3, 0xff7f00, 0xffff33, 0xa65628, 0xf781bf, 0x999999],
		Set3: [
			0x8dd3c7,
			0xffffb3,
			0xbebada,
			0xfb8072,
			0x80b1d3,
			0xfdb462,
			0xb3de69,
			0xfccde5,
			0xd9d9d9,
			0xbc80bd,
			0xccebc5,
			0xffed6f,
		],
		Dark2: [0x1b9e77, 0xd95f02, 0x7570b3, 0xe7298a, 0x66a61e, 0xe6ab02, 0xa6761d, 0x666666],
		Paired: [
			0xa6cee3,
			0x1f78b4,
			0xb2df8a,
			0x33a02c,
			0xfb9a99,
			0xe31a1c,
			0xfdbf6f,
			0xff7f00,
			0xcab2d6,
			0x6a3d9a,
			0xffff99,
			0xb15928,
		],
		Pastel2: [0xb3e2cd, 0xfdcdac, 0xcbd5e8, 0xf4cae4, 0xe6f5c9, 0xfff2ae, 0xf1e2cc, 0xcccccc],
		Pastel1: [0xfbb4ae, 0xb3cde3, 0xccebc5, 0xdecbe4, 0xfed9a6, 0xffffcc, 0xe5d8bd, 0xfddaec, 0xf2f2f2],
	}

	/**
	 * X11 color names
	 * http://www.w3.org/TR/css3-color/#svg-color
	 */
	export const w3cx11 = {
		aliceblue: 0xf0f8ff,
		antiquewhite: 0xfaebd7,
		aqua: 0x00ffff,
		aquamarine: 0x7fffd4,
		azure: 0xf0ffff,
		beige: 0xf5f5dc,
		bisque: 0xffe4c4,
		black: 0x000000,
		blanchedalmond: 0xffebcd,
		blue: 0x0000ff,
		blueviolet: 0x8a2be2,
		brown: 0xa52a2a,
		burlywood: 0xdeb887,
		cadetblue: 0x5f9ea0,
		chartreuse: 0x7fff00,
		chocolate: 0xd2691e,
		coral: 0xff7f50,
		cornflower: 0x6495ed,
		cornflowerblue: 0x6495ed,
		cornsilk: 0xfff8dc,
		crimson: 0xdc143c,
		cyan: 0x00ffff,
		darkblue: 0x00008b,
		darkcyan: 0x008b8b,
		darkgoldenrod: 0xb8860b,
		darkgray: 0xa9a9a9,
		darkgreen: 0x006400,
		darkgrey: 0xa9a9a9,
		darkkhaki: 0xbdb76b,
		darkmagenta: 0x8b008b,
		darkolivegreen: 0x556b2f,
		darkorange: 0xff8c00,
		darkorchid: 0x9932cc,
		darkred: 0x8b0000,
		darksalmon: 0xe9967a,
		darkseagreen: 0x8fbc8f,
		darkslateblue: 0x483d8b,
		darkslategray: 0x2f4f4f,
		darkslategrey: 0x2f4f4f,
		darkturquoise: 0x00ced1,
		darkviolet: 0x9400d3,
		deeppink: 0xff1493,
		deepskyblue: 0x00bfff,
		dimgray: 0x696969,
		dimgrey: 0x696969,
		dodgerblue: 0x1e90ff,
		firebrick: 0xb22222,
		floralwhite: 0xfffaf0,
		forestgreen: 0x228b22,
		fuchsia: 0xff00ff,
		gainsboro: 0xdcdcdc,
		ghostwhite: 0xf8f8ff,
		gold: 0xffd700,
		goldenrod: 0xdaa520,
		gray: 0x808080,
		green: 0x008000,
		greenyellow: 0xadff2f,
		grey: 0x808080,
		honeydew: 0xf0fff0,
		hotpink: 0xff69b4,
		indianred: 0xcd5c5c,
		indigo: 0x4b0082,
		ivory: 0xfffff0,
		khaki: 0xf0e68c,
		laserlemon: 0xffff54,
		lavender: 0xe6e6fa,
		lavenderblush: 0xfff0f5,
		lawngreen: 0x7cfc00,
		lemonchiffon: 0xfffacd,
		lightblue: 0xadd8e6,
		lightcoral: 0xf08080,
		lightcyan: 0xe0ffff,
		lightgoldenrod: 0xfafad2,
		lightgoldenrodyellow: 0xfafad2,
		lightgray: 0xd3d3d3,
		lightgreen: 0x90ee90,
		lightgrey: 0xd3d3d3,
		lightpink: 0xffb6c1,
		lightsalmon: 0xffa07a,
		lightseagreen: 0x20b2aa,
		lightskyblue: 0x87cefa,
		lightslategray: 0x778899,
		lightslategrey: 0x778899,
		lightsteelblue: 0xb0c4de,
		lightyellow: 0xffffe0,
		lime: 0x00ff00,
		limegreen: 0x32cd32,
		linen: 0xfaf0e6,
		magenta: 0xff00ff,
		maroon: 0x800000,
		maroon2: 0x7f0000,
		maroon3: 0xb03060,
		mediumaquamarine: 0x66cdaa,
		mediumblue: 0x0000cd,
		mediumorchid: 0xba55d3,
		mediumpurple: 0x9370db,
		mediumseagreen: 0x3cb371,
		mediumslateblue: 0x7b68ee,
		mediumspringgreen: 0x00fa9a,
		mediumturquoise: 0x48d1cc,
		mediumvioletred: 0xc71585,
		midnightblue: 0x191970,
		mintcream: 0xf5fffa,
		mistyrose: 0xffe4e1,
		moccasin: 0xffe4b5,
		navajowhite: 0xffdead,
		navy: 0x000080,
		oldlace: 0xfdf5e6,
		olive: 0x808000,
		olivedrab: 0x6b8e23,
		orange: 0xffa500,
		orangered: 0xff4500,
		orchid: 0xda70d6,
		palegoldenrod: 0xeee8aa,
		palegreen: 0x98fb98,
		paleturquoise: 0xafeeee,
		palevioletred: 0xdb7093,
		papayawhip: 0xffefd5,
		peachpuff: 0xffdab9,
		peru: 0xcd853f,
		pink: 0xffc0cb,
		plum: 0xdda0dd,
		powderblue: 0xb0e0e6,
		purple: 0x800080,
		purple2: 0x7f007f,
		purple3: 0xa020f0,
		rebeccapurple: 0x663399,
		red: 0xff0000,
		rosybrown: 0xbc8f8f,
		royalblue: 0x4169e1,
		saddlebrown: 0x8b4513,
		salmon: 0xfa8072,
		sandybrown: 0xf4a460,
		seagreen: 0x2e8b57,
		seashell: 0xfff5ee,
		sienna: 0xa0522d,
		silver: 0xc0c0c0,
		skyblue: 0x87ceeb,
		slateblue: 0x6a5acd,
		slategray: 0x708090,
		slategrey: 0x708090,
		snow: 0xfffafa,
		springgreen: 0x00ff7f,
		steelblue: 0x4682b4,
		tan: 0xd2b48c,
		teal: 0x008080,
		thistle: 0xd8bfd8,
		tomato: 0xff6347,
		turquoise: 0x40e0d0,
		violet: 0xee82ee,
		wheat: 0xf5deb3,
		white: 0xffffff,
		whitesmoke: 0xf5f5f5,
		yellow: 0xffff00,
		yellowgreen: 0x9acd32,
	}
	interface CubeHelix {
		(f: number): Color
	}
	class CubeHelix {
		private _start!: number
		private _rotations!: number
		private _gamma!: number
		private _hue!: [number, number]
		private _lightness!: [number, number]
		public start(s: number) {
			if (undefined === s) {
				return this._start
			}
			this._start = s
			return this
		}
		public rotations(r: number) {
			if (undefined === r) {
				return this._rotations
			}
			this._rotations = r
			return this
		}
		public gamma(g: number) {
			if (undefined === g) {
				return this._gamma
			}
			this._gamma = g
			return this
		}
		public hue(h: number | [number, number]) {
			if (undefined === h) {
				return this._hue
			}
			this._hue = Array.isArray(h) ? h : [h, h]
			return this
		}
		public lightness(h: number | [number, number]) {
			if (undefined === h) {
				return this._lightness
			}
			this._lightness = Array.isArray(h) ? h : [h, h]
			return this
		}
		public scale() {
			return chroma.scale(this)
		}
		public at(fract: number) {
			const a = TWOPI * ((this._start + 120) / 360 + this._rotations * fract)
			const l = lerp(this._lightness[0], this._lightness[1], fract) ** this._gamma
			const h = lerp(this._hue[0], this._hue[1], fract)
			const amp = (h * l * (1 - l)) / 2
			const cos_a = Math.cos(a)
			const sin_a = Math.sin(a)
			const r = l + amp * (-0.14861 * cos_a + 1.78277 * sin_a)
			const g = l + amp * (-0.29227 * cos_a - 0.90649 * sin_a)
			const b = l + amp * (+1.97294 * cos_a)
			return chroma.rgb([r * 255, g * 255, b * 255, 1])
		}
	}
	export function cubehelix(
		start = 300,
		rotations = -1.5,
		hue: number | [number, number] = 1,
		gamma = 1,
		lightness: number | [number, number] = [0, 1],
	) {
		const f: CubeHelix = (t => f.at(t)) as CubeHelix
		;(Object.getOwnPropertyNames(CubeHelix.prototype) as (keyof typeof CubeHelix)[]).forEach(
			key => (f[key] = CubeHelix.prototype[key]),
		)
		f.start(start)
		f.rotations(rotations)
		f.hue(hue)
		f.gamma(gamma)
		f.lightness(lightness)
		return f
	}

	/**
	 * Create a new random [Color] from a random point in the RGB color space.
	 * @param randomSource A function which returns random `number`s in the interval [0; 1). Useful if you want to
	 *     create a deterministic sequence of "random" colors. Defaults to `Math.random`.
	 */
	export function random(randomSource = Math.random) {
		return num((randomSource() * 0x1_00_00_00) | 0)
	}

	/**
	 * Create a valid RGB color (`.clipped() == false`) from a random point in the CIELAB color space. This results in
	 * more colors in the RGB color space where humans can perceive more differences.
	 * @param randomSource A function which returns random `number`s in the interval [0; 1). Useful if you want to
	 *     create a deterministic sequence of "random" colors. Defaults to `Math.random`.
	 * @example chroma.random((() => { let i = 0; return () => (i = (i *Math.SQRT2) % 1); })())
	 */
	export function randomLab(randomSource = Math.random) {
		const labAMin = -87,
			labAMax = 99,
			labBMin = -108,
			labBMax = 95
		let maxIterations = 100
		while (maxIterations--) {
			const u = randomSource(),
				v = randomSource(),
				w = randomSource()
			// The following matrix multiplication transform the random point (u v w) in the unit cube into the
			// oriented bounding box (OBB) of the projection of the RGB space into the LAB space. This is necessary to
			// avoid a huge number of misses.
			const color = chroma.lab(
				u * -53.903 + v * -88.755 + w * 71.7 + 99.707,
				u * -82.784 + v * 187.036 + w * -2.422 + -28.17,
				u * -75.813 + v * -141.406 + w * -48.261 + 152.469,
			)
			console.log(color.lab())
			console.log(color.rgba(false, false))
			if (!color.clipped()) return color
		}
		throw new Error("Could find a random color in 100 iterations")
	}

	export function interpolate(col1: Chromable, col2: Chromable, f = 0.5, m: InterpolationMode = "rgb") {
		const c1 = chroma(col1)
		const c2 = chroma(col2)
		const res = interpolators[m] && interpolators[m](c1, c2, f, m)
		if (!res) {
			throw new Error("color mode " + m + " is not supported")
		}
		return res.alpha(lerp(c1.alpha(), c2.alpha(), f))
	}

	export const mix = interpolate

	export function css(cssString: string) {
		return new Color(css2rgb(cssString))
	}
	export function cmyk(cmyk: CMYK): Color
	export function cmyk(cyan0_1: number, magenta0_1: number, yellow0_1: number, key0_1: number): Color
	export function cmyk(...args: any[]) {
		return guess(args, "cmyk")
	}
	export function gl(gl: RGBA | RGB): Color
	export function gl(red0_1: number, green0_1: number, blue0_1: number, alpha0_1?: number): Color
	export function gl(...args: any[]) {
		return guess(args, "gl")
	}
	export function hcg(hcg: HCG): Color
	export function hcg(h: number, c: number, g: number): Color
	export function hcg(...args: any[]) {
		return guess(args, "hcg")
	}
	export function hcl(hcl: LAB): Color
	export function hcl(h: number, c: number, l: number): Color
	export function hcl(...args: any[]) {
		return guess(args, "hcl")
	}
	export function lch(lch: LCH): Color
	export function lch(h: number, c: number, l: number, alpha0_1?: number): Color
	export function lch(...args: any[]) {
		return guess(args, "lch")
	}
	export function hsi(hsi: HSI): Color
	export function hsi(h: number, s: number, i: number, alpha0_1?: number): Color
	export function hsi(...args: any[]) {
		return guess(args, "hsi")
	}
	export function hsl(hsl: HSL): Color
	export function hsl(hueDegrees: number, saturation0_1: number, lightness0_1: number, alpha0_1?: number): Color
	export function hsl(...args: any[]) {
		return guess(args, "hsl")
	}
	export function hsv(hsv: LAB): Color
	export function hsv(h: number, s: number, v: number): Color
	export function hsv(...args: any[]) {
		return guess(args, "hsv")
	}
	export function kelvin(temperature: number) {
		return new Color(kelvin2rgb(temperature))
	}
	export function lab(lab: LAB): Color
	export function lab(lightness1: number, a1: number, b: number, alpha0_1?: number): Color
	export function lab(...args: any[]) {
		return guess(args, "lab")
	}
	export function num(num: number) {
		return new Color(num2rgb(num))
	}
	export function rgb(rgb: RGBA | RGB): Color
	export function rgb(red255: number, green255: number, blue255: number, alpha1?: number): Color
	export function rgb(...args: any[]) {
		return guess(args, "rgb")
	}
	export function xyz(xyz: XYZ): Color
	export function xyz(x1: number, y1: number, z1: number, alpha1?: number): Color
	export function xyz(...args: any[]) {
		return guess(args, "xyz")
	}

	export function average(chromables: Chromable[], mode: InterpolationMode = "rgb") {
		const colors = chromables.map(c => chroma(c))
		if (mode == "lrgb") {
			return _average_lrgb(colors)
		}
		const xyz = [0, 0, 0]
		let dx = 0
		let dy = 0
		let alpha = 0
		for (const c of colors) {
			const xyz2 = c[mode]()
			alpha += c.alpha()
			for (let i = 0; i < xyz.length; i++) {
				if (mode.charAt(i) == "h") {
					const A = (xyz2[i] / 180) * PI
					dx += Math.cos(A)
					dy += Math.sin(A)
				} else {
					xyz[i] += xyz2[i]
				}
			}
		}
		for (let i = 0; i < xyz.length; i++) {
			if (mode.charAt(i) == "h") {
				const A = atan2(dy / colors.length, dx / colors.length) * RAD2DEG
				xyz[i] = (A + 360) % 360
			} else {
				xyz[i] = xyz[i] / colors.length
			}
		}
		return guess(xyz, mode).alpha(alpha / colors.length)
	}

	export function bezier(chromables: Chromable[]): { (t: number): Color; scale(): Scale }
	export function bezier(...chromables: Chromable[]): { (t: number): Color; scale(): Scale }
	export function bezier(...args: any[]) {
		const chromables: Chromable[] = Array.isArray(args[0]) ? args[0] : args
		const f = _bezier(chromables) as { (t: number): Color; scale(): Scale }
		f.scale = CubeHelix.prototype.scale
		return f
	}

	export function blend(bottom: Chromable, top: Chromable, mode: keyof typeof blend_fs) {
		if (!blend_fs[mode]) {
			throw new Error("unknown blend mode " + mode)
		}
		return blend_fs[mode](bottom, top)
	}

	namespace blend_fs {
		export const normal = blend_f(each((a, _) => a))
		export const multiply = blend_f(each((a, b) => (a * b) / 255))
		export const screen = blend_f(each(_screen))
		export const overlay = blend_f(each(_overlay))
		export const darken = blend_f(each(Math.min))
		export const lighten = blend_f(each(Math.max))
		export const dodge = blend_f(each(_dodge))
		export const burn = blend_f(each(_burn))
	}
	interface Scale {
		(val: number): Color
	}
	class Scale {
		private _colors!: Color[] | ((t: number) => Color)
		private _classes!: number[] | undefined
		/**
		 * Color cache. undefined if the cache should not be used.
		 */
		private _cache!: Map<number, Color> | undefined
		private _correctLightness!: boolean
		private _gamma!: number
		private _mode!: InterpolationMode
		private _out!: ColorFormat | undefined
		private _min!: number
		private _max!: number
		private _paddingLeft!: number
		private _paddingRight!: number
		// positions of the colors on the interval [0, 1]. guaranteed to have the same length as _colors
		// undefined when _colors is a function
		private _pos: number[] | undefined
		/** @internal */
		public init(colorsOrFunction: Color[] | ((t: number) => Color)) {
			this._colors = colorsOrFunction
			if ("function" != typeof colorsOrFunction) {
				this._pos = colorsOrFunction.map((_, i) => i / (colorsOrFunction.length - 1))
			}
			this._mode = "rgb"
			this.domain(0, 1)
			this._paddingLeft = 0
			this._paddingRight = 0
			this._correctLightness = false
			this._cache = new Map()
			this._gamma = 1
		}
		// public setColors(
		// 	colorsOrBrewerClass: Chromable[] | keyof typeof brewer | ((f: number) => Color) = ["#fff", "#000"],
		// ) {
		// 	if ("function" == typeof colorsOrBrewerClass) {
		// 		this._colors = colorsOrBrewerClass
		// 	} else {
		// 		const colors =
		// 			"string" == typeof colorsOrBrewerClass ? chroma.brewer[colorsOrBrewerClass] : colorsOrBrewerClass
		// 		this._colors = colors.map(c => chroma(c))
		// 		this._pos = colors.map((_, i) => i / (colors.length - 1))
		// 	}
		// 	this.resetCache()
		// 	return this._colors
		// }
		public classes(): number[]
		public classes(classes: number | number[]): this
		public classes(classes?: number | number[]) {
			if (undefined === classes) {
				return this._classes
			}
			if (Array.isArray(classes)) {
				this._classes = classes
				this.domain(classes[0], classes[classes.length - 1])
			} else {
				if (classes % 1 != 0 || classes < 1) throw new Error("invalid classes param")
				const d = chroma.analyze(this.domain())
				this._classes = chroma.limits(this.domain(), "e", classes)
			}
			return this
		}

		/**
		 * Get the domain.
		 * @return If _colors is a function, [this._min, this._max]. If _colors is an array of colors, an array with the
		 * same length as the number of colors.
		 * @example chroma.scale("red", "white", "blue").domain(0, 20).domain() // [0, 10, 20]
		 */
		public domain(): number[]
		/**
		 * Set the domain interval on which the scale is defined. Previous positions of colors will be scaled to match
		 * the new interval. By default, the colors are spaced evenly on the interval.
		 * @param start
		 * @param end
		 * @return `this`
		 * @example chroma.scale("red", "white", "blue").domain(0, 100)(50) // white
		 * @example chroma.scale("red", "white", "blue").domain(0, 0.25, 1).domain(0, 100).domain() // [0, 25, 100]
		 */
		public domain(start: number, end: number): this
		/**
		 * Set the domain interval and the individual positions of the colors. The number of passed values must match
		 * the number of colors which define the scale. Not valid if the scale is defined by a function.
		 * @param domain The positions of all scale colors. Values must be in ascending order and should not have
		 * duplicates.
		 * @return `this`
		 * @example
		 * const f = chroma.scale("red", "white", "blue").domain(0, 25, 100)
		 * f(25) // white
		 * f(100) // blue
		 * f(50) // #aaaaff
		 */
		public domain(...domain: number[]): this
		public domain(...domain: number[]): number[] | this {
			if (undefined === domain[0]) {
				return "function" !== typeof this._colors
					? this._pos!.map(p => lerp(this._min, this._max, p))
					: [this._min, this._max]
			}
			this._min = domain[0]
			this._max = domain[domain.length - 1]
			if (2 == domain.length) {
				if ("function" !== typeof this._colors) {
					this._pos = this._colors.map((_, c) => c / (this._colors.length - 1))
				}
			} else if (domain.length == this._colors.length && "function" !== typeof this._colors) {
				// equidistant positions
				this._pos = domain.map(d => (d - this._min) / (this._max - this._min))
			} else {
				throw new Error("invalid domain " + domain)
			}
			return this
		}

		/**
		 * Get the interpolation mode used when calculating colors.
		 */
		public mode(): InterpolationMode
		/**
		 * Set the interpolation mode used when calculating colors. The defaut mode is "rgb".
		 * See also {@link chroma#mix}
		 * @param mode the mode to set.
		 * @return `this`
		 * @example chroma.scale("red", "green").mode("lab")
		 * @example chroma.scale("red", "green").mode("lrgb")
		 */
		public mode(mode: InterpolationMode): this
		public mode(mode?: InterpolationMode) {
			if (undefined === mode) {
				return this._mode
			}
			this._mode = mode
			this.resetCache()
			return this
		}

		/**
		 * Set the output format return by `this(x)` and `this.colors(n)`.
		 * @param _o The color format to use. Pass `undefined` to return [Color] objects.
		 * @return `this`
		 * @example chroma.scale("red", "white").out("hex")(0) // "#ff0000"
		 * @example chroma.scale("red", "white").out("num").colors(2) // [0xff0000, 0xffffff]
		 */
		public out(_o: ColorFormat | undefined) {
			this._out = _o
			return this
		}
		public correctLightness(v = true) {
			if (this._correctLightness != v) this.resetCache()
			this._correctLightness = v
			return this
		}

		/**
		 * Get the padding.
		 * @returns [paddingLeft, paddingRight]
		 */
		public padding(): [number, number]
		/**
		 * Set the padding. Positive values will "cut off" the ends of gradient, while negative values will add a
		 * section of constant color at the ends.
		 * @example chroma.scale("red", "white").padding(0.1)(0) // chroma('#ff1a1a'), instead of red
		 * @example chroma.scale("red", "white").padding(-0.1)(0) // chroma('red')
		 * @param paddingLeft padding on left side.(lower-valued end of the interval).
		 * @param paddingRight padding on right (higher-valued end of the interval) defaults to paddingLeft.
		 */
		public padding(paddingLeft: number, paddingRight?: number): this
		public padding(paddingLeft?: number, paddingRight: number | undefined = paddingLeft) {
			if (!paddingLeft) {
				return [this._paddingLeft, this._paddingRight]
			}
			this._paddingLeft = paddingLeft
			this._paddingRight = paddingRight!
			return this
		}

		/**
		 * Get a number of equidistant colors.
		 * @param numColors The number of colors to return.
		 * @param format Output format. Defaults to `"hex"`. Pass `false` to get [Color] objects.
		 * @returns If `numColors` is `undefined`, the colors which define this [Scale]. If `numColors` is 1,
		 * `[this((min + max) / 2)]`. Otherwise, an array where the first element is `this(min)`, the last one is
		 * `this(max)` and the rest are equidistant samples between min and max.
		 */
		public colors(numColors?: number, format: ColorFormat | undefined | false = "hex") {
			let result: Color[]
			if (undefined === numColors) {
				result = (this._colors as Color[]).slice()
			} else if (numColors == 1) {
				result = [this((this._min + this._max) / 2)]
			} else if (numColors > 1) {
				result = Array.from({ length: numColors }, (_, i) =>
					this(lerp(this._min, this._max, i / (numColors - 1))),
				)
			} else {
				// returns all colors based on the defined classes
				let samples
				if (this._classes && this._classes.length > 2) {
					samples = Array.from(
						{ length: this._classes.length - 1 },
						(_, i) => (this._classes![i] + this._classes![i + 1]) * 0.5,
					)
				} else {
					samples = this.domain() // TODO?!
				}
				result = samples.map(this)
			}
			return format ? result.map(c => c[format]()) : result
		}

		/**
		 * Get whether the cache is enabled. Defaults to true.
		 */
		public cache(): boolean
		/**
		 * Enable or disable the cache.
		 * @param enableCache Whether the cache should be enabled.
		 * @return `this`
		 */
		public cache(enableCache: boolean): this
		public cache(enableCache?: boolean) {
			if (undefined === enableCache) {
				return !!this._cache
			}
			this._cache = enableCache ? this._cache || new Map() : undefined
			return this
		}

		/**
		 * Get the current gamma value. Defaults to 1.
		 */
		public gamma(): number
		/**
		 * Set the gamme value.Gamma-correction can be used to "shift" a scale's center more the the beginning (gamma <
		 * 1) or end (gamma > 1), typically used to "even" the lightness gradient. Default is 1.
		 * @example chroma.scale('YlGn').gamma(0.5);
chroma.scale('YlGn').gamma(1);
chroma.scale('YlGn').gamma(2);
		 */
		public gamma(gamma: number): this
		public gamma(gamma?: number) {
			if (undefined === gamma) {
				return this._gamma
			}
			this._gamma = gamma
			return this
		}

		public at(t: number) {
			const c = this.color(t)
			return this._out ? c[this._out]() : c
		}
		private getClass(value: number) {
			return this._classes!.findIndex(cls => value <= cls) - 1
		}

		private color(val: number, bypassMap = false) {
			let t
			if (!bypassMap) {
				const min = this._min,
					max = this._max
				if (this._classes && this._classes.length > 2) {
					const c = this.getClass(val)
					t = c / (this._classes.length - 2)
				} else if (max !== min) {
					t = (val - min) / (max - min)
				} else {
					t = 1
				}
				if (this._correctLightness) {
					t = this.tCorrectedLightness(t)
				}
			} else {
				t = val
			}
			t = t ** this._gamma
			t = (this._paddingLeft + t) / (1 + this._paddingLeft + this._paddingRight)
			//	t = this._paddingLeft + t * (1 - this._paddingLeft - this._paddingRight)
			t = clamp(t, 0, 1)
			const tHash = t
			const cacheResult = this._cache && this._cache.get(tHash)
			if (cacheResult) {
				return cacheResult
			} else {
				let col: Color
				if (Array.isArray(this._colors)) {
					for (let i = 0; i < this._pos!.length; i++) {
						const p = this._pos![i]
						if (t <= p) {
							col = this._colors[i]
							break
						}
						if (t >= p && i == this._pos!.length - 1) {
							col = this._colors[i]
							break
						}
						if (t > p && t < this._pos![i + 1]) {
							t = (t - p) / (this._pos![i + 1] - p)
							col = chroma.interpolate(this._colors[i], this._colors[i + 1], t, this._mode)
							break
						}
					}
				} else {
					col = this._colors(t)
				}
				if (this._cache) {
					this._cache.set(tHash, col!)
				}
				return col!
			}
		}
		private tCorrectedLightness(t0_1: number) {
			const L0 = this.color(0, true).lab()[0]
			const L1 = this.color(1, true).lab()[0]
			const L_ideal = lerp(L0, L1, t0_1)
			return newtonIterate1d(t => this.color(t, true).lab()[0] - L_ideal, t0_1, 8)
		}
		private resetCache() {
			this._cache!.clear()
		}
	}

	export function scale(...colors: Chromable[]): Scale
	export function scale(colors: Chromable[] | keyof typeof brewer | ((f: number) => Color)): Scale
	export function scale(...args: any[]) {
		const f: Scale = (t => f.at(t)) as Scale
		;(Object.getOwnPropertyNames(Scale.prototype) as (keyof typeof Scale)[]).forEach(
			key => (f[key] = Scale.prototype[key]),
		)
		if (Array.isArray(args[0])) args = args[0]
		if (args.length == 1 && "string" == typeof args[0]) args = brewer[args[0] as keyof typeof brewer]

		f.init("function" == typeof args[0] ? args[0] : args.map(a => chroma(a)))
		//f.setColors(args.length > 1 ? args : args[0])
		return f
	}

	export namespace scales {
		export function cool() {
			return chroma.scale([chroma.hsl(180, 1, 0.9), chroma.hsl(250, 0.7, 0.4)])
		}

		export function hot() {
			return chroma.scale(["#000", "#f00", "#ff0", "#fff"]).mode("rgb")
		}
	}

	/**
	 * Computes the WCAG contrast ratio between two colors. A minimum contrast of 4.5:1 is recommended to ensure that
	 * text is still readable against a background color.
	 * @param a
	 * @param b
	 */
	export function contrast(a: Chromable, b: Chromable) {
		const l1 = chroma(a).luminance()
		const l2 = chroma(b).luminance()
		if (l1 > l2) {
			return (l1 + 0.05) / (l2 + 0.05)
		} else {
			return (l2 + 0.05) / (l1 + 0.05)
		}
	}

	/**
	 * Compute the euclidean distance between two colors.
	 * @param a First color.
	 * @param b Second color.
	 * @param mode The color space in which to compute the distance. Defaults to "lab".
	 */
	export function distance(a: Chromable, b: Chromable, mode: ColorMode = "lab") {
		const l1 = chroma(a)[mode]()
		const l2 = chroma(b)[mode]()
		const channelDifferences = l1.map(
			(channelValue: number, channelIndex: number) => channelValue - l2[channelIndex],
		)
		return Math.hypot(...channelDifferences)
	}

	export function deltaE(a: Chromable, b: Chromable, L = 1, C = 1) {
		const [L1, a1, b1] = chroma(a).lab()
		const [L2, a2, b2] = chroma(b).lab()
		const c1 = sqrt(a1 * a1 + b1 * b1)
		const c2 = sqrt(a2 * a2 + b2 * b2)
		const sl = L1 < 16.0 ? 0.511 : (0.040975 * L1) / (1.0 + 0.01765 * L1)
		const sc = (0.0638 * c1) / (1.0 + 0.0131 * c1) + 0.638
		let h1 = c1 < 0.000001 ? 0.0 : (atan2(b1, a1) * 180.0) / PI
		while (h1 < 0) {
			h1 += 360
		}
		while (h1 >= 360) {
			h1 -= 360
		}
		const t =
			h1 >= 164.0 && h1 <= 345.0
				? 0.56 + abs(0.2 * cos((PI * (h1 + 168.0)) / 180.0))
				: 0.36 + abs(0.4 * cos((PI * (h1 + 35.0)) / 180.0))
		const c4 = c1 * c1 * c1 * c1
		const f = sqrt(c4 / (c4 + 1900.0))
		const sh = sc * (f * t + 1.0 - f)
		const delL = L1 - L2
		const delC = c1 - c2
		const delA = a1 - a2
		const delB = b1 - b2
		const dH2 = delA * delA + delB * delB - delC * delC
		const v1 = delL / (L * sl)
		const v2 = delC / (C * sc)
		const v3 = sh
		return sqrt(v1 * v1 + v2 * v2 + dH2 / (v3 * v3))
	}
	type DataInfo = {
		min: number
		max: number
		sum: number
		values: number[]
		count: number
		domain: [number, number]
		limits(mode: LimitsMode, num: number): number[]
	}
	export function analyze(data: number[]): DataInfo {
		const r: DataInfo = {
			min: Infinity,
			max: -Infinity,
			sum: 0,
			values: [] as number[],
			count: 0,
		} as DataInfo
		function add(val: number) {
			if (val != undefined && !isNaN(val)) {
				r.values.push(val)
				r.sum += val
				if (val < r.min) r.min = val
				if (val > r.max) r.max = val
				r.count += 1
			}
		}
		data.forEach(val => add(val))
		r.domain = [r.min, r.max]
		r.limits = function(mode, num) {
			return chroma.limits(this, mode, num)
		}
		return r
	}

	type LimitsMode = "e" | "q" | "l" | "k"
	export function limits(data: number[] | DataInfo, mode: LimitsMode = "e", num = 7): number[] {
		const info = Array.isArray(data) ? chroma.analyze(data) : data
		const { min, max, values } = info
		values.sort((a, b) => a - b)
		if (num == 1) {
			return [min, max]
		}
		if (mode.startsWith("c")) {
			return [min, max]
		} else if (mode.startsWith("e")) {
			return Array.from({ length: num + 1 }, (_, i) => lerp(min, max, i / num))
		} else if (mode.startsWith("l")) {
			if (min <= 0) {
				throw new Error("Logarithmic scales are only possible for values > 0")
			}
			const min_log = Math.LOG10E * log(min)
			const max_log = Math.LOG10E * log(max)
			return Array.from({ length: num + 1 }, (_, i) => 10 ** lerp(min_log, max_log, i / num))
		} else if (mode.startsWith("q")) {
			return Array.from({ length: num + 1 }, (_, i) => {
				const p = ((values.length - 1) * i) / num
				const pb = floor(p)
				return pb == p ? values[pb] : lerp(values[pb], values[pb + 1], p - pb)
			})
		} else if (mode.startsWith("k")) {
			// implementation based on
			// http://code.google.com/p/figue/source/browse/trunk/figue.js#336
			// simplified for 1-d input values
			const n = values.length
			const assignments = new Array(n)
			const clusterSizes = new Array(num)
			let repeat = true
			let nb_iters = 0
			let centroids = Array.from({ length: num + 1 }, (_, i) => lerp(min, max, i / num))
			do {
				// assignment step
				clusterSizes.fill(0)
				for (let i = 0; i < values.length; i++) {
					const value = values[i]
					const minDistIndex = indexOfMax(centroids, c => -abs(c - value))
					clusterSizes[minDistIndex]++
					assignments[i] = minDistIndex
				}

				// update centroids step
				const newCentroids = new Array(num).fill(0)
				for (let i = 0; i < assignments.length; i++) {
					const cluster = assignments[i]
					newCentroids[cluster] += values[i]
				}
				for (let j = 0; j < newCentroids.length; j++) {
					newCentroids[j] /= clusterSizes[j]
				}

				// check convergence
				repeat = newCentroids.some((nc, j) => nc != centroids[j])
				centroids = newCentroids
			} while (nb_iters++ < 200 && repeat)

			// finished k-means clustering
			// the next part is borrowed from gabrielflor.it
			const kClusters: number[][] = Array.from({ length: num }, () => [])
			for (let i = 0; i < assignments.length; i++) {
				const cluster = assignments[i]
				kClusters[cluster].push(values[i])
			}
			const tmpKMeansBreaks = []
			for (const kCluster of kClusters) {
				tmpKMeansBreaks.push(kCluster[0], kCluster[kCluster.length - 1])
			}
			tmpKMeansBreaks.sort((a, b) => a - b)

			const limits = []
			limits.push(tmpKMeansBreaks[0])
			for (let i = 1; i < tmpKMeansBreaks.length; i += 2) {
				const v = tmpKMeansBreaks[i]
				if (!isNaN(v) && limits.indexOf(v) == -1) {
					limits.push(v)
				}
			}
			return limits
		} else {
			throw new Error("unknown mode")
		}
	}
}

const interpolators: {
	[mode: string]: (color1: Color, color2: Color, f: number, mode: InterpolationMode) => Color
} = {}

// const _guess_formats: { p: number; test: (args: any[]) => ColorFormat | undefined }[] = []
const _input: {
	[mode: string]: (...args: any[]) => RGB | RGBA
} = {}

function linear_interpolator(col1: Color, col2: Color, f: number, m: ColorMode) {
	const xyz1 = col1[m]()
	const xyz2 = col2[m]()
	return guess(
		[
			lerp(xyz1[0], xyz2[0], f),
			lerp(xyz1[1], xyz2[1], f),
			lerp(xyz1[2], xyz2[2], f),
			lerp(col1.alpha(), col2.alpha(), f),
		],
		m,
	)
}
interpolators.xyz = linear_interpolator as any
interpolators.rgb = linear_interpolator as any
interpolators.lab = linear_interpolator as any

interpolators.num = function(col1, col2, f) {
	const n1 = col1.num()
	const n2 = col2.num()
	return chroma.num(lerp(n1, n2, f))
}

interpolators.lrgb = function(col1, col2, f) {
	const [r1, g1, b1, a1] = col1.rgba(false, false)
	const [r2, g2, b2, a2] = col2.rgba(false, false)
	return new Color([
		Math.sqrt(r1 ** 2 * (1 - f) + r2 ** 2 * f),
		Math.sqrt(g1 ** 2 * (1 - f) + g2 ** 2 * f),
		Math.sqrt(b1 ** 2 * (1 - f) + b2 ** 2 * f),
		lerp(a1, a2, f),
	])
}

function _bezier(chromables: Chromable[]): (t: number) => Color {
	const colors = chromables.map(c => chroma(c))
	const [lab0, lab1, lab2, lab3] = colors.map(c => c.lab())
	if (2 == chromables.length) {
		// linear interpolation
		return t => {
			return chroma.lab([0, 1, 2].map(i => lerp(lab0[i], lab1[i], t)) as LAB)
		}
	} else if (3 == chromables.length) {
		// quadratic bezier interpolation
		const bezier2 = (p0: number, p1: number, p2: number, t: number) =>
			(1 - t) ** 2 * p0 + 2 * (1 - t) * t * p1 + t ** 2 * p2
		return t => chroma.lab([0, 1, 2].map(i => bezier2(lab0[i], lab1[i], lab2[i], t)) as LAB)
	} else if (4 == chromables.length) {
		// cubic bezier interpolation
		const bezier3 = (p0: number, p1: number, p2: number, p3: number, t: number) =>
			(1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3 * p3
		return t => chroma.lab([0, 1, 2].map(i => bezier3(lab0[i], lab1[i], lab2[i], lab3[i], t)) as LAB)
	} else if (5 == chromables.length) {
		const I0 = _bezier(colors.slice(0, 3))
		const I1 = _bezier(colors.slice(2, 5))
		return t => (t < 0.5 ? I0(t * 2) : I1((t - 0.5) * 2))
	} else throw new Error()
}

function guess(args: any[], mode?: ColorFormat): Color {
	if (Array.isArray(args[0])) args = args[0]
	if (!mode) {
		if (args.length == 1 && args[0] in chroma.w3cx11) {
			mode = "name"
		} else if (args.length == 1 && "string" == typeof args[0]) {
			mode = "css"
		} else if (args.length == 3) {
			mode = "rgb"
		} else if (args.length == 4 && "number" == typeof args[3] && args[3] >= 0 && args[3] <= 1) {
			mode = "rgb"
		} else if (args.length == 1 && "number" == typeof args[0] && args[0] >= 0 && args[0] <= 0xffffff) {
			mode = "num"
		} else throw new Error("could not guess mode. args " + JSON.stringify(args))
	}
	const rgb = _input[mode](...args)
	if (rgb.some(x => "number" != typeof x)) {
		throw new Error("invalid rgb")
	}
	return new Color(rgb)
}

function _average_lrgb(colors: Color[]) {
	let rSquareSum = 0,
		gSquareSum = 0,
		bSquareSum = 0,
		alphaSum = 0
	for (const col of colors) {
		const [r, g, b, alpha] = col.rgba(false, false)
		rSquareSum += r ** 2
		gSquareSum += g ** 2
		bSquareSum += b ** 2
		alphaSum += alpha
	}
	return new Color([
		Math.sqrt(rSquareSum) / colors.length,
		Math.sqrt(gSquareSum) / colors.length,
		Math.sqrt(bSquareSum) / colors.length,
		alphaSum / colors.length,
	])
}

function hex2rgb(hex: string): RGBA | RGB {
	let m
	if ((m = hex.match(/^#?([A-F\d]{2})([A-F\d]{2})([A-F\d]{2})([A-F\d]{2})?$/i))) {
		return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16), m[4] ? parseInt(m[4], 16) / 255 : 1]
	} else if ((m = hex.match(/^#?([A-F\d])([A-F\d])([A-F\d])([A-F\d])?$/i))) {
		return [
			parseInt(m[1], 16) * 0x11,
			parseInt(m[2], 16) * 0x11,
			parseInt(m[3], 16) * 0x11,
			m[4] ? (parseInt(m[4], 16) * 0x11) / 255 : 1,
		]
	}
	throw new Error("invalid hex color: " + hex)
}
// color mode, i.e. representation as array of number
export type ColorMode = "rgb" | "cmyk" | "lab" | "hsv" | "hsi" | "hcg" | "hsl" | "gl" | "hcl" | "lch" | "xyz"
export type InterpolationMode = ColorMode | "lrgb"
export type ColorFormat = ColorMode | "hex" | "num" | "name" | "kelvin" | "css"
type RGBA = [number, number, number, number]
type CMYK = [number, number, number, number]
type GL = [number, number, number, number]
type RGB = [number, number, number]
type LAB = [number, number, number]
type LCH = [number, number, number]
type HCL = [number, number, number]
type HSL = [number, number, number]
type HSV = [number, number, number]
type HSI = [number, number, number]
type XYZ = [number, number, number]
/**
 * HCG Color Model
 * See https://github.com/acterhd/hcg-color
 * A color value in the HCG format is an array of three numbers [h, c, g], where
 * `h` is the hue as an angle in degrees [0; 360)
 * `c` is the chroma value in [0; 1]
 * `g` is the gray value in [0; 1]
 */
type HCG = [number, number, number]
function rgb2hex(channels: RGBA, mode: "rgb" | "rgba" | "argb" = "rgb") {
	let [r, g, b, a] = channels
	r = clamp(Math.round(r), 0, 255)
	g = clamp(Math.round(g), 0, 255)
	b = clamp(Math.round(b), 0, 255)
	const rgb = (r << 16) | (g << 8) | b
	const rgbString = rgb.toString(16).padStart(6, "0")
	const alphaString = round(clamp(a) * 255)
		.toString(16)
		.padStart(2, "0")
	return "#" + ("argb" == mode ? alphaString + rgbString : "rgba" == mode ? rgbString + alphaString : rgbString)
}

_input.lrgb = _input.rgb

_input.hex = hex2rgb
function rgb2hsl(r: number, g: number, b: number): HSL {
	r /= 255
	g /= 255
	b /= 255
	const min = Math.min(r, g, b)
	const max = Math.max(r, g, b)
	const l = (max + min) / 2
	let s: number,
		hueTurnX6: number = 0
	if (max == min) {
		s = 0
		hueTurnX6 = 0
	} else {
		s = l < 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min)
		if (r == max) {
			hueTurnX6 = (g - b) / (max - min) + (g < b ? 6 : 0)
		} else if (g == max) {
			hueTurnX6 = 2 + (b - r) / (max - min)
		} else if (b == max) {
			hueTurnX6 = 4 + (r - g) / (max - min)
		}
	}
	return [hueTurnX6 * 60, s, l]
}
_input.hsl = hsl2rgb
function norm360(degrees: number) {
	return ((degrees % 360) + 360) % 360
}
function hsv2rgb(h: number, s: number, v: number, a: number = 1): RGBA {
	v *= 255
	if (s == 0) {
		return [v, v, v, a]
	} else {
		const hueTurnX6 = norm360(h / 60)
		const i = floor(hueTurnX6)
		const f = hueTurnX6 - i
		const p = v * (1 - s)
		const q = v * (1 - s * f)
		const t = v * (1 - s * (1 - f))
		if (h < 60) {
			return [v, t, p, a]
		} else if (h < 120) {
			return [q, v, p, a]
		} else if (h < 180) {
			return [p, v, t, a]
		} else if (h < 240) {
			return [p, q, v, a]
		} else if (h < 300) {
			return [t, p, v, a]
		} else {
			return [v, p, q, a]
		}
	}
}

function rgb2hsv(r: number, g: number, b: number): HSV {
	const min = Math.min(r, g, b)
	const max = Math.max(r, g, b)
	const delta = max - min
	const v = max / 255.0
	let hueTurnX6
	const s = max == 0 ? 0 : delta / max
	if (0 == delta) {
		hueTurnX6 = 0
	} else if (r == max) {
		hueTurnX6 = (g - b) / delta + (g < b ? 6 : 0)
	} else if (g == max) {
		hueTurnX6 = 2 + (b - r) / delta
	} else {
		hueTurnX6 = 4 + (r - g) / delta
	}
	return [hueTurnX6 * 60, s, v]
}

_input.hsv = hsv2rgb

function num2rgb(num: number): RGBA {
	if (!("number" == typeof num && num >= 0 && num <= 0xffffff)) {
		throw new Error("unknown num color: " + num)
	}
	const r = num >> 16
	const g = (num >> 8) & 0xff
	const b = num & 0xff
	return [r, g, b, 1]
}

function rgb2num(r: number, g: number, b: number) {
	return (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)
}

_input.num = num2rgb

function hcg2rgb(h: number, c: number, g: number, a = 1): RGBA {
	if (c == 0) {
		return [g * 255, g * 255, g * 255, a]
	} else {
		const hueTurnX6 = norm360(h / 60)
		const i = floor(hueTurnX6)
		const f = hueTurnX6 - i
		const p = g * (1 - c)
		const q = 255 * (p + c * (1 - f))
		const t = 255 * (p + c * f)
		const v = 255 * (p + c)
		if (0 == i) {
			return [v, t, p, a]
		} else if (1 == i) {
			return [q, v, p, a]
		} else if (2 == i) {
			return [p, v, t, a]
		} else if (3 == i) {
			return [p, q, v, a]
		} else if (4 == i) {
			return [t, p, v, a]
		} else {
			return [v, p, q, a]
		}
	}
}

function rgb2hcg(r: number, g: number, b: number): HCG {
	r /= 255
	g /= 255
	b /= 255
	const min = Math.min(r, g, b)
	const max = Math.max(r, g, b)
	const c = max - min
	const _g = c < 1 ? min / (1 - c) : 0
	let hueTurnX6 // angle as value between 0 and 6
	if (0 === c) {
		hueTurnX6 = 0
	} else if (r == max) {
		// second term to make sure the value is > 0
		hueTurnX6 = (g - b) / c + (b > g ? 6 : 0)
	} else if (g == max) {
		hueTurnX6 = 2 + (b - r) / c
	} else {
		hueTurnX6 = 4 + (r - g) / c
	}
	return [hueTurnX6 * 60, c, _g]
}

_input.hcg = hcg2rgb

const WS = "\\s*"
const FLOAT = "([+-]?(?:\\d*\\.?)?\\d+(?:[eE][+-]?\\d+)?)"
const CSS_RGB_REGEX = new RegExp(
	["^rgba?\\(", FLOAT, ",", FLOAT, ",", FLOAT, "(?:,", FLOAT + "(%)?", ")?\\)$"].join(WS),
	"i",
)
const CSS_RGB_WS_REGEX = new RegExp(["^rgba?\\(", FLOAT, FLOAT, FLOAT, "(?:/", FLOAT + "(%)?", ")?\\)$"].join(WS), "i")
const CSS_RGB_PERCENT_REGEX = new RegExp(
	["^rgba?\\(", FLOAT + "%", ",", FLOAT + "%", ",", FLOAT + "%", "(?:,", FLOAT + "(%)?", ")?\\)$"].join(WS),
	"i",
)
const CSS_RGB_WS_PERCENT_REGEX = new RegExp(
	["^rgba?\\(", FLOAT + "%", FLOAT + "%", FLOAT + "%", "(?:/", FLOAT + "(%)?", ")?\\)$"].join(WS),
	"i",
)
const CSS_HSL_REGEX = new RegExp(
	["^hsla?\\(", FLOAT + "(deg|rad|turn)?", ",", FLOAT + "%", ",", FLOAT + "%", "(?:,", FLOAT + "(%)?", ")?\\)$"].join(
		WS,
	),
	"i",
)
const CSS_HSL_WS_REGEX = new RegExp(
	["^hsla?\\(", FLOAT + "(deg|rad|turn)?\\s+" + FLOAT + "%", FLOAT + "%", "(?:/", FLOAT + "(%)?", ")?\\)$"].join(WS),
	"i",
)
function css2rgb(css: string): RGBA | RGB {
	if (chroma.w3cx11 && (chroma.w3cx11 as any)[css.toLowerCase()]) {
		return num2rgb((chroma.w3cx11 as any)[css.toLowerCase()])
	}
	let m
	if ((m = css.match(CSS_RGB_REGEX) || css.match(CSS_RGB_WS_REGEX))) {
		return [
			clamp(+m[1], 0, 255),
			clamp(+m[2], 0, 255),
			clamp(+m[3], 0, 255),
			m[4] ? clamp(m[5] ? +m[4] / 100 : +m[4]) : 1,
		]
	} else if ((m = css.match(CSS_RGB_PERCENT_REGEX) || css.match(CSS_RGB_WS_PERCENT_REGEX))) {
		return [
			clamp(+m[1] / 100) * 255,
			clamp(+m[2] / 100) * 255,
			clamp(+m[3] / 100) * 255,
			m[4] ? clamp(m[5] ? +m[4] / 100 : +m[4]) : 1,
		]
	} else if ((m = css.match(CSS_HSL_REGEX) || css.match(CSS_HSL_WS_REGEX))) {
		const CONVERSION = { deg: 1, rad: RAD2DEG, turn: 360 }
		const angleUnit = (m[2] ? m[2].toLowerCase() : "deg") as "deg" | "rad" | "turn"
		return hsl2rgb(
			(((+m[1] * CONVERSION[angleUnit]) % 360) + 360) % 360,
			clamp(+m[3] / 100),
			clamp(+m[4] / 100),
			m[5] ? clamp(m[6] ? +m[5] / 100 : +m[5]) : 1,
		)
	} else {
		return hex2rgb(css)
	}
}

function rgb2css(r: number, g: number, b: number, a = 1) {
	if (a >= 1) {
		return "rgb(" + [r, g, b].map(round).join(",") + ")"
	} else {
		return "rgba(" + [r, g, b].map(round).join(",") + "," + a + ")"
	}
}

function rnd(a: any) {
	return round(a * 100) / 100
}

function hsl2css([h, s, l]: HSL, alpha: number) {
	const mode = alpha < 1 ? "hsla" : "hsl"
	return (
		mode +
		"(" +
		rnd(h) +
		"," +
		rnd(s * 100) +
		"%" +
		"," +
		rnd(l * 100) +
		"%" +
		("hsla" == mode ? "," + rnd(alpha) : "") +
		")"
	)
}

_input.css = css2rgb

_input.name = function(name) {
	return num2rgb((chroma.w3cx11 as any)[name])
}

function lch2lab(l: number, c: number, hueDegrees: number): LAB {
	/*
    Convert from a qualitative parameter h and a quantitative parameter l to a 24-bit pixel.
    These formulas were invented by David Dalrymple to obtain maximum contrast without going
    out of gamut if the parameters are in the range 0-1.

    A saturation multiplier was added by Gregor Aisch
     */
	return [l, cos(hueDegrees * DEG2RAD) * c, sin(hueDegrees * DEG2RAD) * c]
}

function lch2rgb(l: number, c: number, h: number, alpha = 1): RGBA {
	const [, a, b] = lch2lab(l, c, h)
	return cielab2rgb(l, a, b, alpha)
}

function lab2lch(l: number, a: number, b: number): LCH {
	const c = Math.hypot(a, b)
	const h = (Math.atan2(b, a) * RAD2DEG + 360) % 360
	return [l, c, h]
}

function rgb2lch(r: number, g: number, b: number) {
	const [l, a, b2] = rgb2lab(r, g, b)
	return lab2lch(l, a, b2)
}

_input.lch = lch2rgb

_input.hcl = (h, c, l) => lch2rgb(l, c, h)

function rgb2cmyk(r: number, g: number, b: number): CMYK {
	r /= 255
	g /= 255
	b /= 255
	const k = 1 - Math.max(r, g, b)
	if (1 == k) return [0, 0, 0, 1]
	const c = (1 - r - k) / (1 - k)
	const m = (1 - g - k) / (1 - k)
	const y = (1 - b - k) / (1 - k)
	return [c, m, y, k]
}

function cmyk2rgb(c: number, m: number, y: number, k: number, alpha = 1): RGBA {
	if (k == 1) {
		return [0, 0, 0, alpha]
	}
	const r = c >= 1 ? 0 : 255 * (1 - c) * (1 - k)
	const g = m >= 1 ? 0 : 255 * (1 - m) * (1 - k)
	const b = y >= 1 ? 0 : 255 * (1 - y) * (1 - k)
	return [r, g, b, alpha]
}

_input.cmyk = cmyk2rgb

_input.gl = function(r: number, g: number, b: number, a: number = 1): RGBA {
	return [r * 255, g * 255, b * 255, a]
}

//function rgb2luminance(r: number, g: number, b: number) {
//	// https://en.wikipedia.org/wiki/Relative_luminance
//	const [, Y] = rgb2xyz(r, g, b)
//	return Y
//}

function rgbChannel2RgbLinear(xIn0_255: number) {
	const xIn0_1 = xIn0_255 / 255
	// http://entropymine.com/imageworsener/srgbformula/
	if (xIn0_1 <= 0.04045) {
		return xIn0_1 / 12.92
	} else {
		return ((xIn0_1 + 0.055) / 1.055) ** 2.4
	}
}
function rgbLinearChannel2Rgb(xLinearIn0_1: number) {
	if (xLinearIn0_1 <= 0.0031308) {
		return 255 * (12.92 * xLinearIn0_1)
	} else {
		return 255 * ((1 + 0.055) * xLinearIn0_1 ** (1 / 2.4) - 0.055)
	}
}

function kelvin2rgb(kelvin: number): RGB {
	const temp = kelvin / 100
	let r, g, b
	if (temp < 66) {
		r = 255
		g = -155.25485562709179 - 0.44596950469579133 * (temp - 2) + 104.49216199393888 * log(temp - 2)
		b = temp < 20 ? 0 : -254.76935184120902 + 0.8274096064007395 * (temp - 10) + 115.67994401066147 * log(temp - 10)
	} else {
		r = 351.97690566805693 + 0.114206453784165 * (temp - 55) - 40.25366309332127 * log(temp - 55)
		g = 325.4494125711974 + 0.07943456536662342 * (temp - 50) - 28.0852963507957 * log(temp - 50)
		b = 255
	}
	return [r, g, b]
}

_input.rgb = (...args: number[]) => args as RGB

function rgb2kelvin(r: number, g: number, b: number) {
	return newtonIterate1d(
		k => {
			const eps = 1e-9
			const [kr, kg, kb] = kelvin2rgb(k)
			const [kr2, kg2, kb2] = kelvin2rgb(k + eps)
			const dkr = (kr2 - kr) / eps,
				dkg = (kg2 - kg) / eps,
				dkb = (kb2 - kb) / eps
			return dkr * (kr - r) + dkg * (kg - g) + dkb * (kb - b)

			return kb / kr - b / r
		},
		//1000,
		//40000,
		Math.E ** ((b / r + 2.5) / 0.4),
		20,
		//1e-6,
	)
	let maxTemp = 40000
	let minTemp = 1000
	const eps = 0.4
	let temp: number = 0
	let rgb
	while (maxTemp - minTemp > eps) {
		temp = (maxTemp + minTemp) * 0.5
		rgb = kelvin2rgb(temp)
		if (rgb[2] / rgb[0] >= b / r) {
			maxTemp = temp
		} else {
			minTemp = temp
		}
	}
	return round(temp)
}

_input.temperature = _input.kelvin = _input.K = kelvin2rgb

function blend_f(f: (c1: RGB, c2: RGB) => RGB) {
	return function(bottom: Chromable, top: Chromable) {
		const [r, g, b] = f(chroma(top).rgb(), chroma(bottom).rgb())
		return chroma.rgb(r, g, b)
	}
}

function each(f: (a: number, b: number) => number) {
	return function(c1: RGB, c2: RGB): RGB {
		return c1.map((e, i) => f(e, c2[i])) as RGB
	}
}

function _screen(a: number, b: number) {
	return 255 * (1 - (1 - a / 255) * (1 - b / 255))
}

function _overlay(a: number, b: number) {
	if (b < 128) {
		return (2 * a * b) / 255
	} else {
		return 255 * (1 - 2 * (1 - a / 255) * (1 - b / 255))
	}
}

function _burn(a: number, b: number) {
	return 255 * (1 - (1 - b / 255) / (a / 255))
}

function _dodge(a: number, b: number) {
	if (a == 255) {
		return 255
	}
	return 255 * Math.min(1, b / 255 / (1 - a / 255))
}

function hsl2rgb(h: number, s: number, l: number, a = 1): RGBA {
	let r, g, b
	if (s == 0) {
		r = g = b = l * 255
	} else {
		const t3 = [0, 0, 0]
		const c = [0, 0, 0]
		const t2 = l < 0.5 ? l * (1 + s) : l + s - l * s
		const t1 = 2 * l - t2
		h /= 360
		t3[0] = h + 1 / 3
		t3[1] = h
		t3[2] = h - 1 / 3
		for (let i = 0; i <= 2; i++) {
			if (t3[i] < 0) {
				t3[i] += 1
			}
			if (t3[i] > 1) {
				t3[i] -= 1
			}
			if (6 * t3[i] < 1) {
				c[i] = t1 + (t2 - t1) * 6 * t3[i]
			} else if (2 * t3[i] < 1) {
				c[i] = t2
			} else if (3 * t3[i] < 2) {
				c[i] = t1 + (t2 - t1) * (2 / 3 - t3[i]) * 6
			} else {
				c[i] = t1
			}
		}
		;[r, g, b] = [c[0] * 255, c[1] * 255, c[2] * 255]
	}
	return [r, g, b, a]
}

function cielab2rgb(LStart: number, aStar: number, bStar: number, alpha = 1): RGBA {
	const [x, y, z] = cielab2xyz(LStart, aStar, bStar)
	return xyz2rgb(x, y, z, alpha)
}

function cielab2xyz(LStar: number, aStar: number, bStar: number) {
	function fInv(t: number) {
		if (t > LAB_delta) {
			return t ** 3
		} else {
			return LAB_3DeltaPow2 * (t - 4 / 29)
		}
	}
	return [
		LAB_Xn * fInv((LStar + 16) / 116 + aStar / 500),
		LAB_Yn * fInv((LStar + 16) / 116),
		LAB_Zn * fInv((LStar + 16) / 116 - bStar / 200),
	]
}
function xyz2cielab(x: number, y: number, z: number): LAB {
	// https://en.wikipedia.org/w/index.php?title=CIELAB_color_space&oldid=849576085#Forward_transformation
	function f(t: number) {
		if (t > LAB_deltaPow3) {
			return Math.cbrt(t)
		} else {
			return t / LAB_3DeltaPow2 + 4 / 29
		}
	}
	return [116 * f(y / LAB_Yn) - 16, 500 * (f(x / LAB_Xn) - f(y / LAB_Yn)), 200 * (f(y / LAB_Yn) - f(z / LAB_Zn))]
}

// const LAB_CONSTANTS = {
const LAB_Kn = 18
const LAB_Xn = 0.95047
const LAB_Yn = 1
const LAB_Zn = 1.08883
const LAB_delta = 0.206896552 // delta = 6 / 29
const LAB_3DeltaPow2 = 0.12841855 // 3 * delta ** 2
const LAB_deltaPow3 = 0.008856452 // delta ** 3
// }

function rgb2lab(r: number, g: number, b: number): RGB {
	const [x, y, z] = rgb2xyz(r, g, b)
	return xyz2cielab(x, y, z)
}

function rgb2xyz(r: number, g: number, b: number): XYZ {
	// https://en.wikipedia.org/wiki/SRGB#The_reverse_transformation
	const rLinear = rgbChannel2RgbLinear(r)
	const gLinear = rgbChannel2RgbLinear(g)
	const bLinear = rgbChannel2RgbLinear(b)
	const X = 0.4124564 * rLinear + 0.3575761 * gLinear + 0.1804375 * bLinear
	const Y = 0.2126729 * rLinear + 0.7151522 * gLinear + 0.072175 * bLinear
	const Z = 0.0193339 * rLinear + 0.119192 * gLinear + 0.9503041 * bLinear
	return [X, Y, Z]
}
function xyz2rgb(X0_1: number, Y0_1: number, Z0_1: number, alpha0_1 = 1): RGBA {
	// https://en.wikipedia.org/wiki/SRGB#The_forward_transformation_(CIE_XYZ_to_sRGB)
	const rLinear = 3.2404542 * X0_1 - 1.5371385 * Y0_1 - 0.4985314 * Z0_1
	const gLinear = -0.969266 * X0_1 + 1.8760108 * Y0_1 + 0.041556 * Z0_1
	const bLinear = 0.0556434 * X0_1 - 0.2040259 * Y0_1 + 1.0572252 * Z0_1
	return [rgbLinearChannel2Rgb(rLinear), rgbLinearChannel2Rgb(gLinear), rgbLinearChannel2Rgb(bLinear), alpha0_1]
}

_input.xyz = xyz2rgb
_input.lab = cielab2rgb

function hsi2rgb(hDegrees: number, s: number, i: number, a = 1): RGBA {
	/*
    borrowed from here:
    http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/hsi2rgb.cpp
     */
	let r, g, b
	let hRad = hDegrees * DEG2RAD
	if (hRad < (2 * PI) / 3) {
		b = (1 - s) / 3
		r = (1 + (s * cos(hRad)) / cos(PI / 3 - hRad)) / 3
		g = 1 - (b + r)
	} else if (hRad < (4 * PI) / 3) {
		hRad -= (2 * PI) / 3
		r = (1 - s) / 3
		g = (1 + (s * cos(hRad)) / cos(PI / 3 - hRad)) / 3
		b = 1 - (r + g)
	} else {
		hRad -= (4 * PI) / 3
		g = (1 - s) / 3
		b = (1 + (s * cos(hRad)) / cos(PI / 3 - hRad)) / 3
		r = 1 - (g + b)
	}
	return [3 * i * r * 255, 3 * i * g * 255, 3 * i * b * 255, a]
}

function rgb2hsi(r: number, g: number, b: number): HSI {
	/*
    borrowed from here:
    http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/rgb2hsi.cpp
     */
	r /= 255
	g /= 255
	b /= 255
	const i = (r + g + b) / 3
	let h, s
	if (r == g && g == b) {
		h = 0
		s = 0
	} else {
		const min = Math.min(r, g, b)
		h = Math.acos((r - g + (r - b)) / 2 / Math.sqrt((r - g) ** 2 + (r - b) * (g - b)))
		if (b > g) {
			h = TWOPI - h
		}
		s = 1 - min / i
	}
	return [h * RAD2DEG, s, i]
}

_input.hsi = hsi2rgb

function interpolate_hsx(color1: Color, color2: Color, f: number, m: "hsv" | "hsl" | "hsi" | "hcl" | "lch" | "hcg") {
	if ("lch" == m) m = "hcl"
	if (m.substr(0, 1) !== "h") {
		throw new Error()
	}
	const [hue0, sat0, lbv0] = color1[m]()
	const [hue1, sat1, lbv1] = color2[m]()
	let dh
	if (hue1 > hue0 && hue1 - hue0 > 180) {
		dh = hue1 - (hue0 + 360)
	} else if (hue1 < hue0 && hue0 - hue1 > 180) {
		dh = hue1 + 360 - hue0
	} else {
		dh = hue1 - hue0
	}
	const hue = hue0 + f * dh
	return chroma[m](hue, lerp(sat0, sat1, f), lerp(lbv0, lbv1, f))
}

;["hsv", "hsl", "hsi", "hcl", "lch", "hcg"].forEach(mode => (interpolators[mode] = interpolate_hsx as any))

function indexOfMax<T>(arr: ArrayLike<T>, f: (el: T) => number) {
	let maxValue = -Infinity,
		maxValueIndex = -1
	for (let i = 0; i < arr.length; i++) {
		const value = f(arr[i])
		if (value > maxValue) {
			maxValue = value
			maxValueIndex = i
		}
	}
	return maxValueIndex
}
function withMax<T>(arr: ArrayLike<T>, f: (el: T) => number): T {
	return arr[indexOfMax(arr, f)]
}
