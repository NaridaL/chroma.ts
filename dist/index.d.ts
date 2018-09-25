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
 */
/**
 * @param alpha1 default=1
 * @example chroma(99, 99, 44, 0.7)
 */
declare function chroma(red255: number, green255: number, blue255: number, alpha1?: number): chroma.Color;
/**
 * @example chroma('mediumorchid') // a css string
 * @example chroma([56, 203, 30]) // a RGB triple
 * @example chroma(0x4b0082) // a hex num
 * @example chroma([30, 0.8, 0.3], 'hsl') // explicit format
 */
declare function chroma(x: chroma.Chromable, format?: ColorFormat): chroma.Color;
/**
 * This overload allows VS Code to suggest color names when you type `chroma('`.
 */
declare function chroma(colorname: keyof typeof chroma.w3cx11, format?: "name"): chroma.Color;
/** @example chroma(30, 0.8, 0.3, 'hsl') */
declare function chroma(channel0: number, channel1: chroma.Color, channel2: number, format: ColorFormat): chroma.Color;
/** @example chroma(0.3, 0.8, 0.3, 1, 'gl') */
declare function chroma(channel0: number, channel1: chroma.Color, channel2: number, channel3: number, format: ColorFormat): chroma.Color;
export default chroma;
export { chroma };
declare namespace chroma {
    /**
     * A Chromable is any value which can be converted to a color. For ease of use, most functions accept these instead of
     * only Color values.
     */
    type Chromable = number | string | Color | number[];
    class Color {
        private readonly r;
        private readonly g;
        private readonly b;
        private readonly a;
        /** @internal */
        constructor(r: number, g: number, b: number, a?: number);
        /**
         * @see [[chroma.mix]]
         */
        mix(col2: Chromable, f: number, m?: InterpolationMode): Color;
        rgb(doRound?: boolean, clamp_?: boolean): RGB;
        rgba(doRound?: boolean, clamp_?: boolean): RGBA;
        /**
         * Return a hex-string representation of this color.
         *
         * @param mode
         * @see #num for a hex-number representation.
         * @example chroma('yellow').alpha(0.7).hex()
         * @example chroma('yellow').alpha(0.7).hex('rgba')
         * @example chroma('yellow').alpha(0.7).hex('argb')
         */
        hex(mode?: "rgb" | "rgba" | "argb"): string;
        /**
         * Returns the [HSL] representation of this color. hue will always be in [0;360). Values are never NaN.
         *
         * @example chroma('purple').hsl()
         */
        hsl(): HSL;
        /**
         * Returns the [HSL] representation of this color. hue will always be in [0;360). Values are never NaN.
         *
         * @example chroma('purple').hsv()
         */
        hsv(): [number, number, number];
        /**
         * Returns the [HSL] representation of this color. hue will always be in [0;360). Values are never NaN.
         *
         * @example chroma('purple').hcg()
         */
        hcg(): [number, number, number];
        /**
         * Returns a CSS `rgb(...)` or `hsl(...)` string representation that can be used as CSS-color definition. The alpha
         * value is not output if it 1.
         * @example chroma('teal').css() // == "rgb(0,128,128)"
         * @example chroma('teal').alpha(0.5).css() // == "rgba(0,128,128,0.5)"
         * @example chroma('teal').css('hsl') // == "hsl(180,100%,25.1%)"
         */
        css(mode?: "rgb" | "hsl"): string;
        name(closest: true): string;
        /**
         * Get the name of a color. By default, this method will try to match the color exactly (comparing rounded RGB
         * values). Pass `true` to return the name of the color which is closest to `this` in CIELAB color space. CIELAB is
         * used as it is perceptually uniform.
         * @param closest Whether this should find the closest color name. default=false
         * @return If `closest == false`, the name of this color or `undefined` if there is no match. Otherwise, will always
         * return a color name.
         * @example chroma('#ff0000').name() // == "red"
         * @example chroma('#ff0001').name() // == undefined
         * @example chroma('#ff0001').name(true) // == "red"
         */
        name(closest?: boolean): string | undefined;
        /**
         * Get the [CMYK](#chroma.CMYK) representation of this color.
         *
         * @example chroma('red').cmyk()
         */
        cmyk(): [number, number, number, number];
        /**
         * Returns the [GL] representation of this color.
         * @example chroma('33cc00').gl()
         */
        gl(): GL;
        /**
         * Get luminance of the color. This is equal to the Y channel of the XYZ color space.
         * @example chroma('black').luminance() // == 0
         * @example chroma('white').luminance() // == 1
         * @example chroma('red').luminance() // == ~0.21
         * @see https://en.wikipedia.org/wiki/Relative_luminance
         */
        luminance(): number;
        /**
         * Return a new [Color] with `lum1` by linearly interpolating `this` with white (when increasing the luminance) or
         * black (otherwise) in the [XYZ] color space.
         * @see https://en.wikipedia.org/wiki/Relative_luminance
         * @example // Approximately doubling the luminance of red
         * @example chroma('red').luminance(0.4) // == #ff8686 // "Vivid Tangerine"
         * @param lum1 The desired luminance.
         */
        luminance(lum1: number): this;
        /**
         * Get color temperature of this color in Kelvin. This only makes sense for colors close to those output by
         * chroma.kelvin
         *
         * @example [c = chroma('#ff3300'), c.temperature()]
         * @example [c = chroma('#ffe3cd'), c.temperature()]
         * @example [c = chroma('#b3ccff'), c.temperature()]
         */
        temperature(): number;
        /**
         * Returns a new [Color] with a channel changed.
         * @example chroma('skyblue').set('hsl.h', 0) // change hue to 0 deg (=red)
         * @example chroma('hotpink').set('lch.c', 30) // set chromaticity to 30
         * @example chroma('orangered').set('lab.l', x => x / 2) // half Lab lightness
         * @example chroma('darkseagreen').set('lch.c', x => x * 2) // double Lch saturation
         */
        set(modeAndChannel: string, value: number | ((channel: number) => number)): Color;
        /**
         * Returns whether this color is outside the RGB color cube and will be clipped/clamped when calling .rgb()
         *
         * @example [c = chroma.lch( 20, 40, 50), c.clipped()]
         * @example [c = chroma.lch( 40, 40, 50), c.clipped()]
         * @example [c = chroma.lch( 60, 40, 50), c.clipped()]
         * @example [c = chroma.lch( 80, 40, 50), c.clipped()]
         * @example [c = chroma.lch(100, 40, 50), c.clipped()]
         */
        clipped(): boolean;
        /**
         * Returns black or white, whichever has the highest contrast to `this`.
         * In the readme you should see the result of this.
         *
         * @example chroma('red')
         * @example chroma('yellow')
         */
        textColor(): Color;
        /**
         * Get alpha value of color.
         * @example chroma.rgb(0, 0, 255, 0.5).alpha() // == 0.5
         */
        alpha(): number;
        /**
         * Return new [Color] with given alpha value.
         * @example chroma('green').alpha(0.3)
         * @example chroma('green').alpha(0.3).hex('rgba') // == "#00ff004d"
         * @param alpha1 The desired alpha value.
         */
        alpha(alpha1: number): Color;
        darker(amount?: number): Color;
        /**
         *
         * @param amount
         * @example chroma('hotpink')
         * @example chroma('hotpink').brighter()
         * @example chroma('hotpink').brighter(2)
         * @example chroma('hotpink').brighter(3)
         */
        brighter(amount?: number): Color;
        /**
         * Returns a new [Color] with increased saturation.
         * @param amount How much.
         * @example chroma('slategray')
         * @example chroma('slategray').saturate()
         * @example chroma('slategray').saturate(2)
         * @example chroma('slategray').saturate(3)
         */
        saturate(amount?: number): Color;
        /**
         * Equivalent to `saturate(-amount)`.
         * @see #saturate
         */
        desaturate(amount?: number): Color;
        premultiplied(): Color;
        /**
         * Returns the [HSI] representation of this color. hue will always be in [0; 360). Values are never NaN.
         *
         * @example chroma('purple').hsi()
         */
        hsi(): [number, number, number];
        /**
         * Returns the [LAB] representation of this color.
         *
         * @example chroma('purple').lab()
         */
        lab(): [number, number, number];
        /**
         * Return a hex-num of this color.
         *
         * @param mode
         * @see #num for a hex-number representation.
         * @example chroma('yellow').alpha(0.7).hex()
         * @example chroma('yellow').alpha(0.7).hex('rgba')
         * @example chroma('yellow').alpha(0.7).hex('argb')
         */
        num(mode?: "rgb" | "rgba" | "argb"): number;
        /**
         * Returns the [LCH] representation of this color. hue will always be in [0; 360). Values are never NaN.
         *
         * @example chroma('purple').lch()
         */
        lch(): [number, number, number];
        /**
         * Returns the [XYZ] representation of this color. hue will always be in [0; 360). Values are never NaN.
         *
         * @example chroma('purple').xyz()
         */
        xyz(): [number, number, number];
        /**
         * Whether this [Color](#chroma.Color) is identical (strict equality of r, g, b, a) to `color`.
         */
        equals(color: Color): boolean;
        hashCode(): number;
        /**
         * @example chroma('red').toSource() // == "chroma.rgb(255, 0, 0)"
         * @example chroma.rgb(-2, 100.02, 200, 0.5).toSource() // == "chroma.rgb(-2, 100.02, 200, 0.5)"
         */
        toSource(): string;
    }
    interface Color {
        toString(): string;
        kelvin(): number;
    }
    /**
     * @example chroma.black
     */
    const black: Color;
    /**
     * @example chroma.black
     */
    const white: Color;
    const brewer: {
        OrRd: number[];
        PuBu: number[];
        BuPu: number[];
        Oranges: number[];
        BuGn: number[];
        YlOrBr: number[];
        YlGn: number[];
        Reds: number[];
        RdPu: number[];
        Greens: number[];
        YlGnBu: number[];
        Purples: number[];
        GnBu: number[];
        Greys: number[];
        YlOrRd: number[];
        PuRd: number[];
        Blues: number[];
        PuBuGn: number[];
        Viridis: number[];
        Spectral: number[];
        RdYlGn: number[];
        RdBu: number[];
        PiYG: number[];
        PRGn: number[];
        RdYlBu: number[];
        BrBG: number[];
        RdGy: number[];
        PuOr: number[];
        Set2: number[];
        Accent: number[];
        Set1: number[];
        Set3: number[];
        Dark2: number[];
        Paired: number[];
        Pastel2: number[];
        Pastel1: number[];
    };
    /**
     * X11 color names
     * http://www.w3.org/TR/css3-color/#svg-color
     *
     * @example Object.keys(chroma.w3cx11).slice(0, 4)
     */
    const w3cx11: {
        aliceblue: number;
        antiquewhite: number;
        aqua: number;
        aquamarine: number;
        azure: number;
        beige: number;
        bisque: number;
        black: number;
        blanchedalmond: number;
        blue: number;
        blueviolet: number;
        brown: number;
        burlywood: number;
        cadetblue: number;
        chartreuse: number;
        chocolate: number;
        coral: number;
        cornflower: number;
        cornflowerblue: number;
        cornsilk: number;
        crimson: number;
        cyan: number;
        darkblue: number;
        darkcyan: number;
        darkgoldenrod: number;
        darkgray: number;
        darkgreen: number;
        darkgrey: number;
        darkkhaki: number;
        darkmagenta: number;
        darkolivegreen: number;
        darkorange: number;
        darkorchid: number;
        darkred: number;
        darksalmon: number;
        darkseagreen: number;
        darkslateblue: number;
        darkslategray: number;
        darkslategrey: number;
        darkturquoise: number;
        darkviolet: number;
        deeppink: number;
        deepskyblue: number;
        dimgray: number;
        dimgrey: number;
        dodgerblue: number;
        firebrick: number;
        floralwhite: number;
        forestgreen: number;
        fuchsia: number;
        gainsboro: number;
        ghostwhite: number;
        gold: number;
        goldenrod: number;
        gray: number;
        green: number;
        greenyellow: number;
        grey: number;
        honeydew: number;
        hotpink: number;
        indianred: number;
        indigo: number;
        ivory: number;
        khaki: number;
        laserlemon: number;
        lavender: number;
        lavenderblush: number;
        lawngreen: number;
        lemonchiffon: number;
        lightblue: number;
        lightcoral: number;
        lightcyan: number;
        lightgoldenrod: number;
        lightgoldenrodyellow: number;
        lightgray: number;
        lightgreen: number;
        lightgrey: number;
        lightpink: number;
        lightsalmon: number;
        lightseagreen: number;
        lightskyblue: number;
        lightslategray: number;
        lightslategrey: number;
        lightsteelblue: number;
        lightyellow: number;
        lime: number;
        limegreen: number;
        linen: number;
        magenta: number;
        maroon: number;
        maroon2: number;
        maroon3: number;
        mediumaquamarine: number;
        mediumblue: number;
        mediumorchid: number;
        mediumpurple: number;
        mediumseagreen: number;
        mediumslateblue: number;
        mediumspringgreen: number;
        mediumturquoise: number;
        mediumvioletred: number;
        midnightblue: number;
        mintcream: number;
        mistyrose: number;
        moccasin: number;
        navajowhite: number;
        navy: number;
        oldlace: number;
        olive: number;
        olivedrab: number;
        orange: number;
        orangered: number;
        orchid: number;
        palegoldenrod: number;
        palegreen: number;
        paleturquoise: number;
        palevioletred: number;
        papayawhip: number;
        peachpuff: number;
        peru: number;
        pink: number;
        plum: number;
        powderblue: number;
        purple: number;
        purple2: number;
        purple3: number;
        rebeccapurple: number;
        red: number;
        rosybrown: number;
        royalblue: number;
        saddlebrown: number;
        salmon: number;
        sandybrown: number;
        seagreen: number;
        seashell: number;
        sienna: number;
        silver: number;
        skyblue: number;
        slateblue: number;
        slategray: number;
        slategrey: number;
        snow: number;
        springgreen: number;
        steelblue: number;
        tan: number;
        teal: number;
        thistle: number;
        tomato: number;
        turquoise: number;
        violet: number;
        wheat: number;
        white: number;
        whitesmoke: number;
        yellow: number;
        yellowgreen: number;
    };
    /**
     * Return a new [[CubeHelix]].
     *
     * @example chroma.cubehelix() // use the default helix
     * @example chroma.cubehelix().start(200).rotations(-0.5).gamma(0.8).lightness([0.3, 0.8])
     */
    function cubehelix(start?: number, rotations?: number, hue?: number | [number, number], gamma?: number, lightness?: number | [number, number]): CubeHelix;
    /**
     * [Dave Green's cubehelix color scheme](http://www.mrao.cam.ac.uk/~dag/CUBEHELIX/)!
     *
     * A CubeHelix is a function defined on [0, 1] which returns colors.
     */
    interface CubeHelix {
        (f: number): Color;
    }
    class CubeHelix {
        private _start;
        private _rotations;
        private _gamma;
        private _hue;
        private _lightness;
        start(s: number): number | this;
        rotations(r: number): number | this;
        gamma(g: number): number | this;
        hue(h: number | [number, number]): [number, number] | this;
        lightness(h: number | [number, number]): [number, number] | this;
        /**
         * Convert to a [[Scale]].
         *
         * @example chroma.cubehelix().scale().correctLightness().domain(2, 22)
         */
        scale(): Scale<Color>;
        at(fract: number): Color;
    }
    /**
     * Create a new random [Color] from a random point in the RGB color space.
     * @param randomSource A function which returns random `number`s in the interval [0; 1). Useful if you want to
     *     create a deterministic sequence of "random" colors. Defaults to `Math.random`.
     */
    function random(randomSource?: () => number): Color;
    /**
     * Create a valid RGB color (`.clipped() == false`) from a random point in the CIELAB color space. This results in
     * more colors in the RGB color space where humans can perceive more differences.
     * @param randomSource A function which returns random `number`s in the interval [0; 1). Useful if you want to
     *     create a deterministic sequence of "random" colors. Defaults to `Math.random`.
     * @example chroma.random((() => { let i = 0; return () => (i = (i *Math.SQRT2) % 1); })())
     */
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
    function mix(col1: Chromable, col2: Chromable, f?: number, m?: InterpolationMode): Color;
    /**
     * Parse a CSS color. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color) for all the possible
     * variants.
     *
     * @example chroma.css('hsl(2rad 90% 50% / 0.9)')
     * @example chroma.css('laserlemon')
     */
    function css(cssString: string): Color;
    /**
     * @example chroma.cmyk(0.2, 0.8, 0, 0)
     * @example chroma(0.2, 0.8, 0, 0, 'cmyk')
     */
    function cmyk(cmyk: CMYK): Color;
    function cmyk(cyan1: number, magenta1: number, yellow1: number, key1: number): Color;
    /**
     * @example chroma.gl(1, 1, 0, 1)
     */
    function gl(gl: RGBA | RGB): Color;
    /**
     * @example chroma.gl([1, 0, 1, 0.5])
     */
    function gl(red1: number, green1: number, blue1: number, alpha1: number): Color;
    function hcg(hcg: HCG): Color;
    /**
     * @param alpha1 default=1
     */
    function hcg(h: number, c: number, g: number, alpha1?: number): Color;
    function lch(lch: LCH): Color;
    /**
     * @param alpha1 default=1
     */
    function lch(h: number, c: number, l: number, alpha1?: number): Color;
    function hsi(hsi: HSI): Color;
    /**
     * @param alpha1 default=1
     */
    function hsi(h: number, s: number, i: number, alpha1?: number): Color;
    function hsl(hsl: HSL): Color;
    /**
     * @param alpha1 default=1
     * @example chroma.hsl(30, 1, 0.5)
     * @example chroma.hsl(30, 0.6, 0.5)
     */
    function hsl(hueDegrees: number, saturation1: number, lightness1: number, alpha1?: number): Color;
    function hsv(hsv: LAB): Color;
    function hsv(h: number, s: number, v: number): Color;
    /**
     *
     * @param temperature
     * @example chroma.kelvin(2000) // candle light
     * @example chroma.kelvin(3500) // sunset
     * @example chroma.kelvin(6500) // daylight
     * @example x0_1 => chroma.kelvin(x0_1 * 30000) // effective range: [0; 30000]
     */
    function kelvin(temperature: number): Color;
    function lab(lab: LAB): Color;
    /**
     * @param alpha1 default=1
     */
    function lab(lightness1: number, a1: number, b: number, alpha1?: number): Color;
    /**
     * @example chroma.num(0x663399) // rebeccapurple
     */
    function num(num: number): Color;
    function rgb(rgb: RGBA | RGB): Color;
    /**
     * @param alpha1 default=1
     * @example chroma.rgb(0, 100, 200)
     */
    function rgb(red255: number, green255: number, blue255: number, alpha1?: number): Color;
    function xyz(xyz: XYZ): Color;
    /** @param alpha1 default=1 */
    function xyz(x1: number, y1: number, z1: number, alpha1?: number): Color;
    /**
     * Similar to chroma.mix, but accepts more than two colors.
     *
     * @example colors = ['#ddd', 'yellow', 'red', 'teal']
     * @example chroma.average(colors) // default = 'rgb'
     * @example chroma.average(colors, 'lab')
     * @example chroma.average(colors, 'lch')
     * @example chroma.average(colors, 'lrgb')
     * @example chroma.average(['red', 'rgba(0,0,0,0.5)']).css()
     */
    function average(chromables: Chromable[], mode?: InterpolationMode): Color;
    /**
     *
     * @param chromables
     * @example chroma.scale('black', 'red', 'gold') // linear interpolation
     * @example chroma.bezier('black', 'red', 'gold') // bezier interpolation
     */
    function bezier(chromables: Chromable[]): {
        (t: number): Color;
        scale(): Scale;
    };
    function bezier(...chromables: Chromable[]): {
        (t: number): Color;
        scale(): Scale;
    };
    /**
     * Blends two colors using RGB channel-wise blend functions.
     * @param bottom
     * @param top
     * @param mode
     * @example chroma.blend('4CBBFC', 'EEEE22', 'multiply')
     * @example chroma.blend('4CBBFC', 'EEEE22', 'darken')
     * @example chroma.blend('4CBBFC', 'EEEE22', 'lighten')
     */
    function blend(bottom: Chromable, top: Chromable, mode: BlendMode): Color;
    type BlendMode = keyof typeof blend_fs;
    namespace blend_fs {
        export const normal = blend_f(each((a, _) => a));
        export const multiply = blend_f(each((a, b) => (a * b) / 255));
        export const screen = blend_f(each(_screen));
        export const overlay = blend_f(each(_overlay));
        export const darken = blend_f(each(min));
        export const lighten = blend_f(each(max));
        export const dodge = blend_f(each(_dodge));
        export const burn = blend_f(each(_burn));
    }
    /**
     * @param colors
     * @example scale = chroma.scale(['yellow', '008ae5'])
     * @example scale(0.25)
     * @example scale(0.5)
     * @example scale(0.75)
     * @example chroma.scale('Viridis')
     */
    function scale(colors: Chromable[] | keyof typeof brewer | ((f: number) => Color)): Scale;
    function scale(...colors: Chromable[]): Scale;
    /**
     * A color scale, created with chroma.scale, is a function that maps numeric values to a color palette.
     *
     * The type parameter describes the output type and can be changed with out(). Defaults to Color objects.
     *
     * @param T The output format. default=Color
     * @example chroma.scale('Purples')
     * @example chroma.scale('Purples')(0.4)
     */
    interface Scale<T = Color> {
        (val: number): T;
    }
    class Scale<T = Color> {
        private _colors;
        private _classes;
        /**
         * Color cache. undefined if the cache should not be used.
         */
        private _cache;
        private _correctLightness;
        private _gamma;
        private _mode;
        private _out;
        private _min;
        private _max;
        private _paddingLeft;
        private _paddingRight;
        private _pos;
        /**
         * Get the current scale classes.
         */
        classes(): number[];
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
        classes(classes: number | number[]): this;
        /**
         * Get the domain.
         * @return If _colors is a function, [this._min, this._max]. If _colors is an array of colors, an array with the
         * same length as the number of colors.
         * @example chroma.scale("red", "white", "blue").domain(0, 20).domain() // == [0, 10, 20]
         */
        domain(): number[];
        /**
         * Set the domain interval on which the scale is defined. Colors are distributed equidistantly along the
         * interval.
         * @param start
         * @param end
         * @return `this`
         * @example chroma.scale("red", "white", "blue").domain(0, 100)(50) // == white
         * @example chroma.scale("red", "white", "blue").domain(0, 0.25, 1).domain(0, 100).domain() // == [0, 25, 100]
         */
        domain(start: number, end: number): this;
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
        domain(...domain: number[]): this;
        /**
         * Get the interpolation mode used when calculating colors.
         */
        mode(): InterpolationMode;
        /**
         * Set the interpolation mode used when calculating colors. The defaut mode is "rgb".
         * See also {@link chroma#mix}
         * @param mode the mode to set.
         * @return `this`
         * @example chroma.scale("red", "green").mode("lab")
         * @example chroma.scale("red", "green").mode("lrgb")
         */
        mode(mode: InterpolationMode): this;
        /**
         * Set the output format return by `this(x)` and `this.colors(n)`.
         * @param outputFormat The color format to use. Pass `undefined` to return [Color] objects.
         * @return `this`
         * @example chroma.scale("red", "white").out("hex")(0) // == "#ff0000"
         * @example chroma.scale("red", "white").out("num").colors(2) // == [0xff0000, 0xffffff]
         */
        out<M extends ColorFormat | undefined>(outputFormat: M): Scale<M extends ColorFormat ? ReturnType<Color[M]> : Color>;
        /**
         * This makes sure the lightness range is spread evenly across a color scale. Especially useful when working
         * with [multi-hue color scales](https://www.vis4.net/blog/2013/09/mastering-multi-hued-color-scales/), where
         * simple gamma correction can't help you very much.
         *
         * @example chroma.scale('black','red','yellow','white')
         * @example chroma.scale('black','red','yellow','white').correctLightness()
         */
        correctLightness(enableCorrectLightness?: boolean): this;
        /**
         * Get the padding.
         * @returns [paddingLeft, paddingRight]
         */
        padding(): [number, number];
        /**
         * Set the padding. Positive values will "cut off" the ends of gradient, while negative values will add a
         * section of constant color at the ends.
         * @example chroma.scale("red", "white").padding(0.2)
         * @example chroma.scale("red", "white").padding(0.1)(0) // == chroma('#ff1a1a'), instead of red
         * @example chroma.scale("red", "white").padding(-0.1)(0) // == chroma('red')
         * @param paddingLeft padding on left side.(lower-valued end of the interval).
         * @param paddingRight padding on right (higher-valued end of the interval).
         * default=paddingLeft
         */
        padding(paddingLeft: number, paddingRight?: number): this;
        /**
         * Get a number of equidistant colors.
         * @param numColors The number of colors to return.
         * @param format Output format. Defaults to `"hex"`. Pass `false` to get {@link Color} objects.
         * @returns If `numColors` is `undefined`, the colors which define this [Scale]. If `numColors` is 1,
         * `[this((min + max) / 2)]`. Otherwise, an array where the first element is `this(min)`, the last one is
         * `this(max)` and the rest are equidistant samples between min and max.
         * @example chroma.scale('OrRd').colors(5)
         * @example chroma.scale(['white', 'black']).colors(12)
         */
        colors(numColors?: number, format?: ColorFormat | false): T[];
        /**
         * Get whether the cache is enabled. Defaults to true.
         */
        cache(): boolean;
        /**
         * Enable or disable the cache.
         * @param enableCache Whether the cache should be enabled.
         */
        cache(enableCache: boolean): this;
        /**
         * Get the current gamma value. Defaults to 1.
         */
        gamma(): number;
        /**
         * Set the gamma value. Gamma-correction can be used to "shift" a scale's center more the the beginning (gamma <
         * 1) or end (gamma > 1), typically used to "even" the lightness gradient. Default is 1.
         * @example chroma.scale('YlGn').gamma(0.5)
         * @example chroma.scale('YlGn').gamma(1)
         * @example chroma.scale('YlGn').gamma(2)
         */
        gamma(gamma: number): this;
        /**
         * @ignore
         */
        _at(t: number): string | number | Color | [number, number, number] | [number, number, number, number] | undefined;
        /**
         * @ignore
         */
        _init(colorsOrFunction: Color[] | ((t: number) => Color)): void;
        private _getClass;
        private _color;
        private _tCorrectedLightness;
        private _resetCache;
    }
    namespace scales {
        /**
         * @example chroma.scales.cool()
         */
        function cool(): Scale<Color>;
        /**
         * @example chroma.scales.hot()
         */
        function hot(): Scale<Color>;
    }
    /**
     * Computes the WCAG contrast ratio between two colors. A minimum contrast of 4.5:1
     * [is recommended](http://www.w3.org/TR/WCAG20-TECHS/G18.html) to ensure that text is still readable against a
     * background color.
     *
     * @param a
     * @param b
     */
    function contrast(a: Chromable, b: Chromable): number;
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
    function distance(a: Chromable, b: Chromable, mode?: ColorMode): number;
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
    function deltaE(reference: Chromable, sample: Chromable, L?: number, C?: number): number;
    type DataInfo = {
        min: number;
        max: number;
        sum: number;
        values: number[];
        count: number;
        domain: [number, number];
        limits(mode: LimitsMode, num: number): number[];
    };
    function analyze(data: number[]): DataInfo;
    type LimitsMode = "c" | "e" | "q" | "l" | "k";
    function limits(data: number[] | DataInfo, mode?: LimitsMode, num?: number): number[];
}
export declare type ColorMode = "rgb" | "cmyk" | "lab" | "hsv" | "hsi" | "hcg" | "hsl" | "gl" | "lch" | "xyz";
export declare type InterpolationMode = "rgb" | "lab" | "hsv" | "hsi" | "hcg" | "hsl" | "lch" | "xyz" | "lrgb" | "num";
export declare type ColorFormat = ColorMode | "hex" | "num" | "name" | "kelvin" | "css";
/**
 * CMYK color space
 * @see https://en.wikipedia.org/wiki/cmyk_color_model
 * [cyan, magenta, yellow, alpha1]
 */
