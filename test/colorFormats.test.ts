import chroma, { Color, ColorMode, ColorFormat, Chromable } from "../src/index"
import { assert as chai } from "chai"
import assert from "assert"
import fs from "fs"
// @ts-ignore
import ntc = require("../ntc2")

const TEST_COLOR_NAMES = ["black", "white", "red", "green", "blue", "magenta", "cyan", "yellow", "orange", "purple"]
const TEST_COLOR_MODES: ColorFormat[] = [
	"rgb",
	"cmyk",
	"lab",
	"hsv",
	"hsi",
	"hcg",
	"hsl",
	"gl",
	"hcl",
	"lch",
	"css",
	"gl",
	"num",
	"xyz",
]

function decimalAdjust(f: (num: number) => number, value: number, exp: number = 0) {
	// If the exp is undefined or zero...
	if (exp === 0) {
		return f(value)
	}
	// If the value is not a number or the exp is not an integer...
	if (isNaN(value) || !(typeof exp === "number" && exp % 1 === 0)) {
		return NaN
	}
	// Shift
	const valueStr = value.toString().split("e")
	value = f(+(valueStr[0] + "e" + (valueStr[1] ? +valueStr[1] - exp : -exp)))
	// Shift back
	const valueStr2 = value.toString().split("e")
	return +(valueStr2[0] + "e" + (valueStr2[1] ? +valueStr2[1] + exp : exp))
}

const round10: (num: number, exp: number) => number = decimalAdjust.bind(undefined, Math.round)
const floor10: (num: number, exp: number) => number = decimalAdjust.bind(undefined, Math.floor)
const ceil10: (num: number, exp: number) => number = decimalAdjust.bind(undefined, Math.ceil)

const round = (x: number) => Math.round(x * 1000) / 1000

function assertColorsEqual(actual: Chromable, expected: Chromable, message: string = "") {
	const actualColor = chroma(actual)
	const expectedColor = chroma(expected)
	// map round to round alpha value
	const actualRGBA = actualColor.rgba().map(round)
	const expectedRGBA = expectedColor.rgba().map(round)
	assert.deepEqual(
		actualRGBA,
		expectedRGBA,
		"actual: " +
			JSON.stringify(actualRGBA) +
			" " +
			actualColor.hex() +
			", expected: " +
			JSON.stringify(expectedRGBA) +
			" " +
			expectedColor.hex() +
			" " +
			message,
	)
}

