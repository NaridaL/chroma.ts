import { TSGLContext } from "tsgl"
import { V3, DEG, lerp, V } from "ts3dutils"
import chroma, { Color } from "../src"
import React from "react"

export type DrawableColorSpaces = keyof typeof colorSpaces
export const colorSpaces = {
	rgb: {
		render(gl: TSGLContext) {
			gl.translate(-1, -1, -1)
			gl.begin(gl.LINES)
			gl.color("black")
			gl.vertex(V3.O)
			gl.vertex(V(2, 0, 0))
			gl.vertex(V3.O)
			gl.vertex(V(0, 2, 0))
			gl.vertex(V3.O)
			gl.vertex(V(0, 0, 2))
			gl.end()

			gl.pushMatrix()
			gl.rotate(90, 1, 0, 0)

			gl.renderText("0", [0, 0, 0, 1], 0.05, "left", "top")
			gl.translate(1, 0, 0)
			gl.renderText("red", [1, 0, 0, 1], 0.05, "center", "top")
			gl.translate(1, 0, 0)
			gl.renderText("255", [0, 0, 0, 1], 0.05, "right", "top")
			gl.popMatrix()

			gl.pushMatrix()
			gl.rotate(90, 0, 0, 1)
			gl.rotate(90, 1, 0, 0)

			gl.renderText("0", [0, 0, 0, 1], 0.05, "left", "top")
			gl.translate(1, 0, 0)
			gl.renderText("green", [0, 1, 0, 1], 0.05, "center", "top")
			gl.translate(1, 0, 0)
			gl.renderText("255", [0, 0, 0, 1], 0.05, "right", "top")
			gl.popMatrix()

			gl.pushMatrix()
			gl.rotate(-135, 0, 0, 1)
			gl.rotate(90, 1, 0, 0)

			gl.renderText("0", [0, 0, 0, 1], 0.05, "left", "bottom")
			gl.translate(0, 0.5, 0)
			gl.renderText("blue", [0, 0, 1, 1], 0.05, "left", "middle")
			gl.translate(0, 0.5, 0)
			gl.renderText("255", [0, 0, 0, 1], 0.05, "left", "top")
			gl.popMatrix()
		},
		convert(color: Color) {
			const [x, y, z] = color.gl().map(v => lerp(-1, 1, v))
			return new V3(x, y, z)
		},
		title: "RGB",
		children: (
			<>
				The RGB color space. What your screen uses. Red, green and blue channels, generally 8 bits each, for a
				total of 16 million colors.
			</>
		),
	},
	hsl: {
		render(gl: TSGLContext) {
			gl.begin(gl.LINES)
			gl.color("black")
			// lightness
			gl.vertex(V3.O)
			gl.vertex(V3.Z)

			// saturation
			gl.vertex(V3.O)
			gl.vertex(V3.X)

			// hue
			for (let i = 0; i < 256; i++) {
				gl.vertex(V3.sphere((i / 256) * 2 * Math.PI, 0))
				gl.vertex(V3.sphere(((i + 1) / 256) * 2 * Math.PI, 0))
			}
			gl.end()

			for (let hue = 0; hue < 360; hue += 30) {
				gl.pushMatrix()
				gl.rotate(hue, 0, 0, 1)
				gl.translate(1, 0)
				gl.rotate(90, 0, 0, 1.0)
				gl.renderText(hue + "°", chroma.hsl(hue, 1, 0.5).gl(), 0.05, "center", "top")
				gl.renderText(hue + "°", [0, 0, 0, 1], 0.05, "center", "top", 0.2)
				gl.popMatrix()
			}
			gl.pushMatrix()
			gl.rotate(90, 1, 0, 0)

			gl.renderText("0", [0, 0, 0, 1], 0.05, "left", "top")
			gl.translate(0.5, 0, 0)
			gl.renderText("saturation", [0, 0, 0, 1], 0.05, "center", "top")
			gl.translate(0.5, 0, 0)
			gl.renderText("100%", [0, 0, 0, 1], 0.05, "right", "top")
			gl.popMatrix()

			gl.pushMatrix()
			// gl.rotate(-135, 0, 0, 1)
			gl.rotate(90, 1, 0, 0)

			gl.renderText("0", [0, 0, 0, 1], 0.05, "left", "bottom")
			gl.translate(0, 0.5, 0)
			gl.renderText("lightness", [0, 0, 0, 1], 0.05, "left", "middle")
			gl.translate(0, 0.5, 0)
			gl.renderText("100%", [0, 0, 0, 1], 0.05, "left", "top")
			gl.popMatrix()
		},
		convert(color: Color) {
			const [h, s, l] = color.hsl()
			return V3.polar(s, h * DEG).plus(new V3(0, 0, l))
		},
		title: "HSL",
		children: <>Hue, saturation and lightness. Also supported by CSS.</>,
	},
	hsv: {
		render(gl: TSGLContext) {
			gl.begin(gl.LINES)
			gl.color("black")
			// lightness
			gl.vertex(V3.O)
			gl.vertex(V3.Z)

			// saturation
			gl.vertex(V3.O)
			gl.vertex(V3.X)

			// hue
			for (let i = 0; i < 256; i++) {
				gl.vertex(V3.sphere((i / 256) * 2 * Math.PI, 0))
				gl.vertex(V3.sphere(((i + 1) / 256) * 2 * Math.PI, 0))
			}
			gl.end()

			for (let hue = 0; hue < 360; hue += 30) {
				gl.pushMatrix()
				gl.rotate(hue, 0, 0, 1)
				gl.translate(1, 0)
				gl.rotate(90, 0, 0, 1.0)
				gl.renderText(hue + "°", chroma.hsl(hue, 1, 0.5).gl(), 0.05, "center", "top")
				gl.renderText(hue + "°", [0, 0, 0, 1], 0.05, "center", "top", 0.2)
				gl.popMatrix()
			}
			gl.pushMatrix()
			gl.rotate(90, 1, 0, 0)

			gl.renderText("0", [0, 0, 0, 1], 0.05, "left", "top")
			gl.translate(0.5, 0, 0)
			gl.renderText("saturation", [0, 0, 0, 1], 0.05, "center", "top")
			gl.translate(0.5, 0, 0)
			gl.renderText("100%", [0, 0, 0, 1], 0.05, "right", "top")
			gl.popMatrix()

			gl.pushMatrix()
			// gl.rotate(-135, 0, 0, 1)
			gl.rotate(90, 1, 0, 0)

			gl.renderText("0", [0, 0, 0, 1], 0.05, "left", "bottom")
			gl.translate(0, 0.5, 0)
			gl.renderText("value", [0, 0, 0, 1], 0.05, "left", "middle")
			gl.translate(0, 0.5, 0)
			gl.renderText("100%", [0, 0, 0, 1], 0.05, "left", "top")
			gl.popMatrix()
		},
		convert(color: Color) {
			const [h, s, v] = color.hsv()
			return V3.polar(s, h * DEG).plus(new V3(0, 0, v))
		},
		title: "HSV",
		children: <></>,
	},
	hcl: {
		render(gl: TSGLContext) {
			gl.begin(gl.LINES)
			gl.color("black")
			// lightness
			gl.vertex(V3.O)
			gl.vertex(V3.Z)

			// saturation
			gl.vertex(V3.O)
			gl.vertex(V3.X)

			// hue
			for (let i = 0; i < 256; i++) {
				gl.vertex(V3.sphere((i / 256) * 2 * Math.PI, 0))
				gl.vertex(V3.sphere(((i + 1) / 256) * 2 * Math.PI, 0))
			}
			gl.end()

			for (let hue = 0; hue < 360; hue += 30) {
				gl.pushMatrix()
				gl.rotate(hue, 0, 0, 1)
				gl.translate(1, 0)
				gl.rotate(90, 0, 0, 1.0)
				gl.renderText(hue + "°", chroma.hsl(hue, 1, 0.5).gl(), 0.05, "center", "top")
				gl.renderText(hue + "°", [0, 0, 0, 1], 0.05, "center", "top", 0.2)
				gl.popMatrix()
			}
			gl.pushMatrix()
			gl.rotate(90, 1, 0, 0)

			gl.renderText("0", [0, 0, 0, 1], 0.05, "left", "top")
			gl.translate(0.5, 0, 0)
			gl.renderText("chroma", [0, 0, 0, 1], 0.05, "center", "top")
			gl.translate(0.5, 0, 0)
			gl.renderText("200", [0, 0, 0, 1], 0.05, "right", "top")
			gl.popMatrix()

			gl.pushMatrix()
			// gl.rotate(-135, 0, 0, 1)
			gl.rotate(90, 1, 0, 0)

			gl.renderText("0", [0, 0, 0, 1], 0.05, "left", "bottom")
			gl.translate(0, 0.5, 0)
			gl.renderText("luminance", [0, 0, 0, 1], 0.05, "left", "middle")
			gl.translate(0, 0.5, 0)
			gl.renderText("100", [0, 0, 0, 1], 0.05, "left", "top")
			gl.popMatrix()
		},
		convert(color: Color) {
			const [h, c, l] = color.hcl()
			return V3.polar(c / 200, h * DEG).plus(new V3(0, 0, l / 100))
		},
		title: "HCL",
		children: (
			<>
				<a href="https://en.wikipedia.org/wiki/HCL_color_space">wiki</a>
			</>
		),
	},
	lab: {
		render(gl: TSGLContext) {
			// gl.translate(-0.5, -0.5, -0.5)
			gl.begin(gl.LINES)
			gl.color("black")
			// L*
			gl.vertex(V3.O)
			gl.vertex(new V3(0, 0, 1))
			// A*
			gl.vertex(new V3(-128 / 100, 0, 0))
			gl.vertex(new V3(128 / 100, 0, 0))
			// B*
			gl.vertex(new V3(0, -128 / 100, 0))
			gl.vertex(new V3(0, 128 / 100, 0))
			gl.end()

			gl.pushMatrix()
			gl.rotate(90, 1, 0, 0)

			gl.renderText("0", [0, 0, 0, 1], 0.05, "left", "top")
			gl.translate(0.5, 0, 0)
			gl.renderText("red", [1, 0, 0, 1], 0.05, "center", "top")
			gl.translate(0.5, 0, 0)
			gl.renderText("255", [0, 0, 0, 1], 0.05, "right", "top")
			gl.popMatrix()

			gl.pushMatrix()
			gl.rotate(90, 0, 0, 1)
			gl.rotate(90, 1, 0, 0)

			gl.renderText("0", [0, 0, 0, 1], 0.05, "left", "top")
			gl.translate(0.5, 0, 0)
			gl.renderText("green", [0, 1, 0, 1], 0.05, "center", "top")
			gl.translate(0.5, 0, 0)
			gl.renderText("255", [0, 0, 0, 1], 0.05, "right", "top")
			gl.popMatrix()

			gl.pushMatrix()
			gl.rotate(-135, 0, 0, 1)
			gl.rotate(90, 1, 0, 0)

			gl.renderText("0", [0, 0, 0, 1], 0.05, "left", "bottom")
			gl.translate(0, 0.5, 0)
			gl.renderText("blue", [0, 0, 1, 1], 0.05, "left", "middle")
			gl.translate(0, 0.5, 0)
			gl.renderText("255", [0, 0, 0, 1], 0.05, "left", "top")
			gl.popMatrix()
		},
		convert(color: Color) {
			const [l, a, b] = color.lab()
			return new V3(a / 100, b / 100, l / 100)
		},
		title: "CIELAB",
		children: (
			<>
				CIELAB color space. Much closer to perceptual uniform that RGB or HSL.{" "}
				<a href="https://en.wikipedia.org/wiki/CIELAB_color_space">wiki</a>
			</>
		),
	},
}