declare type CMYK = [number, number, number, number];
/**
 * WebGL colors. Like RGB, but floats in [0; 1] instead of 0-255.
 * [red255, green255, blue255, alpha1]
 */
declare type GL = [number, number, number, number];
/**
 * Red, green, blue ranging from 0-255.
 * Can be floats and outside the above range internally.
 */
declare type RGB = [number, number, number];
/**
 * RGB plus alpha ranging from 0-1
 * [red255, green255, blue255, alpha1]
 */
declare type RGBA = [number, number, number, number];
/**
 * CIELAB color space
 * [lightness, A*, B*]
 * @see https://en.wikipedia.org/wiki/CIELAB_color_space
 */
declare type LAB = [number, number, number];
/**
 * Cylindrical representation of CIELAB
 * @see https://en.wikipedia.org/wiki/CIELAB_color_space#Cylindrical_representation:_CIELCh_or_CIEHLC
 *
 */
declare type LCH = [number, number, number];
/**
 * @see https://en.wikipedia.org/wiki/HSL_and_HSV
 * [hueDegrees, saturation1, lightness1]
 */
declare type HSL = [number, number, number];
/**
 * @see https://en.wikipedia.org/w/index.php?title=HSI_color_space&redirect=no
 * [hueDegrees, saturation1, intensity1]
 */
declare type HSI = [number, number, number];
declare type XYZ = [number, number, number];
/**
 * HCG Color Model
 * See https://github.com/acterhd/hcg-color
 * A color value in the HCG format is an array of three numbers [h, c, g], where
 * `h` is the hue as an angle in degrees [0; 360)
 * `c` is the chroma value in [0; 1]
 * `g` is the gray value in [0; 1]
 */
declare type HCG = [number, number, number];
//# sourceMappingURL=index.d.ts.map