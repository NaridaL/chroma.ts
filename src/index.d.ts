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
export declare class Color {
    readonly _rgb: RGBA;
    private readonly _unclamped;
    /** internal */
    constructor(rgb: RGB | RGBA);
    interpolate(col2: Chromable, f: number, m?: ColorMode): Color;
    rgb(round?: boolean): RGB;
    rgba(round?: boolean, clamp_?: boolean): RGBA;
    hex(mode?: "rgb" | "rgba" | "argb"): string;
    hsl(): HSL;
    hsv(): [number, number, number];
    hcg(): [number, number, number];
    css(mode?: "rgb" | "hsl"): string;
    name(closest: true): string;
    name(closest?: boolean): string | undefined;
    cmyk(): [number, number, number, number];
    gl(): GL;
    /**
     * Get luminance of the color. This is equal to the Y channel of the XYZ color space.
     * @example chroma('black').luminance() // 0
     * @example chroma('white').luminance() // 1
     * @example chroma('red').luminance() // ~0.21
     * @see https://en.wikipedia.org/wiki/Relative_luminance
     */
    luminance(): number;
    /**
     * Return a new [Color] with `lum0_1` by linearly interpolating `this` with white (when increasing the luminance) or
     * black (otherwise) in the [XYZ] color space.
     * @see https://en.wikipedia.org/wiki/Relative_luminance
     * @example // Approximately doubling the luminance of red
     * chroma('red').luminance(0.4) // #ff8686, "Vivid Tangerine"
     * @param lum0_1 The desired luminance.
     */
    luminance(lum0_1: number): this;
    /**
     * Get color temperature of this color in Kelvin. This only ma
     */
    temperature(): number;
    set(modeAndChannel: string, value: string | number): Color;
    clipped(): boolean;
    /**
     * Get alpha value of color.
     * @example chroma.rgb(0, 0, 255, 0.5).alpha() // 0.5
     */
    alpha(): number;
    /**
     * Return new [Color] with given alpha value.
     * @example chroma('green').alpha(0.3).hex('rgba') // "#00ff004d"
     * @param alpha0_1 The desired alpha value.
     */
    alpha(alpha0_1: number): Color;
    darker(amount?: number): Color;
    brighter(amount?: number): Color;
    saturate(amount?: number): Color;
    desaturate(amount?: number): Color;
    premultiplied(): Color;
    hsi(): [number, number, number];
    lab(): [number, number, number];
    num(): number;
    lch(): [number, number, number];
    hcl(): HCL;
    xyz(): [number, number, number];
}
export interface Color {
    mix(col2: Chromable, f: number, m: ColorMode): Color;
    toString(): string;
    kelvin(): number;
}
export declare type Chromable = number | string | Color | number[];
declare function chroma(x: Chromable): Color;
declare function chroma(red: number, green: number, blue: number, alpha?: number): Color;
declare function chroma(x: Chromable, format: ColorFormat): Color;
declare function chroma(channel0: number, channel1: Color, channel2: number, format: ColorFormat): Color;
declare function chroma(channel0: number, channel1: Color, channel2: number, channel3: number, format: ColorFormat): Color;
export default chroma;
export { chroma };
declare namespace chroma {
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
        scale(): Scale;
        at(fract: number): Color;
    }
    function cubehelix(start?: number, rotations?: number, hue?: number | [number, number], gamma?: number, lightness?: number | [number, number]): CubeHelix;
    function random(): Color;
    function interpolate(col1: Chromable, col2: Chromable, f?: number, m?: ColorMode | "lrgb"): Color;
    const mix: typeof interpolate;
    function css(cssString: string): Color;
    function cmyk(cmyk: CMYK): Color;
    function cmyk(cyan0_1: number, magenta0_1: number, yellow0_1: number, key0_1: number): Color;
    function gl(gl: RGBA | RGB): Color;
    function gl(red0_1: number, green0_1: number, blue0_1: number, alpha0_1?: number): Color;
    function hcg(hcg: HCG): Color;
    function hcg(h: number, c: number, g: number): Color;
    function hcl(hcl: LAB): Color;
    function hcl(h: number, c: number, l: number): Color;
    function lch(lch: LCH): Color;
    function lch(h: number, c: number, l: number, alpha0_1?: number): Color;
    function hsi(hsi: HSI): Color;
    function hsi(h: number, s: number, i: number, alpha0_1?: number): Color;
    function hsl(hsl: HSL): Color;
    function hsl(hueDegrees: number, saturation0_1: number, lightness0_1: number, alpha0_1?: number): Color;
    function hsv(hsv: LAB): Color;
    function hsv(h: number, s: number, v: number): Color;
    function kelvin(temperature: number): Color;
    function lab(lab: LAB): Color;
    function lab(lightness1: number, a1: number, b: number, alpha0_1?: number): Color;
    function num(num: number): Color;
    function rgb(rgb: RGBA | RGB): Color;
    function rgb(red255: number, green255: number, blue255: number, alpha1?: number): Color;
    function xyz(xyz: XYZ): Color;
    function xyz(x1: number, y1: number, z1: number, alpha1?: number): Color;
    function average(chromables: Chromable[], mode?: ColorMode | "lrgb"): Color;
    function bezier(chromables: Chromable[]): {
        (t: number): Color;
        scale(): Scale;
    };
    function bezier(...chromables: Chromable[]): {
        (t: number): Color;
        scale(): Scale;
    };
    function blend(bottom: Chromable, top: Chromable, mode: keyof typeof blend_fs): Color;
    namespace blend_fs {
        export const normal = blend_f(each((a, _) => a));
        export const multiply = blend_f(each((a, b) => (a * b) / 255));
        export const screen = blend_f(each(_screen));
        export const overlay = blend_f(each(_overlay));
        export const darken = blend_f(each(Math.min));
        export const lighten = blend_f(each(Math.max));
        export const dodge = blend_f(each(_dodge));
        export const burn = blend_f(each(_burn));
    }
    interface Scale {
        (val: number): Color;
    }
    class Scale {
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
        init(colors: Color[] | ((t: number) => Color)): void;
        setColors(colorsOrBrewerClass?: Chromable[] | keyof typeof brewer | ((f: number) => Color)): Color[] | ((t: number) => Color);
        classes(): number[];
        classes(classes: number | number[]): this;
        /**
         * Get the domain.
         * @return If _colors is a function, [this._min, this._max]. If _colors is an array of colors, an array with the
         * same length with the positions of the colors.
         *
         * @example chroma.scale("red", "white", "blue").domain(0, 20).domain() // return [0, 10, 20]
         */
        domain(): number[];
        domain(start: number, end: number): this;
        domain(...domain: number[]): this;
        mode(): ColorMode;
        mode(_m: ColorMode): this;
        out(_o: ColorFormat | undefined): this;
        correctLightness(v?: boolean): this;
        /**
         * Get the padding.
         * @returns [paddingLeft, paddingRight]
         */
        padding(): [number, number];
        /**
         * Set the padding. Positive values will "cut off" the ends of gradient, while negative values will add a
         * section of constant color at the ends.
         * @example chroma.scale("red", "white").padding(0.1)(0) // chroma('#ff1a1a'), instead of red
         * @example chroma.scale("red", "white").padding(-0.1)(0) // chroma('red')
         * @param paddingLeft padding on left side.(lower-valued end of the interval).
         * @param paddingRight padding on right (higher-valued end of the interval) defaults to paddingLeft.
         */
        padding(paddingLeft: number, paddingRight?: number): this;
        /**
         * Get a number of equidistant colors.
         * @param numColors The number of colors to return.
         * @param format Output format. Defaults to `"hex"`. Pass `undefined` to get [Color] objects.
         * @returns If `numColors` is `undefined`, the colors which define this [Scale]. If `numColors` is 1,
         * `[this((min + max) / 2)]`. Otherwise, an array where the first element is `this(min)`, the last one is
         * `this(max)` and the rest are equidistant samples between min and max.
         */
        colors(numColors?: number, format?: ColorFormat | undefined): Color[] | (string | number | [number, number, number, number] | [number, number, number] | undefined)[];
        cache(): boolean;
        cache(c: boolean): this;
        gamma(): number;
        gamma(g: number): this;
        at(t: number): string | number | Color | [number, number, number, number] | [number, number, number] | undefined;
        private getClass;
        private color;
        private tCorrectedLightness;
        private resetCache;
    }
    function scale(...colors: Chromable[]): Scale;
    function scale(colors: Chromable[] | keyof typeof brewer | ((f: number) => Color)): Scale;
    namespace scales {
        function cool(): Scale;
        function hot(): Scale;
    }
    function contrast(a: Chromable, b: Chromable): number;
    function distance(a: Chromable, b: Chromable, mode?: ColorMode): number;
    function deltaE(a: Chromable, b: Chromable, L?: number, C?: number): number;
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
    type LimitsMode = "e" | "q" | "l" | "k";
    function limits(data: number[] | DataInfo, mode?: LimitsMode, num?: number): number[];
}
export declare type ColorMode = "rgb" | "cmyk" | "lab" | "hsv" | "hsi" | "hcg" | "hsl" | "gl" | "hcl" | "lch" | "xyz";
export declare type ColorFormat = ColorMode | "hex" | "num" | "name" | "kelvin" | "css";
declare type RGBA = [number, number, number, number];
declare type CMYK = [number, number, number, number];
declare type GL = [number, number, number, number];
declare type RGB = [number, number, number];
declare type LAB = [number, number, number];
declare type LCH = [number, number, number];
declare type HCL = [number, number, number];
declare type HSL = [number, number, number];
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
