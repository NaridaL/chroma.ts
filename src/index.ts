/**
 * @license
 *
 * js - JavaScript library for color conversions
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
 */

// tslint:disable:no-unnecessary-qualifier

const { abs, atan2, cos, floor, log, min, max, round, sign, sin, sqrt, cbrt, PI, hypot } = Math

function lerp(a: number, b: number, f: number) {
	return a + (b - a) * f
}
function lerpInv(a: number, b: number, f: number) {
	return (f - a) / (b - a)
}
function clamp(x: number, min = 0, max = 1) {
	return x < min ? min : x > max ? max : x
}

function newtonIterate1d(f: (x: number) => number, xStart: number, max_steps: number, eps: number = 1e-8): number {
	let x = xStart,
		fx
	while (max_steps-- && abs((fx = f(x))) > eps) {
		const dfdx = (f(x + eps) - fx) / eps
		console.log("fx / dfdx", fx / dfdx, "fx", fx, "x", x)
		x = x - fx / dfdx
	}
	return x
}
function bisect(f: (x: number) => number, a: number, b: number, steps: number) {
	//assert(a < b)
	let fA = f(a)
	// let fB = f(b)
	//assert(fA * fB < 0)
	while (steps--) {
		const c = (a + b) / 2
		const fC = f(c)
		// console.log("fC", fC, "c", c)
		if (sign(fA) == sign(fC)) {
			a = c
			fA = fC
		} else {
			b = c
			// fB = fC
		}
	}
	//assert(a <= (b + a) / 2)
	//assert(b >= (b + a) / 2)
	return (a + b) / 2
}

const TWOPI = 2 * PI

const DEG2RAD = PI / 180

const RAD2DEG = 180 / PI
/**
 * @param alpha1 default=1
 * @example chroma.color(99, 99, 44, 0.7)
 */
export function color(red255: number, green255: number, blue255: number, alpha1?: number): Color
/**
 * @example chroma.color('mediumorchid') // a css string
 * @example chroma.color([56, 203, 30]) // a RGB triple
 * @example chroma.color(0x4b0082) // a hex num
 * @example chroma.color([30, 0.8, 0.3], 'hsl') // explicit format
 */
export function color(x: Chromable, format?: ColorFormat): Color
/**
 * This overload allows VS Code to suggest color names when you type `color('`.
 */