suite("chroma.ts", () => {
	function testColorConversionForMode(format: ColorFormat) {
		TEST_COLOR_NAMES.forEach(colorName =>
			test(`should convert ${colorName} correctly`, () => {
				const color = chroma(colorName)
				const colorInFormat = color[format]()!
				const backInRGB = (chroma as any)[format](colorInFormat)
				assertColorsEqual(backInRGB, color, "colorInFormat: " + colorInFormat)
			}),
		)
	}

	function testConcrete(format: ColorFormat, roundExps: number | number[], values: { [color: string]: any }) {
		Object.keys(values).forEach(colorString => {
			test(`convert from ${colorString}`, () => {
				const color = chroma(colorString)
				const colorInFormat = color[format]()
				const deepRound = (value: typeof colorInFormat) =>
					Array.isArray(value)
						? value.map((x, i) => round10(x, (roundExps as number[])[i]))
						: "number" == typeof value
							? round10(value, roundExps as number)
							: value
				assert.deepEqual(
					deepRound(colorInFormat),
					deepRound(values[colorString]),
					"actual values: " + colorInFormat,
				)
			})
			test(`convert to ${colorString}`, () => {
				const colorInRGB = chroma(values[colorString], format)
				const color = chroma(colorString)
				console.log(colorInRGB, color)
				assertColorsEqual(colorInRGB, color)
			})
		})
	}

	TEST_COLOR_MODES.forEach(colorMode => suite(colorMode, () => testColorConversionForMode(colorMode)))

	suite("Color", () => {
		test("alpha() should return the alpha value", () => {
			assert.equal(chroma("red").alpha(), 1)
			assert.equal(chroma.rgb(100, 100, 100, 0.5).alpha(), 0.5)
		})
		test("alpha(x) should return a new Color w/ alpha = x", () => {
			const red = chroma("red")
			const redAlpha0_5 = red.alpha(0.5)
			assert.deepEqual(redAlpha0_5.rgba(), [255, 0, 0, 0.5])
		})
		test("alpha(x) should not modify the instance", () => {
			const red = chroma("red")
			const redRGBA = red.rgba()
			red.alpha(0.5)
			assert.deepEqual(red.rgba(), redRGBA)
		})

		const red = chroma("red")
		test("darker", () => assertColorsEqual(red.darker(), "#c20000"))
		test("darken more", () => assertColorsEqual(red.darker(2), "#890000"))
		test("darken too much", () => assertColorsEqual(red.darker(10), "#000000"))
		test("brighten", () => assertColorsEqual(red.brighter(), "#ff5a36"))
		test("brighten too much", () => assertColorsEqual(red.brighter(10), "#ffffff"))
		test("saturate", () => assertColorsEqual(red.saturate(), "#ff0000"))
		test("desaturate", () => assertColorsEqual(red.desaturate(), "#ee3a20"))
		test("desaturate more", () => assertColorsEqual(red.desaturate(2), "#db5136"))
		test("desaturate too much", () => assertColorsEqual(red.desaturate(400), "#7f7f7f"))

		test("premultiplied ", () =>
			assertColorsEqual(chroma("rgba(32, 48, 96, 0.5)").premultiplied(), [16, 24, 48, 0.5]))

		test("hex", () => assert.equal(chroma.rgb(-1, -1, -1).hex(), "#000000"))

		suite("css", () => {
			const lavender = chroma.hsl(270, 0.6, 0.7)
			test("rgb", () => assert.equal(lavender.css(), "rgb(178,133,224)"))
			test("rgb w/ a != 1", () => assert.equal(lavender.alpha(0.5).css(), "rgba(178,133,224,0.5)"))
			test("hsl", () => assert.equal(lavender.css("hsl"), "hsl(270,60%,70%)"))
			test("hsl w/ a != 1", () => assert.equal(lavender.alpha(0.5).css("hsl"), "hsla(270,60%,70%,0.5)"))
			test("throws for invalid mode", () => assert.throws(() => lavender.css("foo" as any)))
		})

		suite("name", () => {
			test("red can be named", () => assert.equal(chroma("red").name(), "red"))
			test("unknown color returns undefined", () => assert.equal(chroma(0x123456).name(), undefined))
			test("closest color", () => {
				const red = chroma("red")
				const slightlyDarkerRed = red.darker(0.1)
				assert.equal(slightlyDarkerRed.name(), undefined)
				assert.equal(slightlyDarkerRed.name(true), "red", "slightlyDarkerRed should still have the name red")
			})
		})

		test("random", () => assert.ok("number" == typeof chroma.random().num()))
		test("randomLab", () => assert.ok(!chroma.randomLab().clipped()))
		test("randomLab w/ randomSource", () => {
			let i = 1
			const randomSource = () => ((i = Math.random()), console.log(i), i)
			assertColorsEqual(chroma.randomLab(() => 0.3), "#e9bd2b")
			const f = (_f: () => Color): string =>
				`<div>${Array.from({ length: 256 }, () =>
					Array.from({ length: 22 }, () => {
						const color = _f()
						const closestName = color.name(true)
						const distance = chroma.distance(color, chroma(closestName))
						// ${closestName} ${distance | 0}
						return `<span style="background-color: ${color.hex()}"></span>`
					}).join(""),
				).join("<br>\n")}</div>`
			const doc = `<html>
<head>
<style>
span {
  width: 50px;
  height: 50px;
  display: inline-block;
  color: white;
  font-size: 6px;
  font-family: "Segoe UI",sans-serif;
  overflow-wrap: break-word;
  vertical-align: top;
  padding: 2px;
}

div {
  float:left;
  margin-right: 60px;
}</style>
</head>
<body>
chroma.random
${f(chroma.random)}
chroma.randomLab
${f(chroma.randomLab)}
</body>
</html>`

			fs.writeFileSync("randomComparison.html", doc, "utf8")
		})
		//test("randomLab w/ randomSource", () =>
		//	assertColorsEqual(
		//		chroma.randomLab(
		//			(() => {
		//				let i = 0
		//				return () => (i = (i + Math.SQRT2) % 1)
		//			})(),
		//		),
		//		"#6a09e6",
		//	))
	})

	suite("average", () => {
		test("average red blue", () => assertColorsEqual(chroma.average(["red", "blue"]), [255 / 2, 0, 255 / 2]))
		test("three colors", () => assertColorsEqual(chroma.average(["blue", "red", "white"]), "#aa55aa"))

		test("three colors lrgb", () =>
			assertColorsEqual(chroma.average(["blue", "red", "white"], "lrgb"), [
				255 * (Math.SQRT2 / 3),
				255 * (1 / 3),
				255 * (Math.SQRT2 / 3),
			]))
		test("alpha avg", () => assertColorsEqual(chroma.average(["rgba(0,0,0,0)", "red"]), [127.5, 0, 0, 0.5]))
		test("average in lab", () => assertColorsEqual(chroma.average(["blue", "red", "white"], "lab"), "#e26daf"))
		test("average h in lch", () => {
			const avg = chroma.average([chroma.lch(50, 50, 0), chroma.lch(50, 50, 90)], "lch")
			assertColorsEqual(avg, chroma.lch(50, 50, 45))
			assert.equal(Math.round(avg.lch()[2]), 45)
		})
		test("average in hsl of same colors", () =>
			assertColorsEqual(chroma.average(["#02c03a", "#02c03a"], "hsl"), "#02c03a"))
	})

	suite("cmyk", () =>
		testConcrete("cmyk", [-3, -3, -3, -3], {
			black: [0, 0, 0, 1],
			white: [0, 0, 0, 0],
			red: [0, 1, 1, 0],
			"#0f0": [1, 0, 1, 0],
			blue: [1, 1, 0, 0],
			yellow: [0, 0, 1, 0],
			cyan: [1, 0, 0, 0],
			magenta: [0, 1, 0, 0],
			gray: [0, 0, 0, 0.498],
		}),
	)
	suite("gl", () =>
		testConcrete("gl", [-3, -3, -3, -3], {
			black: [0, 0, 0, 1],
			white: [1, 1, 1, 1],
			red: [1, 0, 0, 1],
			"#89abcdef": [0x89 / 255, 0xab / 255, 0xcd / 255, 0xef / 255],
		}),
	)

	suite("lch", () => {
		testConcrete("lch", [0, 0, 3], {
			"#000000": [0, 0, 0],
			"#ffffff": [100, 0, 0],
			"#3b3b3b": [25, 0, 0],
			"#777777": [50, 0, 0],
			"#b9b9b9": [75, 0, 0],
		})
		test("lch to RGB", () => {
			assertColorsEqual(chroma.lch([50, 70, 0]), "#dc2c7a")
			assertColorsEqual(chroma.lch([50, 70, 60]), "rgb(189.217, 91.620, 0)")
			assertColorsEqual(chroma.lch([50, 70, 120]), "#548400")
			assertColorsEqual(chroma.lch([50, 70, 180]), "#009175")
			assertColorsEqual(chroma.lch([50, 70, 240]), "#008cde")
			assertColorsEqual(chroma.lch([50, 70, 300]), "#6f67df")
		})
	})

	suite("lab", () => {
		testConcrete("lab", [3, 3, 3], {
			red: [53.241, 80.092, 67.203],
			blue: [32.297, 79.188, -107.86],
			green: [46.227, -51.698, 49.897],
			yellow: [97.139, -21.554, 94.478],
			magenta: [60.324, 98.234, -60.825],
		})
	})
	suite("kelvin", () => {
		suite("kelvin -> color", () => {
			function tempHasColor(expected: Chromable) {
				return function(this: Mocha.Context) {
					assertColorsEqual(chroma.kelvin(+this.test!.title), expected)
				}
			}

			test("1000", tempHasColor("#ff3a00"))
			test("4000", tempHasColor("#ffd0a4"))
			test("5000", tempHasColor("#ffe4cd"))
			test("7000", tempHasColor("#f5f3ff"))
			test("10000", tempHasColor("#ccdcff"))
			test("20000", tempHasColor("#a8c5ff"))
			test("30000", tempHasColor("#9fbeff"))
		})
		suite("color -> temp", () => {
			test("f", () => {
				for (let t = 1000; t < 40000; t += 1000) {
					const [r, g, b] = chroma.kelvin(t).rgba()
					console.log([t, r, g, b, b / r].toString())
				}
			})

			function hasTemp(expected: number, exp = 2) {
				return function(this: Mocha.Context) {
					assert.equal(round10(chroma(this.test!.title.split(/\s+/)[0]).temperature(), exp), expected)
				}
			}

			test("#ff3a00", hasTemp(1000))
			test("#ffd0a4", hasTemp(4000))
			test("#ccdcff", hasTemp(10000))
			test("#a8c5ff", hasTemp(20000))
			test("#9fbeff", hasTemp(30000))
		})
	})
	suite("num", () => {
		testConcrete("num", 1, {
			black: 0x000000,
			white: 0xffffff,
			red: 0xff0000,
		})
	})
	test("clipped", () => {
		assert.equal(chroma.hcl(50, 40, 20).clipped(), true)
		assert.equal(chroma.hcl(50, 40, 40).clipped(), false)
		assert.equal(chroma.hcl(50, 40, 60).clipped(), false)
		assert.equal(chroma.hcl(50, 40, 80).clipped(), true)
		assert.equal(chroma.hcl(50, 40, 100).clipped(), true)
	})

	suite("css parsing", () => {
		// examples from https://developer.mozilla.org/en-US/docs/Web/CSS/color_value

		function isInvalid(this: Mocha.Context) {
			assert.throws(() => chroma(this.test!.title))
		}

		function isColor(...args: any[]) {
			const color = (chroma as any)(...args)
			return function(this: Mocha.Context) {
				assertColorsEqual(chroma(this.test!.title), color)
			}
		}

		const isRGB = (r: number, g: number, b: number, a: number = 1) => isColor(r, g, b, a)
		const isHotPink = isRGB(0xff, 0x00, 0x99)
		/* These examples all specify the same color: a hot pink. */
		/* Hexadecimal syntax */
		test("#f09", isHotPink)
		test("#F09", isHotPink)
		test("#ff0099", isHotPink)
		test("#FF0099", isHotPink)

		/* Functional syntax */
		test("rgb(255,0,153)", isHotPink)
		test("rgb(255, 0, 153)", isHotPink)
		test("rgb(100%,0%,60%)", isHotPink)
		test("rgb(100%, 0%, 60%)", isHotPink)
		test("rgb(100%, 0, 60%)", isInvalid)
		/* ERROR! Don't mix integers and percentages. */
		test("rgb(255 0 153)", isHotPink)

		// /* Hexadecimal syntax with alpha value */
		test("#f09f", isHotPink)
		test("#F09F", isHotPink)
		test("#ff0099ff", isHotPink)
		test("#FF0099FF", isHotPink)

		// /* Functional syntax with alpha value */
		test("rgb(255, 0, 153, 1)", isHotPink)
		test("rgb(255, 0, 153, 100%)", isHotPink)

		// /* Whitespace syntax */
		test("rgb(255 0 153 / 1)", isHotPink)
		test("rgb(255 0 153 / 100%)", isHotPink)

		// with alpha values != 1
		/* Hexadecimal syntax */
		test("#3a30", isRGB(0x33, 0xaa, 0x33, 0))
		/*   0% opaque green */
		test("#3A3F", isRGB(0x33, 0xaa, 0x33, 1))
		/* full opaque green */
		test("#33aa3300", isRGB(0x33, 0xaa, 0x33, 0))
		/*   0% opaque green */
		test("#33AA3388", isRGB(0x33, 0xaa, 0x33, 0x88 / 255))
		/*  50% opaque green */

		/* Functional syntax */
		test("rgba(51, 170, 51, .1)", isRGB(0x33, 0xaa, 0x33, 0.1))
		/*  10% opaque green */
		test("rgba(51, 170, 51, .4)", isRGB(0x33, 0xaa, 0x33, 0.4))
		/*  40% opaque green */
		test("rgba(51, 170, 51, .7)", isRGB(0x33, 0xaa, 0x33, 0.7))
		/*  70% opaque green */
		test("rgba(51, 170, 51,  1)", isRGB(0x33, 0xaa, 0x33, 1))
		/* full opaque green */

		/* Whitespace syntax */
		test("rgba(51 170 51 / 0.4)", isRGB(0x33, 0xaa, 0x33, 0.4))
		/*  40% opaque green */
		test("rgba(51 170 51 / 40%)", isRGB(0x33, 0xaa, 0x33, 0.4))
		/*  40% opaque green */
		test("rgba(100%0%60%/40%)", isRGB(0xff, 0x00, 0x99, 0.4))
		/*  40% opaque green */

		// /* Functional syntax with floats value */
		test("rgb(255, 0, 153.45, 1)", isHotPink)
		test("rgb(1e2, .5e1, .5e0, +.25e2%)", isRGB(100, 5, 0.5, 0.25))

		const isLavender = isColor(chroma.hsl(270, 0.6, 0.7))
		/* These examples all specify the same color: a lavender. */
		test("hsl(270,60%,70%)", isLavender)
		test("hsl(270, 60%, 70%)", isLavender)
		test("hsl(270 60% 70%)", isLavender)
		test("hsl(270deg, 60%, 70%)", isLavender)
		test("hsl(4.712rad, 60%, 70%)", isLavender)
		test("hsl(.75turn, 60%, 70%)", isLavender)

		const isLavenderAlpha = isColor(chroma.hsl(270, 0.6, 0.5, 0.15))
		/* These examples all specify the same color: a lavender that is 15% opaque. */
		test("hsl(270,60%,50%,.15)", isLavenderAlpha)
		test("hsl(270, 60%, 50%, 15%)", isLavenderAlpha)
		test("hsl(270 60% 50% / .15)", isLavenderAlpha)
		test("hsl(270 60% 50% / 15%)", isLavenderAlpha)
	})

	suite("luminance", () => {
		function hasLuminance(expectedLuminance: number) {
			return function(this: Mocha.Context) {
				assert.equal(round10(chroma(this.test!.title).luminance(), -3), round10(expectedLuminance, -3))
			}
		}

		test("black", hasLuminance(0))
		test("white", hasLuminance(1))
		test("red", hasLuminance(0.2126))
		test("yellow brighter than blue", () => assert.ok(chroma("yellow").luminance() > chroma("blue").luminance()))
		test("green darker than red", () => assert.ok(chroma("green").luminance() < chroma("red").luminance()))
		test("hsl", () => {
			console.log()
			for (let i = 0; i < 100; i += 5) {
				const color = chroma.lab(i, 0.2, 0.2)
				const lab = color.lab()

				let expected = color.luminance()
				let actual = (lab[0] / 100) ** 3
				console.log(lab, expected, actual, round10(expected - actual, -3))
				//assert.equal(color.luminance(), )
			}
		})

		// setting luminance
		test("set red luminance to 0.4", () =>
			assert.equal(
				round10(
					chroma("red")
						.luminance(0.4)
						.luminance(),
					-2,
				),
				0.4,
			))
		test("set red luminance to 0", () => {
			const redLum0 = chroma("red").luminance(0)
			console.log(
				chroma("green")
					.alpha(0.3)
					.hex("rgba"),
			)
			console.log(chroma("red").xyz())
			assert.equal(round10(redLum0.luminance(), -2), 0)
			assertColorsEqual(redLum0, "#000")
		})
		test("set black luminance to 0.5", () => {
			const blackLumHalf = chroma("black").luminance(0.5)
			assert.equal(round10(blackLumHalf.luminance(), -2), 0.5)
			assertColorsEqual(blackLumHalf, "#bcbcbc")
		})
		test("setting luminance returns new color", () => {
			const topic = chroma("red")
			assert.equal(round10(topic.luminance(), -2), 0.21, "red luminance is 0.21")
			assert.equal(topic.luminance(0.4).hex(), "#ff8686", "set luminance to 0.4")
			assert.equal(round10(topic.luminance(), -2), 0.21, "old luminance is still 0.21")
			assertColorsEqual(topic, chroma("red"), "old color is still red")
		})
	})

	suite("contrast", () => {
		test("maximum", () => assert.equal(round10(chroma.contrast("black", "white"), -3), 21))
		test("minimum", () => assert.equal(chroma.contrast("white", "white"), 1))
		test("between white and red", () => assert.equal(Math.round(chroma.contrast("red", "white")), 4))
	})

	suite("Testing color averaging modes", () => {
		test("avg some colors", () => assertColorsEqual(chroma.average(["red", "blue"]), chroma.mix("red", "blue")))
		test("three colors", () => assertColorsEqual(chroma.average(["blue", "red", "white"]), "#aa55aa"))
		test("three colors lrgb", () =>
			assertColorsEqual(chroma.average(["blue", "red", "white"], "lrgb"), [
				(255 * Math.SQRT2) / 3,
				255 / 3,
				(255 * Math.SQRT2) / 3,
			]))
		test("alpha avg", () => assertColorsEqual(chroma.average(["rgba(0,0,0,0)", "red"]), [127.5, 0, 0, 0.5]))
		test("average in lab", () => assertColorsEqual(chroma.average(["blue", "red", "white"], "lab"), "#e26daf"))
		test("average h in lch", () => {
			const avg = chroma.average([chroma.lch(50, 50, 0), chroma.lch(50, 50, 90)], "lch")
			assertColorsEqual(avg, chroma.lch(50, 50, 45))
			console.log(
				chroma
					.bezier(["white", "black"])(0)
					.hex(),
			)
			assert.equal(round10(avg.lch()[2], 0), 45)
		})
		test("average in hsl of same colors", () =>
			assertColorsEqual(chroma.average(["#02c03a", "#02c03a"], "hsl"), "#02c03a"))
		test("average same colors", () => assertColorsEqual(chroma.average(["#02c03a", "#02c03a"]), "#02c03a"))
	})

	suite("Testing lightness correction", () => {
		test("simple two color linear interpolation", () => {
			const f = chroma.scale(["white", "black"]).mode("lab")
			assert.equal(Math.round(f(0.5).lab()[0]), 50, "center L is 50")
		})

		test("hot - w/o correction", () => {
			const f = chroma.scale(["white", "yellow", "red", "black"]).mode("lab")
			assert.equal(Math.round(f(0.5).lab()[0]), 75, "center L is 74")
		})

		test("hot - w/ correction", () => {
			const f = chroma
				.scale(["white", "yellow", "red", "black"])
				.mode("lab")
				.correctLightness(true)
			assert.equal(Math.round(f(0.5).lab()[0]), 50, "center L")
		})

		test("hot - w/o correction - domained [0,100]", () => {
			const f = chroma
				.scale(["white", "yellow", "red", "black"])
				.domain(0, 100)
				.mode("lab")
			assert.equal(Math.round(f(50).lab()[0]), 75, "center L")
		})

		test("hot - w/ correction - domained [0,100]", () => {
			const f = chroma
				.scale(["white", "yellow", "red", "black"])
				.domain(0, 100)
				.mode("lab")
				.correctLightness(true)
			assert.equal(Math.round(f(50).lab()[0]), 50, "center L")
		})

		test("hot - w/o correction - domained [0,20,40,60,80,100]", () => {
			const f = chroma
				.scale(["white", "yellow", "red", "black"])
				.domain(0, 20, 40, 60, 80, 100)
				.mode("lab")
			assert.equal(Math.round(f(50).lab()[0]), 75, "center L")
		})

		test("hot - w/ correction - domained [0,20,40,60,80,100]", () => {
			const f = chroma
				.scale(["white", "yellow", "red", "black"])
				.domain(0, 20, 40, 60, 80, 100)
				.mode("lab")
				.correctLightness(true)
			assert.equal(Math.round(f(50).lab()[0]), 50, "center L")
		})
	})

	suite("bezier", () => {
		test("simple two color linear interpolation", () => {
			const f = chroma.bezier("white", "black")
			assertColorsEqual(f(0), "#ffffff", "starts from white")
			assertColorsEqual(f(1), "#000000", "ends in black")
			assertColorsEqual(f(0.5), "#777777", "center is grey")
		})

		test("three color quadratic bezier interpolation", () => {
			const f = chroma.bezier("white", "red", "black")
			assertColorsEqual(f(0), "#ffffff", "starts from white")
			assertColorsEqual(f(1), "#000000", "ends in black")
			assertColorsEqual(f(0.5), "#c45c44", "center is a greyish red")
		})

		test("four color cubic bezier interpolation", () => {
			const f = chroma.bezier("white", "yellow", "red", "black")
			assertColorsEqual(f(0), "#ffffff", "starts from white")
			assertColorsEqual(f(1), "#000000", "ends in black")
			assertColorsEqual(f(0.25), "#ffe085", "1st quarter")
			assertColorsEqual(f(0.5), "#e69735", "center")
			assertColorsEqual(f(0.75), "#914213", "3rd quarter")
		})

		test("five color diverging quadratic bezier interpolation", () => {
			const f = chroma.bezier("darkred", "orange", "snow", "lightgreen", "royalblue")
			assertColorsEqual(f(0), "#8b0000", "starts from darkred")
			assertColorsEqual(f(1), "#4169e1", "ends in royalblue")
			assertColorsEqual(f(0.5), "#fffafa", "center is snow")
			assertColorsEqual(f(0.25), "#e9954e", "1st quarter")
			assertColorsEqual(f(0.75), "#a6cfc1", "3rd quarter")
		})

		test("using bezier in a chroma.scale", () => {
			const f = chroma
				.bezier(["darkred", "orange", "snow", "lightgreen", "royalblue"])
				.scale()
				// .domain([0, 1], 5)
				.out("hex")
			assertColorsEqual(f(0), "#8b0000", "starts from darkred")
			assertColorsEqual(f(1), "#4169e1", "ends in royalblue")
			assertColorsEqual(f(0.5), "#fffafa", "center is snow")
			assertColorsEqual(f(0.25), "#e9954e", "1st quarter")
			assertColorsEqual(f(0.75), "#a6cfc1", "3rd quarter")
		})
	})

	suite("cubehelix", () => {
		test("default helix", () => {
			const t = chroma.cubehelix()
			assertColorsEqual(t(0), "#000000", "starts in black")
			assertColorsEqual(t(0.25), "#16534c", "at 0.25")
			assertColorsEqual(t(0.5), "#a07949", "at 0.5")
			assertColorsEqual(t(0.75), "#c7b3ed", "at 0.75")
			assertColorsEqual(t(1), "#ffffff", "ends in white")
		})
		test("red helix", () => {
			const t = chroma.cubehelix(0, 1, 1, 1)
			assertColorsEqual(t(0), "#000000", "starts in black")
			assertColorsEqual(t(0.25), "#2e5117", "at 0.25")
			assertColorsEqual(t(0.5), "#4c949f", "at 0.5")
			assertColorsEqual(t(0.75), "#d1aee8", "at 0.75")
			assertColorsEqual(t(1), "#ffffff", "ends in white")
		})
		test("red helix - partial l range", () => {
			const t = chroma.cubehelix(0, 1, 1, 1, [0.25, 0.75])
			assertColorsEqual(t(0), "#663028", "starts")
			assertColorsEqual(t(0.25), "#49752d", "at 0.25")
			assertColorsEqual(t(0.5), "#4c949f", "at 0.5")
			assertColorsEqual(t(0.75), "#b68ad2", "at 0.75")
			assertColorsEqual(t(1), "#e6b0a8", "ends")
		})
		test("red helix - gamma", () => {
			const t = chroma.cubehelix(0, 1, 1, 0.8, [0, 1])
			assertColorsEqual(t(0), "#000000", "starts in black")
			assertColorsEqual(t(0.25), "#3f6824", "at 0.25")
			assertColorsEqual(t(0.5), "#60a6b1", "at 0.5")
			assertColorsEqual(t(0.75), "#dabcee", "at 0.75")
			assertColorsEqual(t(1), "#ffffff", "ends in white")
		})
		test("red helix - no saturation", () => {
			const t = chroma.cubehelix(0, 1, 0, 1, [0, 1])
			assertColorsEqual(t(0), "#000000", "starts in black")
			assertColorsEqual(t(0.25), "#404040", "at 0.25")
			assertColorsEqual(t(0.5), "#808080", "at 0.5")
			assertColorsEqual(t(0.75), "#bfbfbf", "at 0.75")
			assertColorsEqual(t(1), "#ffffff", "ends in white")
		})
		test("red helix - saturation range", () => {
			const t = chroma.cubehelix(0, 1, [1, 0], 1, [0, 1])
			assertColorsEqual(t(0), "#000000", "starts in black")
			assertColorsEqual(t(0.25), "#324c21", "at 0.25")
			assertColorsEqual(t(0.5), "#668a8f", "at 0.5")
			assertColorsEqual(t(0.75), "#c4bbc9", "at 0.75")
			assertColorsEqual(t(1), "#ffffff", "ends in white")
			assert.ok(t(0.33).hsl()[1] > t(0.66).hsl()[1], "saturation decreases")
		})
		test("non-array lightness", () => {
			const t = chroma.cubehelix(300, -1.5, 1, 1, 0.5)
			assertColorsEqual(t(0), "#ae629f", "start")
			assertColorsEqual(t(0.5), "#a07949", "at 0.5")
			assertColorsEqual(t(1), "#519d60", "end")
		})
	})

	suite("interpolation", () => {
		test("hsv interpolation white <-> red", () =>
			assertColorsEqual(chroma("white").interpolate("red", 0.5, "hsv"), "#ff8080"))
		test("use mix as alias", () => assertColorsEqual(chroma("white").mix("red", 0.5, "hsv"), "#ff8080"))
		test("alternative mix syntax", () => assertColorsEqual(chroma.mix("red", "blue", 0.25), "#bf0040"))
		test("hsl interpolation white <-> red", () =>
			assertColorsEqual(chroma("white").interpolate("red", 0.5, "hsl"), "#df9f9f"))
		test("rgb interpolation white <-> red", () =>
			assertColorsEqual(chroma("white").interpolate("red", 0.5, "rgb"), "#ff8080"))
		test("hsv interpolation red <-> white", () =>
			assertColorsEqual(chroma("red").interpolate("white", 0.5, "hsv"), "#ff8080"))
		test("hsl interpolation red <-> white", () =>
			assertColorsEqual(chroma("red").interpolate("white", 0.5, "hsl"), "#df9f9f"))
		test("rgb interpolation red <-> white", () =>
			assertColorsEqual(chroma("red").interpolate("white", 0.5, "rgb"), "#ff8080"))
		test("interpolation short function", () => {
			const f = (t: number) => chroma.interpolate("#ff0000", "#ffffff", t, "hsv")
			assertColorsEqual(f(0), "#ff0000", "starts at red")
			assertColorsEqual(f(0.5), "#ff8080", "goes over light red")
			assertColorsEqual(f(1), "#ffffff", "ends at white")
		})

		//test("num interpolation white <-> red", () =>
		//	assertColorsEqual(chroma(0xffffff).interpolate(0xff0000, 0.5, "num"), "#ff7fff"))
		//test("num interpolation red <-> white", () =>
		//	assertColorsEqual(chroma(0xff0000).interpolate(0xffffff, 0.5, "num"), "#ff7fff"))
		//test("interpolation short function w/ num provided", () => {
		//	const f = (t: number) => chroma.interpolate(0xff0000, 0xffffff, t, "num")
		//	assertColorsEqual(f(0), "#ff0000", "starts at red")
		//	assertColorsEqual(f(0.5), "#ff7fff", "goes over light red")
		//	assertColorsEqual(f(1), "#ffffff", "ends at white")
		//})
		//test("interpolate in num", () =>
		//	assertColorsEqual(chroma.interpolate(chroma.num(0xffffe0), chroma.num(0x102180), 0.5, "num"), "#8810b0"))

		test("interpolate in hsv", () => assertColorsEqual(chroma.interpolate("white", "black", 0.5, "hsv"), "#808080"))
		test("interpolate in hsl", () =>
			assertColorsEqual(chroma.interpolate("lightyellow", "navy", 0.5, "hsl"), "#31ff98"))
		test("interpolate in lrgb", () => assertColorsEqual(chroma.interpolate("red", "blue", 0.5, "lrgb"), "#b400b4"))

		test("throws for invalid color mode", () =>
			assert.throws(() => chroma.interpolate("red", "white", 0.2, "cmyk")))
	})

	suite("blend", () => {
		test("multiply 1", () => assertColorsEqual(chroma.blend("red", "#5a9f37", "multiply"), "#5a0000"))
		test("multiply 2", () => assertColorsEqual(chroma.blend("#33b16f", "#857590", "multiply"), "#1b513f"))
		test("screen", () => assertColorsEqual(chroma.blend("#b83d31", "#0da671", "screen"), "#bcbb8c"))
		test("overlay", () => assertColorsEqual(chroma.blend("#b83d31", "#0da671", "overlay"), "#784f2b"))
	})

	suite("scale", () => {
		test("simple rgb scale (white -> black)", () => {
			const f = chroma.scale("white", "black")
			assertColorsEqual(f(0), "#ffffff", "starts white")
			assertColorsEqual(f(0.5), "#808080", "mid gray")
			assertColorsEqual(f(1), "#000000", "ends black")
		})
		test("simple hsv scale (white -> black)", () => {
			const f = chroma.scale(["white", "black"]).mode("hsv")
			assertColorsEqual(f(0), "#ffffff", "starts white")
			assertColorsEqual(f(0.5), "#808080", "mid gray")
			assertColorsEqual(f(1), "#000000", "ends black")
			assert.deepEqual(f.colors(), ["#ffffff", "#000000"], "colors")
			assert.deepEqual(f.colors(2), ["#ffffff", "#000000"], "colors start and end")
			assert.deepEqual(f.colors(2, "rgb")[1], [0, 0, 0], "color mode")
			assert.equal(f.colors(2, undefined).length, 2, "color mode null len")
		})
		test("simple hsv scale (white -> black), classified", () => {
			const f = chroma
				.scale(["white", "black"])
				.classes(7)
				.mode("hsv")
			assertColorsEqual(f(0), "#ffffff", "starts white")
			assertColorsEqual(f(0.5), "#808080", "mid gray")
			assertColorsEqual(f(1), "#000000", "ends black")
			assert.deepEqual(f.colors(7), ["#ffffff", "#d5d5d5", "#aaaaaa", "#808080", "#555555", "#2a2a2a", "#000000"])
		})
		test("simple lab scale (white -> black)", () => {
			const f = chroma.scale(["white", "black"]).mode("lab")
			assertColorsEqual(f(0), "#ffffff", "starts white")
			assertColorsEqual(f(0.5), "#777777", "mid gray")
			assertColorsEqual(f(1), "#000000", "ends black")
		})
		test("colorbrewer scale", () => {
			const f = chroma.scale("RdYlGn")
			assertColorsEqual(f(0), "#a50026")
			assertColorsEqual(f(0.5), "#ffffbf")
			assertColorsEqual(f(1), "#006837")
		})
		test("colorbrewer scale w/ domain", () => {
			const f = chroma.scale("RdYlGn").domain(0, 100)
			assertColorsEqual(f(0), "#a50026")
			assertColorsEqual(f(50), "#ffffbf")
			assertColorsEqual(f(100), "#006837")
		})
		test("colorbrewer scale w/ domain w/ classes", () => {
			const f = chroma
				.scale("RdYlGn")
				.domain(0, 100)
				.classes(5)
			assertColorsEqual(f(0), "#a50026")
			assertColorsEqual(f(10), "#a50026")
			assertColorsEqual(f(50), "#ffffbf")
			assertColorsEqual(f(100), "#006837")
			assert.deepEqual(f.colors(5), ["#a50026", "#f98e52", "#ffffbf", "#86cb67", "#006837"], "get colors")
			assert.equal(new Set(f.colors(100) as string[]).size, 5, "only 5 different values")
		})
		test("calling domain with no arguments", () => {
			const f = chroma
				.scale("RdYlGn")
				.domain(0, 100)
				.classes(5)
			assert.deepEqual(f.domain(), [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100], "returns domain")
			assert.deepEqual(f.classes(), [0, 20, 40, 60, 80, 100], "returns classes")
		})
		test("source array is not modified", () => {
			const colors = chroma.brewer.Blues.slice(0)
			assert.equal(colors.length, 9)
			assert.equal(typeof colors[0], "number")
			chroma.scale(colors)
			assert(true)
			assert.equal(typeof colors[0], "number")
		})
		test("domain with same min and max", () => {
			const f = chroma.scale(["white", "black"]).domain(1, 1)
			assert.deepEqual(f(1).hex(), "#000000", "returns color")
		})
		//test("simple num scale (white -> black)", () => {
		//	const f = chroma.scale(["white", "black"]).mode("num")
		//	assertColorsEqual(f(0), "#ffffff", "starts white")
		//	assertColorsEqual(f(0.25), "#bfffff", "25%")
		//	assertColorsEqual(f(0.5), "#7fffff", "50%")
		//	assertColorsEqual(f(0.75), "#3fffff", "75%")
		//	assertColorsEqual(f(0.95), "#0ccccc", "95%")
		//	assertColorsEqual(f(1), "#000000", "ends black")
		//})
		test("css rgb colors", () => {
			const css = chroma
				.scale("YlGnBu")(0.3)
				.css()
			assert.equal(css, "rgb(170,222,183)", "have rounded rgb() values")
		})
		test("css rgba colors", () => {
			const css = chroma
				.scale("YlGnBu")(0.3)
				.alpha(0.675)
				.css()
			assert.equal(css, "rgba(170,222,183,0.675)", "dont round alpha value")
		})
		test("get colors from a scale with more than two colors", () => {
			const f = chroma.scale(["yellow", "orange", "darkgreen"])
			assert.deepEqual(f.colors(), ["#ffff00", "#ffa500", "#006400"], "just origianl colors")
		})
		test("test example in readme", () => {
			const f = chroma.scale("RdYlGn")
			assert.deepEqual(
				f.colors(5),
				["#a50026", "#f98e52", "#ffffbf", "#86cb67", "#006837"],
				"five hex colors (new)",
			)
		})
		suite("padding", () => {
			test("get and set", () => {
				const f = chroma.scale()
				assert.deepEqual(f.padding(), [0, 0])
				f.padding(0.1)
				assert.deepEqual(f.padding(), [0.1, 0.1])
				f.padding(-0.2, 0.1)
				assert.deepEqual(f.padding(), [-0.2, 0.1])
			})
			test("both sides pos", () => {
				const f = chroma.scale("OrRd")
				const fPadded = chroma.scale("OrRd").padding(0.15)
				assertColorsEqual(fPadded(0), f(0.15 / (1 + 0.15 * 2)))
				assertColorsEqual(fPadded(0.5), f(0.5))
				assertColorsEqual(fPadded(1), f((1 + 0.15) / (1 + 0.15 * 2)))
			})
			test("left side neg", () => {
				const f = chroma.scale("OrRd").padding(-0.2, 0)
				assertColorsEqual(f(0), "#fff7ec")
				assertColorsEqual(f(0.2), "#fff7ec")
				assertColorsEqual(f(0.21), "#fff6e8")
				assertColorsEqual(f(1), "#7f0000")
			})
		})
		suite("colors", () => {
			test("get colors from a scale", () => {
				const f = chroma.scale(["yellow", "darkgreen"])
				assert.deepEqual(f.colors(), ["#ffff00", "#006400"], "just colors")
				assert.deepEqual(
					f.colors(5),
					["#ffff00", "#bfd800", "#80b200", "#408b00", "#006400"],
					"five hex colors",
				)
				assert.deepEqual(
					f.colors(3, "css"),
					["rgb(255,255,0)", "rgb(128,178,0)", "rgb(0,100,0)"],
					"three css colors",
				)
			})
			test("returns original colors", () => {
				const f = chroma.scale(["red", "white", "blue"])
				assert.deepEqual(f.colors(), ["#ff0000", "#ffffff", "#0000ff"], "same colors")
			})
			test("num = 1", () => {
				const f = chroma.scale("BuPu")
				assert.deepEqual(f.colors(1), [f(0.5).hex()])
			})
		})

		test("cache performance", () => {
			function run(cache: boolean) {
				const RUNS = 100000
				const s = chroma
					.scale("RdYlGn")
					.mode("lab")
					.cache(cache)
				const round = (f: number) => Math.round((f * RUNS) / 10) / (RUNS / 10)
				const start = new Date().getTime()
				for (let i = 0; i < RUNS; i++) {
					s(round(Math.random()))
				}
				return new Date().getTime() - start
			}

			const timeCache = run(true)
			const timeNoCache = run(false)
			console.log("timeCache: " + Math.round(timeCache) + "ms, timeNoCache: " + Math.round(timeNoCache) + "ms")
			assert.ok(timeCache < timeNoCache)
		})
	})

	test("ntc2", () => {
		assert.equal(chroma("red").shade(), "red")
		console.log(ntc.name(chroma("red").hex()))
		let correct = 0,
			total = 0
		//let intstring = ""
		//for (const c of ntc.names) {
		//	if ((chroma.w3cx11 as any)[c[1].toLowerCase()] === undefined) {
		//		const [r, g, b] = chroma(c[0]).rgb()
		//		intstring += String.fromCharCode(r, g, b)
		//	}
		//}
		//console.log(intstring)
		////@ts-ignore
		//console.log(("undefined" !== typeof btoa ? btoa : require("btoa"))(intstring))
		//return
		let html = `<body><head><style>
span {
width: 22em;
height: 3em;
display: inline-block;
vertical-align: top;
padding: 2px;
font-family: "anonymous pro",sans-serif;
}
</style></head><body>`
		for (const c of ntc.names) {
			if (chroma(c[0]).shade() != c[2].toLowerCase()) {
				const spans = [[c[2]], [c[0], c[1]], [chroma(c[0]).shade()]].map(([cble, cname]) => {
					const cc = chroma(cble)
					return `<span style="background-color: ${cc.css()}; color: ${cc.textColor()}"> ${cname ||
						cc.name()} ${cc.hex()}
<em style="float: right;">LAB ${cc.lab().map(x => round10(x, 0))}</em>
<em style="float: right; clear: right;">HSL ${cc.hsl().map(x => round10(x, -2))}</em>
d=${Math.round(chroma.distance(cc, c[0]))}</span>`
				})
				html += `<div>${spans.join("")}</div>`
				console.log(c)
				console.log(chroma(c[0]).hsl())
				console.log(chroma(c[2].toLowerCase()).css("hsl"))
				console.log(chroma(c[0]).shade(), chroma(chroma(c[0]).shade()).hsl())
				console.log()
				//break
			}
			total++
			correct += +(chroma(c[0]).shade() == c[2].toLowerCase())
		}
		html += `</body></html>`
		fs.writeFileSync("ntc.html", html, "utf8")
		console.log(correct + "/" + total, (((100 * correct) / total) | 0) + "%")
	})
})