export function color(colorname: keyof typeof w3cx11, format?: "name"): Color
/** @example chroma.color(30, 0.8, 0.3, 'hsl') */
export function color(channel0: number, channel1: number, channel2: number, format: ColorFormat): Color
/** @example chroma.color(0.3, 0.8, 0.3, 1, 'gl') */
export function color(
	channel0: number,
	channel1: number,
	channel2: number,
	channel3: number,
	format: ColorFormat,
): Color
export function color(...args: any[]) {
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
/**
 * A Chromable is any value which can be converted to a color. For ease of use, most functions accept these instead of
 * only Color values.
 */
export type Chromable = number | string | Color | number[]

export class Color {
	/** @internal */
	constructor(
		private readonly r: number,
		private readonly g: number,
		private readonly b: number,
		private readonly a = 1,
	) {}

	// public shade() {
	// 	const shades: [string, string, number][] = [
	// 		["ff0000", "red"],
	// 		["ffa500", "orange"],
	// 		["ffff00", "yellow"],
	// 		["008000", "green"],
	// 		["0000ff", "blue"],
	// 		["ee82ee", "violet"],
	// 		["a52a2a", "brown"],
	// 		["000000", "black"],
	// 		["808080", "grey"],
	// 		["ffffff", "white"],
	// 	] as any
	// 	function angleDiff(a: number, b: number) {
	// 		const d = (a - b) % 360
	// 		if (d > 180) return d - 360
	// 		if (d < -180) return d + 360
	// 		return d
	// 	}
	// 	shades.forEach(arr => arr.push(color(arr[0]).hsl()[0]))
	// 	const [h, s, l] = this.hsl()
	// 	if (l > 0.9) return "white"
	// 	if (l > 0.8 && s < 0.2) return "white"
	// 	if (s < 0.1) return "grey"
	// 	if (s < 0.4 && h > 0 && h < 48) return "brown"

	// 	const distanceInXYZ: { [hue: number]: number } = { 0: 0 }
	// 	for (let i = 60; i <= 360; i += 60) {
	// 		distanceInXYZ[i] =
	// 			distanceInXYZ[i - 60] + distance(hsl(i - 60, 1, 0.5), hsl(i, 1, 0.5), "xyz")
	// 	}
	// 	// console.log(distanceInXYZ)

	// 	const shadeEnds: { [hue: number]: number } = {
	// 		0: 9,
	// 		38: 48,
	// 		60: 65,
	// 		120: 165,
	// 		240: 245,
	// 		300: 338,
	// 		360: 369,
	// 	}

	// 	const getColorDistanceAlongXYZHue = (hueDegrees: number) => {
	// 		const base = hueDegrees - (hueDegrees % 60)
	// 		return (
	// 			distanceInXYZ[base] + distance(hsl(base, 1, 0.5), hsl(hueDegrees, 1, 0.5), "xyz")
	// 		)
	// 	}
	// 	const colorXYZD = getColorDistanceAlongXYZHue(this.hsl()[0])
	// 	const md = distanceInXYZ[360]
	// 	const shadeHue =
	// 		(Object.keys(shadeEnds) as any[]).find(shadeHue => shadeEnds[shadeHue | 0] >= this.hsl()[0])! % 360
	// 	return shades.find(([_hex, _name, _hue]) => (_hue | 0) === shadeHue)![1]
	// 	// process.exit()
	// 	return withMax(shades, ([_hex, _name, _hue]) => {
	// 		return -abs(angleDiff(this.hsl()[0], _hue))
	// 	})[1]
	// 	return withMax(shades, ([_hex, _name, _hue]) => {
	// 		const [thisL, thisA, thisB] = this.lab()
	// 		const [L, A, B] = color(_hex).lab()
	// 		return -hypot(thisL - L, thisA - A, thisB - B)
	// 	})[1]
	// }

	/**
	 * @see [[mix]]
	 */
	public mix(col2: Chromable, f: number, m: InterpolationMode = "rgb") {
		return mix(this, col2, f, m)
	}
	public rgb(doRound = true, clamp_ = true): RGB {
		const f = (t: number) => {
			if (doRound) t = round(t)
			if (clamp_) t = clamp(t, 0, 255)
			return t
		}
		const { r, g, b } = this
		return [f(r), f(g), f(b)]
	}
	public rgba(doRound = true, clamp_ = true): RGBA {
		const f = (t: number) => {
			if (doRound) t = round(t)
			if (clamp_) t = clamp(t, 0, 255)
			return t
		}
		const { r, g, b, a } = this
		return [f(r), f(g), f(b), a]
	}

	/**
	 * Return a hex-string representation of this color.
	 *
	 * @param mode
	 * @see #num for a hex-number representation.
	 * @example chroma.color('yellow').alpha(0.7).hex()
	 * @example chroma.color('yellow').alpha(0.7).hex('rgba')
	 * @example chroma.color('yellow').alpha(0.7).hex('argb')
	 */
	public hex(mode: "rgb" | "rgba" | "argb" = "rgb") {
		const { r, g, b, a } = this
		return rgb2hex(r, g, b, a, mode)
	}

	/**
	 * Returns the [HSL] representation of this color. hue will always be in [0;360). Values are never NaN.
	 *
	 * @example chroma.color('purple').hsl()
	 */
	public hsl(): HSL {
		const { r, g, b } = this
		return rgb2hsl(r, g, b)
	}

	/**
	 * Returns the [HSL] representation of this color. hue will always be in [0;360). Values are never NaN.
	 *
	 * @example chroma.color('purple').hsv()
	 */
	public hsv() {
		const { r, g, b } = this
		return rgb2hsv(r, g, b)
	}

	/**
	 * Returns the [HSL] representation of this color. hue will always be in [0;360). Values are never NaN.
	 *
	 * @example chroma.color('purple').hcg()
	 */
	public hcg() {
		const { r, g, b } = this
		return rgb2hcg(r, g, b)
	}

	/**
	 * Returns a CSS `rgb(...)` or `hsl(...)` string representation that can be used as CSS-color definition. The alpha
	 * value is not output if it 1.
	 * @example chroma.color('teal').css() // == "rgb(0,128,128)"
	 * @example chroma.color('teal').alpha(0.5).css() // == "rgba(0,128,128,0.5)"
	 * @example chroma.color('teal').css('hsl') // == "hsl(180,100%,25.1%)"
	 */
	public css(mode: "rgb" | "hsl" = "rgb") {
		if ("rgb" == mode) {
			const { r, g, b, a } = this
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
	 * @param closest Whether this should find the closest color name. default=false
	 * @return If `closest == false`, the name of this color or `undefined` if there is no match. Otherwise, will always
	 * return a color name.
	 * @example chroma.color('#ff0000').name() // == "red"
	 * @example chroma.color('#ff0001').name() // == undefined
	 * @example chroma.color('#ff0001').name(true) // == "red"
	 */
	public name(closest?: boolean): string | undefined
	public name(closest: boolean = false): string | undefined {
		const thisNum = this.num()
		const name = Object.keys(w3cx11).find((name) => (w3cx11 as any)[name] == thisNum)
		if (!name && closest) {
			const [thisLStar, thisAStar, thisBStar] = this.lab()
			return withMax(Object.keys(w3cx11) as (keyof typeof w3cx11)[], (name) => {
				const [lStar, aStar, bStar] = num(w3cx11[name]).lab()
				return -hypot(thisLStar - lStar, thisAStar - aStar, thisBStar - bStar)
			})
		}
		return name
	}

	/**
	 * Get the [CMYK](#CMYK) representation of this color.
	 *
	 * @example chroma.color('red').cmyk()
	 */
	public cmyk() {
		const { r, g, b } = this
		return rgb2cmyk(r, g, b)
	}

	/**
	 * Returns the [GL] representation of this color.
	 * @example chroma.color('33cc00').gl()
	 */
	public gl(): GL {
		const { r, g, b, a } = this
		return [r / 255, g / 255, b / 255, a]
	}

	/**
	 * Get luminance of the color. This is equal to the Y channel of the XYZ color space.
	 * @example chroma.color('black').luminance() // == 0
	 * @example chroma.color('white').luminance() // == 1
	 * @example chroma.color('red').luminance() // == ~0.21
	 * @see https://en.wikipedia.org/wiki/Relative_luminance
	 */
	public luminance(): number
	/**
	 * Return a new [Color] with `lum1` by linearly interpolating `this` with white (when increasing the luminance) or
	 * black (otherwise) in the [XYZ] color space.
	 * @see https://en.wikipedia.org/wiki/Relative_luminance
	 * @example // Approximately doubling the luminance of red
	 * @example chroma.color('red').luminance(0.4) // == #ff8686 // "Vivid Tangerine"
	 * @param lum1 The desired luminance.
	 */
	public luminance(lum1: number): this
	public luminance(lum1?: number) {
		const { r, g, b, a } = this
		const [, Y] = rgb2xyz(r, g, b)
		if (undefined === lum1) {
			return Y
		}
		const inverseLerp = (a: number, b: number, val: number) => (val - a) / (b - a)
		if (lum1 > Y) {
			// lerp to white
			return mix(this, white, inverseLerp(Y, 1, lum1), "xyz").alpha(a)
		} else {
			// lerp to black
			return mix(black, this, inverseLerp(0, Y, lum1), "xyz").alpha(a)
		}
	}

	/**
	 * Get color temperature of this color in Kelvin. This only makes sense for colors close to those output by
	 * kelvin
	 *
	 * @example [c = chroma.color('#ff3300'), c.temperature()]
	 * @example [c = chroma.color('#ffe3cd'), c.temperature()]
	 * @example [c = chroma.color('#b3ccff'), c.temperature()]
	 */
	public temperature() {
		const { r, g, b } = this
		return rgb2kelvin(r, g, b)
	}

	/**
	 * Returns a new [Color] with a channel changed.
	 * @example chroma.color('skyblue').set('hsl.h', 0) // change hue to 0 deg (=red)
	 * @example chroma.color('hotpink').set('lch.c', 30) // set chromaticity to 30
	 * @example chroma.color('orangered').set('lab.l', x => x / 2) // half Lab lightness
	 * @example chroma.color('darkseagreen').set('lch.c', x => x * 2) // double Lch saturation
	 */
	public set(modeAndChannel: string, value: number | ((channel: number) => number)) {
		const [mode, channel] = modeAndChannel.split(".") as [ColorMode, string]
		const src = this[mode]()
		const i = mode.indexOf(channel)
		if (-1 == i) throw new Error("invalid channel")
		src[i] = "number" == typeof value ? value : value(src[i])
		return color(src, mode).alpha(this.a)
	}

	/**
	 * Returns whether this color is outside the RGB color cube and will be clipped/clamped when calling .rgb()
	 *
	 * @example [c = chroma.lch( 20, 40, 50), c.clipped()]
	 * @example [c = chroma.lch( 40, 40, 50), c.clipped()]
	 * @example [c = chroma.lch( 60, 40, 50), c.clipped()]
	 * @example [c = chroma.lch( 80, 40, 50), c.clipped()]
	 * @example [c = chroma.lch(100, 40, 50), c.clipped()]
	 */
	public clipped() {
		const { r, g, b } = this
		return !(0 <= r && r <= 255 && 0 <= g && g <= 255 && 0 <= b && b <= 255)
	}

	/**
	 * Returns black or white, whichever has the highest contrast to `this`.
	 * In the readme you should see the result of this.
	 *
	 * @example chroma.color('red')
	 * @example chroma.color('yellow')
	 */
	public textColor() {
		return this.luminance() > 0.5 ? black : white
	}

	/**
	 * Get alpha value of color.
	 * @example chroma.rgb(0, 0, 255, 0.5).alpha() // == 0.5
	 */
	public alpha(): number
	/**
	 * Return new [Color] with given alpha value.
	 * @example chroma.color('green').alpha(0.3)
	 * @example chroma.color('green').alpha(0.3).hex('rgba') // == "#00ff004d"
	 * @param alpha1 The desired alpha value.
	 */
	public alpha(alpha1: number): Color
	public alpha(alpha1?: number): number | Color {
		if (undefined === alpha1) {
			return this.a
		}
		const { r, g, b } = this
		return rgb(r, g, b, alpha1)
	}

	public darker(amount = 1) {
		const [l, a, b] = this.lab()
		return lab(l - LAB_Kn * amount, a, b, this.alpha())
	}

	/**
	 *
	 * @param amount
	 * @example chroma.color('hotpink')
	 * @example chroma.color('hotpink').brighter()
	 * @example chroma.color('hotpink').brighter(2)
	 * @example chroma.color('hotpink').brighter(3)
	 */
	public brighter(amount = 1) {
		return this.darker(-amount)
	}

	/**
	 * Returns a new [Color] with increased saturation.
	 * @param amount How much.
	 * @example chroma.color('slategray')
	 * @example chroma.color('slategray').saturate()
	 * @example chroma.color('slategray').saturate(2)
	 * @example chroma.color('slategray').saturate(3)
	 */
	public saturate(amount = 1) {
		const [l, c, h] = this.lch()
		return lch(l, max(0, c + amount * LAB_Kn), h, this.alpha())
	}

	/**
	 * Equivalent to `saturate(-amount)`.
	 * @see #saturate
	 */
	public desaturate(amount = 1) {
		return this.saturate(-amount)
	}

	public premultiplied() {
		const { r, g, b, a } = this
		return rgb(r * a, g * a, b * a, a)
	}

	/**
	 * Returns the [HSI] representation of this color. hue will always be in [0; 360). Values are never NaN.
	 *
	 * @example chroma.color('purple').hsi()
	 */
	public hsi() {
		const { r, g, b } = this
		return rgb2hsi(r, g, b)
	}

	/**
	 * Returns the [LAB] representation of this color.
	 *
	 * @example chroma.color('purple').lab()
	 */
	public lab() {
		const { r, g, b } = this
		return rgb2lab(r, g, b)
	}

	/**
	 * Return a hex-num of this color.
	 *
	 * @param mode
	 * @see #num for a hex-number representation.
	 * @example chroma.color('yellow').alpha(0.7).hex()
	 * @example chroma.color('yellow').alpha(0.7).hex('rgba')
	 * @example chroma.color('yellow').alpha(0.7).hex('argb')
	 */
	public num(mode: "rgb" | "rgba" | "argb" = "rgb") {
		const { r, g, b, a } = this
		return rgb2num(r, g, b, a, mode)
	}

	/**
	 * Returns the [LCH] representation of this color. hue will always be in [0; 360). Values are never NaN.
	 *
	 * @example chroma.color('purple').lch()
	 */
	public lch() {
		const { r, g, b } = this
		return rgb2lch(r, g, b)
	}

	/**
	 * Returns the [XYZ] representation of this color. hue will always be in [0; 360). Values are never NaN.
	 *
	 * @example chroma.color('purple').xyz()
	 */
	public xyz() {
		const { r, g, b } = this
		return rgb2xyz(r, g, b)
	}

	/**
	 * Whether this [Color](#Color) is identical (strict equality of r, g, b, a) to `color`.
	 */
	public equals(color: Color) {
		const { r, g, b, a } = this
		const { r: r2, g: g2, b: b2, a: a2 } = color
		return r == r2 && g == g2 && b == b2 && a == a2
	}

	public hashCode() {
		return this.num("rgba")
	}

	/**
	 * @example chroma.color('red').toSource() // == "rgb(255, 0, 0)"
	 * @example chroma.rgb(-2, 100.02, 200, 0.5).toSource() // == "rgb(-2, 100.02, 200, 0.5)"
	 */
	public toSource() {
		const { r, g, b, a } = this
		return "chroma.rgb(" + r + ", " + g + ", " + b + (a === 1 ? ")" : ", " + a + ")")
	}
}
export interface Color {
	toString(): string
	//darker(amount: number): Color
	//brighter(amount: number): Color
	kelvin(): number
}
Color.prototype.toString = Color.prototype.css
Color.prototype.kelvin = Color.prototype.temperature
/**
 * @example chroma.black
 */
export const black = new Color(0, 0, 0, 1)

/**
 * @example chroma.black
 */
export const white = new Color(255, 255, 255, 1)

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
 *
 * @example chroma.Object.keys(w3cx11).slice(0, 4)
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

/**
 * Return a new [[CubeHelix]].
 *
 * @example chroma.cubehelix() // use the default helix
 * @example chroma.cubehelix().start(200).rotations(-0.5).gamma(0.8).lightness([0.3, 0.8])
 */
export function cubehelix(
	start = 300,
	rotations = -1.5,
	hue: number | [number, number] = 1,
	gamma = 1,
	lightness: number | [number, number] = [0, 1],
) {
	const f: CubeHelix = ((t) => f.at(t)) as CubeHelix
	;(Object.getOwnPropertyNames(CubeHelix.prototype) as (keyof typeof CubeHelix)[]).forEach(
		(key) => (f[key] = CubeHelix.prototype[key]),
	)
	f.start(start)
	f.rotations(rotations)
	f.hue(hue)
	f.gamma(gamma)
	f.lightness(lightness)
	return f
}

/**
 * [Dave Green's cubehelix color scheme](http://www.mrao.cam.ac.uk/~dag/CUBEHELIX/)!
 *
 * A CubeHelix is a function defined on [0, 1] which returns colors.
 */
export interface CubeHelix {
	(f: number): Color
}
export class CubeHelix {
	private _start!: number
	private _rotations!: number
	private _gamma!: number
	private _hue!: [number, number]
	private _lightness!: [number, number]

	public start(): number
	public start(s: number): this
	public start(s?: number) {
		if (undefined === s) {
			return this._start
		}
		this._start = s
		return this
	}

	public rotations(): number
	public rotations(r: number): this
	public rotations(r?: number) {
		if (undefined === r) {
			return this._rotations
		}
		this._rotations = r
		return this
	}

	public gamma(): number
	public gamma(g: number): this
	public gamma(g?: number) {
		if (undefined === g) {
			return this._gamma
		}
		this._gamma = g
		return this
	}

	public hue(): [number, number]
	public hue(h: number | [number, number]): this
	public hue(h?: number | [number, number]) {
		if (undefined === h) {
			return this._hue
		}
		this._hue = Array.isArray(h) ? h : [h, h]
		return this
	}

	public lightness(): [number, number]
	public lightness(h: number | [number, number]): this
	public lightness(h?: number | [number, number]) {
		if (undefined === h) {
			return this._lightness
		}
		this._lightness = Array.isArray(h) ? h : [h, h]
		return this
	}

	/**
	 * Convert to a [[Scale]].
	 *
	 * @example chroma.cubehelix().scale().correctLightness().domain(2, 22)
	 */
	public scale() {
		return scale(this)
	}

	public at(fract: number) {
		const a = TWOPI * ((this._start + 120) / 360 + this._rotations * fract)
		const l = lerp(this._lightness[0], this._lightness[1], fract) ** this._gamma
		const h = lerp(this._hue[0], this._hue[1], fract)
		const amp = (h * l * (1 - l)) / 2
		const cos_a = cos(a)
		const sin_a = sin(a)
		const r = l + amp * (-0.14861 * cos_a + 1.78277 * sin_a)
		const g = l + amp * (-0.29227 * cos_a - 0.90649 * sin_a)
		const b = l + amp * (+1.97294 * cos_a)
		return rgb([r * 255, g * 255, b * 255, 1])
	}
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
// export function randomLab(randomSource = Math.random) {
// 	const labAMin = -87,
// 		labAMax = 99,
// 		labBMin = -108,
// 		labBMax = 95
// 	let maxIterations = 100
// 	while (maxIterations--) {
// 		const u = randomSource(),
// 			v = randomSource(),
// 			w = randomSource()
// 		// The following matrix multiplication transform the random point (u v w) in the unit cube into the
// 		// oriented bounding box (OBB) of the projection of the RGB space into the LAB space. This is necessary to
// 		// avoid a huge number of misses.
// 		const color = lab(
// 			u * -53.903 + v * -88.755 + w * 71.7 + 99.707,
// 			u * -82.784 + v * 187.036 + w * -2.422 + -28.17,
// 			u * -75.813 + v * -141.406 + w * -48.261 + 152.469,
// 		)
// 		console.log(color.lab())
// 		console.log(color.rgba(false, false))
// 		if (!color.clipped()) return color
// 	}
// 	throw new Error("Could find a random color in 100 iterations")
// }

/**
 * Mixes two colors. The mix ratio is a value between 0 and 1.
 * The color mixing produces different results based the color space used for interpolation.
 *
 * @param col2
 * @param f
 * @param m
 * @example chroma.mix('red', 'blue')
 * @example chroma.mix('red', 'blue', 0.25)
 * @example chroma.mix('red', 'blue', 0.75)
 *
 * @example chroma.mix('red', 'blue', 0.5, 'rgb')
 * @example chroma.mix('red', 'blue', 0.5, 'hsl')
 * @example chroma.mix('red', 'blue', 0.5, 'lab')
 * @example chroma.mix('red', 'blue', 0.5, 'lch')
 * @example chroma.mix('red', 'blue', 0.5, 'lrgb')
 */
export function mix(col1: Chromable, col2: Chromable, f = 0.5, m: InterpolationMode = "rgb") {
	const c1 = color(col1)
	const c2 = color(col2)
	const res = interpolators[m] && ((interpolators as any)[m](c1, c2, f, m) as Color)
	if (!res) {
		throw new Error("color mode " + m + " is not supported")
	}
	return res.alpha(lerp(c1.alpha(), c2.alpha(), f))
}

/**
 * Parse a CSS color. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color) for all the possible
 * variants.
 *
 * @example chroma.css('hsl(2rad 90% 50% / 0.9)')
 * @example chroma.css('laserlemon')
 */
export function css(cssString: string) {
	const [r, g, b, a] = css2rgb(cssString)
	return new Color(r, g, b, a)
}

/**
 * @example chroma.cmyk(0.2, 0.8, 0, 0)
 * @example chroma.color(0.2, 0.8, 0, 0, 'cmyk')
 */
export function cmyk(cmyk: CMYK): Color
export function cmyk(cyan1: number, magenta1: number, yellow1: number, key1: number): Color
export function cmyk(...args: any[]) {
	return guess(args, "cmyk")
}

/**
 * @example chroma.gl(1, 1, 0, 1)
 */
export function gl(gl: RGBA | RGB): Color
/**
 * @example chroma.gl([1, 0, 1, 0.5])
 */
export function gl(red1: number, green1: number, blue1: number, alpha1: number): Color
export function gl(...args: any[]) {
	return guess(args, "gl")
}

export function hcg(hcg: HCG): Color
/**
 * @param alpha1 default=1
 */
export function hcg(h: number, c: number, g: number, alpha1?: number): Color
export function hcg(...args: any[]) {
	return guess(args, "hcg")
}

export function lch(lch: LCH): Color
/**
 * @param alpha1 default=1
 */
export function lch(h: number, c: number, l: number, alpha1?: number): Color
export function lch(...args: any[]) {
	return guess(args, "lch")
}

export function hsi(hsi: HSI): Color
/**
 * @param alpha1 default=1
 */
export function hsi(h: number, s: number, i: number, alpha1?: number): Color
export function hsi(...args: any[]) {
	return guess(args, "hsi")
}

export function hsl(hsl: HSL): Color
/**
 * @param alpha1 default=1
 * @example chroma.hsl(30, 1, 0.5)
 * @example chroma.hsl(30, 0.6, 0.5)
 */
export function hsl(hueDegrees: number, saturation1: number, lightness1: number, alpha1?: number): Color
export function hsl(...args: any[]) {
	return guess(args, "hsl")
}

export function hsv(hsv: LAB): Color
export function hsv(h: number, s: number, v: number): Color
export function hsv(...args: any[]) {
	return guess(args, "hsv")
}

/**
 *
 * @param temperature
 * @example chroma.kelvin(2000) // candle light
 * @example chroma.kelvin(3500) // sunset
 * @example chroma.kelvin(6500) // daylight
 * @example x0_1 => chroma.kelvin(x0_1 * 30000) // effective range: [0; 30000]
 */
export function kelvin(temperature: number) {
	const [r, g, b] = kelvin2rgb(temperature)
	return new Color(r, g, b)
}

export function lab(lab: LAB): Color
/**
 * @param alpha1 default=1
 */
export function lab(lightness1: number, a1: number, b: number, alpha1?: number): Color
export function lab(...args: any[]) {
	return guess(args, "lab")
}

/**
 * @example chroma.num(0x663399) // rebeccapurple
 */
export function num(num: number) {
	const [r, g, b] = num2rgb(num)
	return new Color(r, g, b)
}

export function rgb(rgb: RGBA | RGB): Color
/**
 * @param alpha1 default=1
 * @example chroma.rgb(0, 100, 200)
 */
export function rgb(red255: number, green255: number, blue255: number, alpha1?: number): Color
export function rgb(...args: any[]) {
	return guess(args, "rgb")
}

export function xyz(xyz: XYZ): Color
/** @param alpha1 default=1 */
export function xyz(x1: number, y1: number, z1: number, alpha1?: number): Color
export function xyz(...args: any[]) {
	return guess(args, "xyz")
}

/**
 * Similar to mix, but accepts more than two colors.
 *
 * @example colors = ['#ddd', 'yellow', 'red', 'teal']
 * @example chroma.average(colors) // default = 'rgb'
 * @example chroma.average(colors, 'lab')
 * @example chroma.average(colors, 'lch')
 * @example chroma.average(colors, 'lrgb')
 * @example chroma.average(['red', 'rgba(0,0,0,0.5)']).css()
 */
export function average(chromables: Chromable[], mode: InterpolationMode = "rgb") {
	const colors = chromables.map((c) => color(c))
	if (mode == "lrgb") {
		return _average_lrgb(colors)
	}
	if (mode == "num") {
		let numSum = 0,
			alphaSum = 0
		for (const col of colors) {
			numSum += col.num()
			alphaSum += col.alpha()
		}
		return num(numSum / colors.length).alpha(alphaSum / colors.length)
	}
	const xyz = [0, 0, 0]
	let dx = 0
	let dy = 0
	let alphaSum = 0
	for (const c of colors) {
		const xyz2 = c[mode]()
		alphaSum += c.alpha()

		for (let i = 0; i < xyz.length; i++) {
			if (mode.charAt(i) == "h") {
				const A = xyz2[i] * DEG2RAD
				dx += cos(A)
				dy += sin(A)
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
	return guess(xyz, mode).alpha(alphaSum / colors.length)
}

/**
 *
 * @param chromables
 * @example chroma.scale('black', 'red', 'gold') // linear interpolation
 * @example chroma.bezier('black', 'red', 'gold') // bezier interpolation
 */
export function bezier(chromables: Chromable[]): { (t: number): Color; scale(): Scale }
export function bezier(...chromables: Chromable[]): { (t: number): Color; scale(): Scale }
export function bezier(...args: any[]) {
	const chromables: Chromable[] = Array.isArray(args[0]) ? args[0] : args
	const f = _bezier(chromables) as { (t: number): Color; scale(): Scale }
	f.scale = CubeHelix.prototype.scale
	return f
}

/**
 * Blends two colors using RGB channel-wise blend functions.
 * @param bottom
 * @param top
 * @param mode
 * @example chroma.blend('4CBBFC', 'EEEE22', 'multiply')
 * @example chroma.blend('4CBBFC', 'EEEE22', 'darken')
 * @example chroma.blend('4CBBFC', 'EEEE22', 'lighten')
 */
export function blend(bottom: Chromable, top: Chromable, mode: BlendMode) {
	if (!blend_fs[mode]) {
		throw new Error("unknown blend mode " + mode)
	}
	return blend_fs[mode](bottom, top)
}
export type BlendMode = keyof typeof blend_fs
const blend_fs = {
	normal: blend_f(each((a, _) => a)),
	multiply: blend_f(each((a, b) => (a * b) / 255)),
	screen: blend_f(each(_screen)),
	overlay: blend_f(each(_overlay)),
	darken: blend_f(each(min)),
	lighten: blend_f(each(max)),
	dodge: blend_f(each(_dodge)),
	burn: blend_f(each(_burn)),
}

/**
 * @param colors
 * @example scale = chroma.scale(['yellow', '008ae5'])
 * @example scale(0.25)
 * @example scale(0.5)
 * @example scale(0.75)
 * @example chroma.scale('Viridis')
 */
export function scale(colors: Chromable[] | keyof typeof brewer | ((f: number) => Color)): Scale
export function scale(...colors: Chromable[]): Scale
export function scale(...args: any[]) {
	const f: Scale = ((t) => (f as any)._at(t)) as Scale
	;(Object.getOwnPropertyNames(Scale.prototype) as (keyof typeof Scale)[]).forEach(
		(key) => (f[key] = Scale.prototype[key]),
	)
	if (Array.isArray(args[0])) args = args[0]
	if (args.length == 1 && "string" == typeof args[0]) args = brewer[args[0] as keyof typeof brewer]
	;(f as any)._init("function" == typeof args[0] ? args[0] : args.map((a) => color(a)))
	//f.setColors(args.length > 1 ? args : args[0])
	return f
}
/**
 * A color scale, created with scale, is a function that maps numeric values to a color palette.
 *
 * The type parameter describes the output type and can be changed with out(). Defaults to Color objects.
 *
 * @param T The output format. default=Color
 * @example chroma.scale('Purples')
 * @example chroma.scale('Purples')(0.4)
 */
export interface Scale<T = Color> {
	(val: number): T
}
export class Scale<T = Color> {
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

	/**
	 * Get the current scale classes.
	 */
	public classes(): number[]
	/**
	 * Make the scale return a number of distint color instead of a continuous gradient.
	 * If you pass a number the scale will broken into equi-distant classes:
	 *
	 * @example chroma.scale('OrRd') // continous
	 * @example chroma.scale('OrRd').classes(5) // equidistant classes
	 * @example chroma.scale('OrRd').classes(8)
	 *
	 * @example chroma.scale('OrRd').classes([0, 6, 11, 17, 20]) // also sets domain
	 */
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
			// const d = analyze(this.domain())
			this._classes = limits(this.domain(), "e", classes)
		}
		return this
	}

	/**
	 * Get the domain.
	 * @return If _colors is a function, [this._min, this._max]. If _colors is an array of colors, an array with the
	 * same length as the number of colors.
	 * @example chroma.scale("red", "white", "blue").domain(0, 20).domain() // == [0, 10, 20]
	 */
	public domain(): number[]
	/**
	 * Set the domain interval on which the scale is defined. Colors are distributed equidistantly along the
	 * interval.
	 * @param start
	 * @param end
	 * @return `this`
	 * @example chroma.scale("red", "white", "blue").domain(0, 100)(50) // == white
	 * @example chroma.scale("red", "white", "blue").domain(0, 0.25, 1).domain(0, 100).domain() // == [0, 25, 100]
	 */
	public domain(start: number, end: number): this
	/**
	 * Set the domain interval and the individual positions of the colors. The number of passed values must match
	 * the number of colors which define the scale. Not valid if the scale is defined by a function.
	 * @param domain The positions of all scale colors. Values must be in ascending order and should not have
	 * duplicates.
	 * @return `this`
	 * @example scale = chroma.scale("red", "white", "blue").domain(0, 25, 100)
	 * @example scale(25) // == white
	 * @example scale(100) // == blue
	 * @example scale(50) // == #aaaaff
	 */
	public domain(...domain: number[]): this
	public domain(...domain: number[]): number[] | this {
		if (undefined === domain[0]) {
			return "function" !== typeof this._colors
				? this._pos!.map((p) => lerp(this._min, this._max, p))
				: [this._min, this._max]
		}
		this._min = domain[0]
		this._max = domain[domain.length - 1]
		if (2 == domain.length) {
			if ("function" !== typeof this._colors) {
				// equidistant positions
				this._pos = this._colors.map((_, c) => c / (this._colors.length - 1))
			}
		} else if ("function" !== typeof this._colors && domain.length == this._colors.length) {
			this._pos = domain.map((d) => lerpInv(this._min, this._max, d))
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
		this._resetCache()
		return this
	}

	/**
	 * Set the output format return by `this(x)` and `this.colors(n)`.
	 * @param outputFormat The color format to use. Pass `undefined` to return [Color] objects.
	 * @return `this`
	 * @example chroma.scale("red", "white").out("hex")(0) // == "#ff0000"
	 * @example chroma.scale("red", "white").out("num").colors(2) // == [0xff0000, 0xffffff]
	 */
	public out<M extends ColorFormat | undefined>(
		outputFormat: M,
	): Scale<M extends ColorFormat ? ReturnType<Color[M]> : Color> {
		this._out = outputFormat
		return this as any
	}

	/**
	 * This makes sure the lightness range is spread evenly across a color scale. Especially useful when working
	 * with [multi-hue color scales](https://www.vis4.net/blog/2013/09/mastering-multi-hued-color-scales/), where
	 * simple gamma correction can't help you very much.
	 *
	 * @example chroma.scale('black','red','yellow','white')
	 * @example chroma.scale('black','red','yellow','white').correctLightness()
	 */
	public correctLightness(enableCorrectLightness = true) {
		if (this._correctLightness != enableCorrectLightness) {
			this._resetCache()
			const colors = this._colors
			if (enableCorrectLightness && "function" !== typeof colors) {
				// make sure that the colors have ascending or descending lightnesses
				let sign = 0
				for (let i = 1; i < colors.length; i++) {
					const sign2 = colors[i].lab()[0] - colors[i - 1].lab()[0]
					if (0 == sign) {
						sign = sign2
					} else if (sign * sign2 < 0) {
						throw new Error("scale color lightnesses must be monotonic")
					}
				}
			}
		}
		this._correctLightness = enableCorrectLightness
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
	 * @example chroma.scale("red", "white").padding(0.2)
	 * @example chroma.scale("red", "white").padding(0.1)(0) // == color('#ff1a1a'), instead of red
	 * @example chroma.scale("red", "white").padding(-0.1)(0) // == color('red')
	 * @param paddingLeft padding on left side.(lower-valued end of the interval).
	 * @param paddingRight padding on right (higher-valued end of the interval).
	 * default=paddingLeft
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
	 * @param format Output format. Defaults to `"hex"`. Pass `"color"` to get {@link Color} objects.
	 * @returns If `numColors` is `undefined`, the colors which define this [Scale]. If `numColors` is 1,
	 * `[this((min + max) / 2)]`. Otherwise, an array where the first element is `this(min)`, the last one is
	 * `this(max)` and the rest are equidistant samples between min and max.
	 * @example chroma.scale('OrRd').colors(5)
	 * @example chroma.scale(['white', 'black']).colors(12)
	 */
	public colors<M extends ColorFormat | "color" | undefined = "hex">(
		numColors?: number,
		format: M = "hex" as any,
	): Array<M extends ColorFormat ? ReturnType<Color[M]> : M extends "color" ? Color : string> {
		let result: Color[]
		if (undefined === numColors) {
			result = (this._colors as Color[]).slice()
		} else if (numColors == 1) {
			result = [this._color((this._min + this._max) / 2)]
		} else if (numColors > 1) {
			result = Array.from({ length: numColors }, (_, i) =>
				this._color(lerp(this._min, this._max, i / (numColors - 1))),
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
			result = samples.map((s) => this._color(s))
		}

		return (format != "color" ? result.map((c) => c[format as "hex"]()) : result) as any
	}

	/**
	 * Get whether the cache is enabled. Defaults to true.
	 */
	public cache(): boolean
	/**
	 * Enable or disable the cache.
	 * @param enableCache Whether the cache should be enabled.
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
	 * Set the gamma value. Gamma-correction can be used to "shift" a scale's center more the the beginning (gamma <
	 * 1) or end (gamma > 1), typically used to "even" the lightness gradient. Default is 1.
	 * @example chroma.scale('YlGn').gamma(0.5)
	 * @example chroma.scale('YlGn').gamma(1)
	 * @example chroma.scale('YlGn').gamma(2)
	 */
	public gamma(gamma: number): this
	public gamma(gamma?: number) {
		if (undefined === gamma) {
			return this._gamma
		}
		this._gamma = gamma
		return this
	}

	/**
	 * @ignore
	 */
	public _at(t: number) {
		const c = this._color(t)
		return this._out ? c[this._out]() : c
	}

	/**
	 * @ignore
	 */
	public _init(colorsOrFunction: Color[] | ((t: number) => Color)) {
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

	private _getClass(value: number) {
		return this._classes!.findIndex((cls) => value <= cls) - 1
	}

	private _color(val: number, bypassMap = false) {
		let t
		if (!bypassMap) {
			const min = this._min,
				max = this._max
			if (this._classes && this._classes.length > 2) {
				const c = this._getClass(val)
				t = c / (this._classes.length - 2)
			} else if (max !== min) {
				t = (val - min) / (max - min)
			} else {
				t = 1
			}
			if (this._correctLightness) {
				t = this._tCorrectedLightness(t)
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
						col = mix(this._colors[i], this._colors[i + 1], t, this._mode)
						break
					}
				}
			} else {
				col = this._colors(t)
			}
			if (this._cache) {
				// tslint:disable-next-line
				this._cache.set(tHash, col!)
			}
			// tslint:disable-next-line
			return col!
		}
	}
	private _tCorrectedLightness(t0_1: number) {
		const L0 = this._color(0, true).lab()[0]
		const L1 = this._color(1, true).lab()[0]
		const L_ideal = lerp(L0, L1, t0_1)
		return bisect((t) => this._color(t, true).lab()[0] - L_ideal, 0, 1, 8)
	}
	private _resetCache() {
		if (this._cache) this._cache.clear()
	}
}

export namespace scales {
	/**
	 * @example chroma.scales.cool()
	 */
	export function cool() {
		return scale([hsl(180, 1, 0.9), hsl(250, 0.7, 0.4)])
	}

	/**
	 * @example chroma.scales.hot()
	 */
	export function hot() {
		return scale(["#000", "#f00", "#ff0", "#fff"]).mode("rgb")
	}
}

/**
 * Computes the WCAG contrast ratio between two colors. A minimum contrast of 4.5:1
 * [is recommended](http://www.w3.org/TR/WCAG20-TECHS/G18.html) to ensure that text is still readable against a
 * background color.
 *
 * @param a
 * @param b
 */
export function contrast(a: Chromable, b: Chromable) {
	const l1 = color(a).luminance()
	const l2 = color(b).luminance()
	if (l1 > l2) {
		return (l1 + 0.05) / (l2 + 0.05)
	} else {
		return (l2 + 0.05) / (l1 + 0.05)
	}
}

/**
 * Compute the [euclidean distance](https://en.wikipedia.org/wiki/Euclidean_distance#Three_dimensions) between two
 * colors in a given color space.
 * @param a First color.
 * @param b Second color.
 * @param mode The color space in which to compute the distance. Defaults to "lab".
 * @example chroma.distance('#fff', '#ff0', 'rgb')
 * @example chroma.distance('#fff', '#f0f', 'rgb')
 * @example chroma.distance('#fff', '#ff0')
 * @example chroma.distance('#fff', '#f0f')
 */
export function distance(a: Chromable, b: Chromable, mode: ColorMode = "lab") {
	const l1 = color(a)[mode]()
	const l2 = color(b)[mode]()
	const channelDifferences = l1.map((channelValue: number, channelIndex: number) => channelValue - l2[channelIndex])
	return hypot(...channelDifferences)
}

/**
 * Computes color difference as developed by the Colour Measurement Committee of the Society of Dyers and Colourists
 * (CMC) in 1984. The implementation is adapted from Bruce Lindbloom. The parameters L and C are weighting factors
 * for lightness and chromaticity.
 * @param reference
 * @param sample
 * @param L
 * @param C
 * @example [r = '#ededee', s = '#edeeed', chroma.deltaE(r, s)]
 * @example [r = '#ececee', s = '#eceeec', chroma.deltaE(r, s)]
 * @example [r = '#e9e9ee', s = '#e9eee9', chroma.deltaE(r, s)]
 * @example [r = '#e4e4ee', s = '#e4eee4', chroma.deltaE(r, s)]
 * @example [r = '#e0e0ee', s = '#e0eee0', chroma.deltaE(r, s)]
 */
export function deltaE(reference: Chromable, sample: Chromable, L = 1, C = 1) {
	const [L1, a1, b1] = color(reference).lab()
	const [L2, a2, b2] = color(sample).lab()
	const c1 = sqrt(a1 * a1 + b1 * b1)
	const c2 = sqrt(a2 * a2 + b2 * b2)
	const sl = L1 < 16.0 ? 0.511 : (0.040975 * L1) / (1.0 + 0.01765 * L1)
	const sc = (0.0638 * c1) / (1.0 + 0.0131 * c1) + 0.638
	const h1 = norm360(c1 < 0.000001 ? 0.0 : atan2(b1, a1) * RAD2DEG)
	const t =
		h1 >= 164.0 && h1 <= 345.0
			? 0.56 + abs(0.2 * cos((h1 + 168.0) * DEG2RAD))
			: 0.36 + abs(0.4 * cos((h1 + 35.0) * DEG2RAD))
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
	data.forEach((val) => add(val))
	r.domain = [r.min, r.max]
	r.limits = function (mode, num) {
		return limits(this, mode, num)
	}
	return r
}

type LimitsMode = "c" | "e" | "q" | "l" | "k"
export function limits(data: number[] | DataInfo, mode: LimitsMode = "e", num = 7): number[] {
	const info = Array.isArray(data) ? analyze(data) : data
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
				const minDistIndex = indexOfMax(centroids, (c) => -abs(c - value))
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

const interpolators: { [K in InterpolationMode]?: (color1: Color, color2: Color, f: number, mode: K) => Color } = {}

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
interpolators.xyz = interpolators.rgb = interpolators.lab = linear_interpolator

interpolators.num = function (col1, col2, f) {
	const n1 = col1.num()
	const n2 = col2.num()
	return num(lerp(n1, n2, f))
}

interpolators.lrgb = function (col1, col2, f) {
	const [r1, g1, b1, a1] = col1.rgba(false, false)
	const [r2, g2, b2, a2] = col2.rgba(false, false)
	return new Color(
		sqrt(r1 ** 2 * (1 - f) + r2 ** 2 * f),
		sqrt(g1 ** 2 * (1 - f) + g2 ** 2 * f),
		sqrt(b1 ** 2 * (1 - f) + b2 ** 2 * f),
		lerp(a1, a2, f),
	)
}

function _bezier(chromables: Chromable[]): (t: number) => Color {
	const colors = chromables.map((c) => color(c))
	const [lab0, lab1, lab2, lab3] = colors.map((c) => c.lab())
	if (2 == chromables.length) {
		// linear interpolation
		return (t) => {
			return lab([0, 1, 2].map((i) => lerp(lab0[i], lab1[i], t)) as LAB)
		}
	} else if (3 == chromables.length) {
		// quadratic bezier interpolation
		const bezier2 = (p0: number, p1: number, p2: number, t: number) =>
			(1 - t) ** 2 * p0 + 2 * (1 - t) * t * p1 + t ** 2 * p2
		return (t) => lab([0, 1, 2].map((i) => bezier2(lab0[i], lab1[i], lab2[i], t)) as LAB)
	} else if (4 == chromables.length) {
		// cubic bezier interpolation
		const bezier3 = (p0: number, p1: number, p2: number, p3: number, t: number) =>
			(1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3 * p3
		return (t) => lab([0, 1, 2].map((i) => bezier3(lab0[i], lab1[i], lab2[i], lab3[i], t)) as LAB)
	} else if (5 == chromables.length) {
		const I0 = _bezier(colors.slice(0, 3))
		const I1 = _bezier(colors.slice(2, 5))
		return (t) => (t < 0.5 ? I0(t * 2) : I1((t - 0.5) * 2))
	} else throw new Error()
}

function guess(args: any[], mode?: ColorFormat): Color {
	if (Array.isArray(args[0])) args = args[0]
	if (!mode) {
		if (args.length == 1 && args[0] in w3cx11) {
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
	const channels = _input[mode](...args)
	return new Color(channels[0], channels[1], channels[2], undefined !== channels[3] ? channels[3] : 1)
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
	return new Color(
		sqrt(rSquareSum) / colors.length,
		sqrt(gSquareSum) / colors.length,
		sqrt(bSquareSum) / colors.length,
		alphaSum / colors.length,
	)
}

function hex2rgb(hex: string): RGBA {
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
export type ColorMode = "rgb" | "cmyk" | "lab" | "hsv" | "hsi" | "hcg" | "hsl" | "gl" | "lch" | "xyz"
export type InterpolationMode = "rgb" | "lab" | "hsv" | "hsi" | "hcg" | "hsl" | "lch" | "xyz" | "lrgb" | "num"
export type ColorFormat = ColorMode | "hex" | "num" | "name" | "kelvin" | "css"
/**
 * CMYK color space
 * @see https://en.wikipedia.org/wiki/cmyk_color_model
 * [cyan, magenta, yellow, alpha1]
 */
type CMYK = [number, number, number, number]
/**
 * WebGL colors. Like RGB, but floats in [0; 1] instead of 0-255.
 * [red255, green255, blue255, alpha1]
 */
type GL = [number, number, number, number]
/**
 * Red, green, blue ranging from 0-255.
 * Can be floats and outside the above range internally.
 */
type RGB = [number, number, number]
/**
 * RGB plus alpha ranging from 0-1
 * [red255, green255, blue255, alpha1]
 */
type RGBA = [number, number, number, number]
/**
 * CIELAB color space
 * [lightness, A*, B*]
 * @see https://en.wikipedia.org/wiki/CIELAB_color_space
 */
type LAB = [number, number, number]
/**
 * Cylindrical representation of CIELAB
 * @see https://en.wikipedia.org/wiki/CIELAB_color_space#Cylindrical_representation:_CIELCh_or_CIEHLC
 *
 */
type LCH = [number, number, number]
/**
 * @see https://en.wikipedia.org/wiki/HSL_and_HSV
 * [hueDegrees, saturation1, lightness1]
 */
type HSL = [number, number, number]
/**
 * @see https://en.wikipedia.org/wiki/HSL_and_HSV
 * [hueDegrees, saturation1, value1]
 */
type HSV = [number, number, number]
/**
 * @see https://en.wikipedia.org/w/index.php?title=HSI_color_space&redirect=no
 * [hueDegrees, saturation1, intensity1]
 */
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

// interface ColorModes {
// 	cmyk: CMYK
// 	gl: GL
// 	rgb: RGB
// 	rgba: RGBA
// 	lab: LAB
// 	hsl: HSL
// 	hsv: HSV
// 	hsi: HSI
// 	xyz: XYZ
// 	hcg: HCG
// 	lch: LCH
// 	hex: string
// 	num: number
// 	name: string
// 	kelvin: number
// 	css: string
// }
function rgb2hex(r255: number, g255: number, b255: number, a1: number, mode: "rgb" | "rgba" | "argb" = "rgb") {
	r255 = clamp(round(r255), 0, 255)
	g255 = clamp(round(g255), 0, 255)
	b255 = clamp(round(b255), 0, 255)
	const rgb = (r255 << 16) | (g255 << 8) | b255
	const rgbString = rgb.toString(16).padStart(6, "0")
	const alphaString = round(clamp(a1) * 255)
		.toString(16)
		.padStart(2, "0")
	return "#" + ("argb" == mode ? alphaString + rgbString : "rgba" == mode ? rgbString + alphaString : rgbString)
}

_input.lrgb = _input.rgb

_input.hex = hex2rgb
_input.hsl = hsl2rgb
function norm360(degrees: number) {
	return ((degrees % 360) + 360) % 360
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

function rgb2num(r255: number, g255: number, b255: number, a1: number = 1, mode: "rgb" | "rgba" | "argb" = "rgb") {
	const rgbNum = (round(r255) << 16) | (round(g255) << 8) | round(b255)
	if ("rgb" === mode) {
		return rgbNum
	} else if ("rgba" === mode) {
		return (rgbNum << 8) | (round(a1 * 255) << 24)
	} else {
		return (round(a1 * 255) << 24) | rgbNum
	}
}

_input.num = num2rgb

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
function css2rgb(css: string): RGBA {
	if (w3cx11 && w3cx11.hasOwnProperty(css)) {
		return num2rgb((w3cx11 as any)[css.toLowerCase()])
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

_input.name = function (name) {
	return num2rgb((w3cx11 as any)[name])
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

function lch2rgb(l: number, c: number, hDegrees: number, alpha1 = 1): RGBA {
	const [, a, b] = lch2lab(l, c, hDegrees)
	return cielab2rgb(l, a, b, alpha1)
}

function lab2lch(l: number, a: number, b: number): LCH {
	const c = hypot(a, b)
	const h = (atan2(b, a) * RAD2DEG + 360) % 360
	return [l, c, h]
}

function rgb2lch(r255: number, g255: number, b255: number) {
	const [l, a, b2] = rgb2lab(r255, g255, b255)
	return lab2lch(l, a, b2)
}

_input.lch = lch2rgb

function rgb2cmyk(r255: number, g255: number, b255: number): CMYK {
	r255 /= 255
	g255 /= 255
	b255 /= 255
	const k = 1 - max(r255, g255, b255)
	if (1 == k) return [0, 0, 0, 1]
	const c = (1 - r255 - k) / (1 - k)
	const m = (1 - g255 - k) / (1 - k)
	const y = (1 - b255 - k) / (1 - k)
	return [c, m, y, k]
}

function cmyk2rgb(c1: number, m1: number, y1: number, k1: number, alpha1 = 1): RGBA {
	if (k1 == 1) {
		return [0, 0, 0, alpha1]
	}
	const r255 = 255 * (1 - c1) * (1 - k1)
	const g255 = 255 * (1 - m1) * (1 - k1)
	const b255 = 255 * (1 - y1) * (1 - k1)
	return [r255, g255, b255, alpha1]
}

_input.cmyk = cmyk2rgb

_input.gl = function (r: number, g: number, b: number, a: number = 1): RGBA {
	return [r * 255, g * 255, b * 255, a]
}

//function rgb2luminance(r: number, g: number, b: number) {
//	// https://en.wikipedia.org/wiki/Relative_luminance
//	const [, Y] = rgb2xyz(r, g, b)
//	return Y
//}

function rgbChannel2RgbLinear(x255: number) {
	const x1 = x255 / 255
	// http://entropymine.com/imageworsener/srgbformula/
	if (x1 <= 0.04045) {
		return x1 / 12.92
	} else {
		return ((x1 + 0.055) / 1.055) ** 2.4
	}
}
function rgbLinearChannel2Rgb(xLinear1: number) {
	if (xLinear1 <= 0.0031308) {
		return 255 * (12.92 * xLinear1)
	} else {
		return 255 * ((1 + 0.055) * xLinear1 ** (1 / 2.4) - 0.055)
	}
}

function kelvin2rgb(kelvin: number): RGB {
	const t = kelvin / 100
	let r, g, b
	if (t < 66) {
		r = 255
		g = -155.25485562709179 - 0.44596950469579133 * (t - 2) + 104.49216199393888 * log(t - 2)
		b = t < 20 ? 0 : -254.76935184120902 + 0.8274096064007395 * (t - 10) + 115.67994401066147 * log(t - 10)
	} else {
		r = 351.97690566805693 + 0.114206453784165 * (t - 55) - 40.25366309332127 * log(t - 55)
		g = 325.4494125711974 + 0.07943456536662342 * (t - 50) - 28.0852963507957 * log(t - 50)
		b = 255
	}
	return [r, g, b]
}

_input.rgb = (...args: number[]) => args as RGB

function rgb2kelvin(r255: number, g255: number, b255: number) {
	console.log(b255 - r255)
	if (g255 + b255 < 158.61) {
		console.log("0 < t < 20")
		// calc from green
		return round(
			newtonIterate1d(
				(t) => g255 - (-155.25485562709179 - 0.44596950469579133 * (t - 2) + 104.49216199393888 * log(t - 2)),
				15,
				4,
			) * 100,
		)
		return (Math.E ** ((g255 + 155.25485562709179 + 0.44596950469579133 * (15 - 2)) / 104.49216199393888) + 2) * 100
	} else if (b255 - r255 < 0) {
		console.log("20 < t < 66")
		return round(
			newtonIterate1d(
				(t) => b255 - (-254.76935184120902 + 0.8274096064007395 * (t - 10) + 115.67994401066147 * log(t - 10)),
				43,
				4,
			) * 100,
		)
		return (
			(Math.E ** ((b255 + 254.76935184120902 - 0.8274096064007395 * (43 - 10)) / 115.67994401066147) + 10) * 100
		)
	} else {
		console.log("0 < t < 400, start= " + (-1.4 * (r255 + g255) + 755))
		return round(
			newtonIterate1d(
				(t) => r255 - (351.97690566805693 + 0.114206453784165 * (t - 55) - 40.25366309332127 * log(t - 55)),
				-1.4 * (r255 + g255) + 755,
				8,
			) * 100,
		)
		return ((r255 / 329.698727446) ** (1 / -0.1332047592) + 60) * 100
	}
	return newtonIterate1d(
		(k) => {
			const eps = 1e-9
			const [kr, kg, kb] = kelvin2rgb(k)
			const [kr2, kg2, kb2] = kelvin2rgb(k + eps)
			const dkr = (kr2 - kr) / eps,
				dkg = (kg2 - kg) / eps,
				dkb = (kb2 - kb) / eps
			return dkr * (kr - r255) + dkg * (kg - g255) + dkb * (kb - b255)

			return kb / kr - b255 / r255
		},
		//1000,
		//40000,
		Math.E ** ((b255 / r255 + 2.5) / 0.4),
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
		if (rgb[2] / rgb[0] >= b255 / r255) {
			maxTemp = temp
		} else {
			minTemp = temp
		}
	}
	return round(temp)
}

_input.temperature = _input.kelvin = _input.K = kelvin2rgb

function blend_f(f: (c1: RGB, c2: RGB) => RGB) {
	return function (bottom: Chromable, top: Chromable) {
		const [r, g, b] = f(color(top).rgb(), color(bottom).rgb())
		return rgb(r, g, b)
	}
}

function each(f: (a: number, b: number) => number) {
	return function (c1: RGB, c2: RGB): RGB {
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
	return 255 * min(1, b / 255 / (1 - a / 255))
}

/**
 * r, g, b can be in any interval (0-1 or 0-255)
 * @param r
 * @param g
 * @param b
 */
function rgb2hexhue(r: number, g: number, b: number) {
	const m = min(r, g, b)
	const M = max(r, g, b)
	const delta = M - m
	let hueTurnX6 // angle as value between 0 and 6
	if (0 == delta) {
		hueTurnX6 = 0
	} else if (r == M) {
		// second term to make sure the value is > 0
		hueTurnX6 = (g - b) / delta + (g < b ? 6 : 0)
	} else if (g == M) {
		hueTurnX6 = 2 + (b - r) / delta
	} else {
		hueTurnX6 = 4 + (r - g) / delta
	}
	return [hueTurnX6 * 60, m, M]
}
function hcxm2rgb(hueDegrees: number, c1: number, x1: number, m1: number, alpha1: number): RGBA {
	const m255 = m1 * 255
	const cm255 = c1 * 255 + m255
	const xm255 = x1 * 255 + m255
	if (hueDegrees < 60) {
		return [cm255, xm255, m255, alpha1]
	} else if (hueDegrees < 120) {
		return [xm255, cm255, m255, alpha1]
	} else if (hueDegrees < 180) {
		return [m255, cm255, xm255, alpha1]
	} else if (hueDegrees < 240) {
		return [m255, xm255, cm255, alpha1]
	} else if (hueDegrees < 300) {
		return [xm255, m255, cm255, alpha1]
	} else {
		return [cm255, m255, xm255, alpha1]
	}
}

/**
 * https://en.wikipedia.org/w/index.php?title=HSL_and_HSV&oldid=856714654#From_HSL
 */
function hsl2rgb(hueDegrees: number, s1: number, l1: number, alpha1 = 1): RGBA {
	hueDegrees = norm360(hueDegrees)
	const c1 = (1 - abs(2 * l1 - 1)) * s1
	return hcxm2rgb(hueDegrees, c1, c1 * (1 - abs(((hueDegrees / 60) % 2) - 1)), l1 - c1 / 2, alpha1)
}
function rgb2hsl(r255: number, g255: number, b255: number): HSL {
	const [hue, min1, max1] = rgb2hexhue(r255 / 255, g255 / 255, b255 / 255)
	const l1 = (max1 + min1) / 2
	let s1: number
	if (max1 == min1) {
		s1 = 0
	} else {
		s1 = l1 < 0.5 ? (max1 - min1) / (max1 + min1) : (max1 - min1) / (2 - max1 - min1)
	}
	return [hue, s1, l1]
}

function hsv2rgb(hueDegrees: number, s1: number, v1: number, alpha1: number = 1): RGBA {
	hueDegrees = norm360(hueDegrees)
	const c1 = v1 * s1
	return hcxm2rgb(hueDegrees, c1, c1 * (1 - abs(((hueDegrees / 60) % 2) - 1)), v1 - c1, alpha1)
}

function rgb2hsv(r255: number, g255: number, b255: number): HSV {
	const [hue, min255, max255] = rgb2hexhue(r255, g255, b255)
	const delta255 = max255 - min255
	const v1 = max255 / 255.0
	const s1 = max255 == 0 ? 0 : delta255 / max255
	return [hue, s1, v1]
}

function hcg2rgb(hueDegrees: number, c1: number, g1: number, alpha1 = 1): RGBA {
	hueDegrees = norm360(hueDegrees)
	const p = g1 * (1 - c1)
	return hcxm2rgb(hueDegrees, c1, c1 * (1 - abs(((hueDegrees / 60) % 2) - 1)), p, alpha1)
}

function rgb2hcg(r255: number, g255: number, b255: number): HCG {
	const [hue, min255, max255] = rgb2hexhue(r255, g255, b255)
	const c1 = (max255 - min255) / 255
	const _g1 = c1 < 1 ? min255 / 255 / (1 - c1) : 0
	return [hue, c1, _g1]
}

_input.hcg = hcg2rgb

function cielab2rgb(LStar100: number, aStar: number, bStar: number, alpha = 1): RGBA {
	const [x, y, z] = cielab2xyz(LStar100, aStar, bStar)
	return xyz2rgb(x, y, z, alpha)
}

function cielab2xyz(LStar100: number, aStar: number, bStar: number) {
	function fInv(t: number) {
		if (t > LAB_delta) {
			return t ** 3
		} else {
			return LAB_3DeltaPow2 * (t - 4 / 29)
		}
	}
	return [
		LAB_Xn * fInv((LStar100 + 16) / 116 + aStar / 500),
		LAB_Yn * fInv((LStar100 + 16) / 116),
		LAB_Zn * fInv((LStar100 + 16) / 116 - bStar / 200),
	]
}
function xyz2cielab(x: number, y: number, z: number): LAB {
	// https://en.wikipedia.org/w/index.php?title=CIELAB_color_space&oldid=849576085#Forward_transformation
	function f(t: number) {
		if (t > LAB_deltaPow3) {
			return cbrt(t)
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

function rgb2lab(r255: number, g255: number, b255: number): RGB {
	const [x, y, z] = rgb2xyz(r255, g255, b255)
	return xyz2cielab(x, y, z)
}

function rgb2xyz(r255: number, g255: number, b255: number): XYZ {
	// https://en.wikipedia.org/wiki/SRGB#The_reverse_transformation
	const r1Linear = rgbChannel2RgbLinear(r255)
	const g1Linear = rgbChannel2RgbLinear(g255)
	const b1Linear = rgbChannel2RgbLinear(b255)
	const X = 0.4124564 * r1Linear + 0.3575761 * g1Linear + 0.1804375 * b1Linear
	const Y = 0.2126729 * r1Linear + 0.7151522 * g1Linear + 0.072175 * b1Linear
	const Z = 0.0193339 * r1Linear + 0.119192 * g1Linear + 0.9503041 * b1Linear
	return [X, Y, Z]
}
function xyz2rgb(X1: number, Y1: number, Z1: number, alpha1 = 1): RGBA {
	// https://en.wikipedia.org/wiki/SRGB#The_forward_transformation_(CIE_XYZ_to_sRGB)
	const r1Linear = 3.2404542 * X1 - 1.5371385 * Y1 - 0.4985314 * Z1
	const g1Linear = -0.969266 * X1 + 1.8760108 * Y1 + 0.041556 * Z1
	const b1Linear = 0.0556434 * X1 - 0.2040259 * Y1 + 1.0572252 * Z1
	return [rgbLinearChannel2Rgb(r1Linear), rgbLinearChannel2Rgb(g1Linear), rgbLinearChannel2Rgb(b1Linear), alpha1]
}

_input.xyz = xyz2rgb
_input.lab = cielab2rgb

/**
 * For HSI, we use the direct angle calculation. I.e. atan2(beta, alpha). See wikipedia link. This is why we don't use
 * hcxm2rgb.
 */
function hsi2rgb(hueDegrees: number, s1: number, i1: number, alpha1 = 1): RGBA {
	/*
    borrowed from here:
    http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/hsi2rgb.cpp
     */
	let r, g, b
	let hRad = hueDegrees * DEG2RAD
	if (hRad < (2 * PI) / 3) {
		b = (1 - s1) / 3
		r = (1 + (s1 * cos(hRad)) / cos(PI / 3 - hRad)) / 3
		g = 1 - (b + r)
	} else if (hRad < (4 * PI) / 3) {
		hRad -= (2 * PI) / 3
		r = (1 - s1) / 3
		g = (1 + (s1 * cos(hRad)) / cos(PI / 3 - hRad)) / 3
		b = 1 - (r + g)
	} else {
		hRad -= (4 * PI) / 3
		g = (1 - s1) / 3
		b = (1 + (s1 * cos(hRad)) / cos(PI / 3 - hRad)) / 3
		r = 1 - (g + b)
	}
	return [3 * i1 * r * 255, 3 * i1 * g * 255, 3 * i1 * b * 255, alpha1]
}

/**
 * For HSI, we use the direct angle calculation. I.e. atan2(beta, alpha). See wikipedia link. This is why we don't use
 * rgb2hexhue.
 */
function rgb2hsi(r255: number, g255: number, b255: number): HSI {
	// See https://en.wikipedia.org/wiki/HSL_and_HSV#Hue_and_chroma
	// See https://en.wikipedia.org/wiki/HSL_and_HSV#Lightness
	const r1 = r255 / 255
	const g1 = g255 / 255
	const b1 = b255 / 255
	const i1 = (r1 + g1 + b1) / 3
	if (r1 == g1 && g1 == b1) {
		return [0, 0, i1]
	} else {
		const alpha = (1 / 2) * (2 * r1 - g1 - b1)
		const beta = (sqrt(3) / 2) * (g1 - b1)
		const hRad = atan2(beta, alpha)
		const min1 = min(r1, g1, b1)
		const s1 = 1 - min1 / i1
		return [(hRad < 0 ? 2 * PI + hRad : hRad) * RAD2DEG, s1, i1]
	}
}

_input.hsi = hsi2rgb

interpolators.hsv = interpolators.hsl = interpolators.hsi = interpolators.lch = interpolators.hcg = function interpolate_hsx(
	color1: Color,
	color2: Color,
	f: number,
	m: "hsv" | "hsl" | "hsi" | "lch" | "hcg",
) {
	const [a1, b1, c1] = color1[m]()
	const [a2, b2, c2] = color2[m]()
	function lerpHue(hue1: number, hue2: number, f: number) {
		const dh = norm360(hue2 - hue1 + 180) - 180
		return hue1 + f * dh
	}
	return color(
		("h" == m.charAt(0) ? lerpHue : lerp)(a1, a2, f),
		lerp(b1, b2, f),
		("h" == m.charAt(2) ? lerpHue : lerp)(c1, c2, f),
		m,
	)
}

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
