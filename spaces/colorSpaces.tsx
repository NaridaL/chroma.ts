import { TSGLContext } from "tsgl"
import { V3, DEG, lerp, V } from "ts3dutils"
import chroma from ".."
import React from "react"
type Color = chroma.Color
export type DrawableColorSpaces = keyof typeof colorSpaces
function renderHueCylinder(
	gl: TSGLContext,
	radius: number,
	radialStart: string,
	radialName: string,
	radialEnd: string,
	vStart: string,
	vName: string,
	vEnd: string,
) {
	gl.begin(gl.LINES)
	gl.color("black")
	// lightness
	gl.vertex(V3.O)
	gl.vertex(V(0, 0, 1))

	// saturation
	gl.vertex(V3.O)
	gl.vertex(V(radius, 0, 0))

	for (let i = 0; i < 256; i++) {
		gl.vertex(V3.polar(radius, (i / 256) * 2 * Math.PI, 0))
		gl.vertex(V3.polar(radius, ((i + 1) / 256) * 2 * Math.PI, 0))
	}
	gl.end()

	for (let hue = 0; hue < 360; hue += 30) {
		gl.pushMatrix()
		gl.rotate(hue, 0, 0, 1)
		gl.translate(radius, 0)
		gl.rotate(90, 0, 0, 1.0)
		gl.renderText(hue + "°", chroma.hsl(hue, 1, 0.5).gl(), 0.05, "center", "top")
		gl.renderText(hue + "°", [0, 0, 0, 1], 0.05, "center", "top", 0.2)
		gl.popMatrix()
	}

	gl.pushMatrix()
	gl.rotate(90, 1, 0, 0)

	gl.renderText(radialStart, [0, 0, 0, 1], 0.05, "left", "top")
	gl.translate(0.25, 0, 0)
	gl.renderText(radialName, [0, 0, 0, 1], 0.05, "center", "top")
	gl.translate(0.25, 0, 0)
	gl.renderText(radialEnd, [0, 0, 0, 1], 0.05, "right", "top")
	gl.popMatrix()

	// lightness
	gl.pushMatrix()
	// gl.rotate(-135, 0, 0, 1)
	gl.rotate(90, 1, 0, 0)

	gl.renderText(vStart, [0, 0, 0, 1], 0.05, "left", "bottom")
	gl.translate(0, 0.5, 0)
	gl.renderText(vName, [0, 0, 0, 1], 0.05, "left", "middle")
	gl.translate(0, 0.5, 0)
	gl.renderText(vEnd, [0, 0, 0, 1], 0.05, "left", "top")
	gl.popMatrix()
}
export const colorSpaces = {
	rgb: {
		render(gl: TSGLContext) {
			gl.translate(-0.5, -0.5, 0)
			gl.begin(gl.LINES)
			gl.color("black")
			gl.vertex(V3.O)
			gl.vertex(V3.X)
			gl.vertex(V3.O)
			gl.vertex(V3.Y)
			gl.vertex(V3.O)
			gl.vertex(V3.Z)
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
			const [x, y, z] = color.gl()
			return new V3(x - 0.5, y - 0.5, z)
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
			renderHueCylinder(gl, 0.5, "0", "saturation", "100%", "0", "lightness", "100%")
		},
		convert(color: Color) {
			const [h, s, l] = color.hsl()
			return V3.polar(s * 0.5, h * DEG).plus(new V3(0, 0, l))
		},
		title: "HSL",
		children: <>Hue, saturation and lightness. Also supported by CSS.</>,
	},
	hsv: {
		render(gl: TSGLContext) {
			renderHueCylinder(gl, 0.5, "0", "saturation", "100%", "0", "value", "100%")
		},
		convert(color: Color) {
			const [h, s, v] = color.hsv()
			return V3.polar(s * 0.5, h * DEG).plus(new V3(0, 0, v))
		},
		title: "HSV",
		children: <></>,
	},
	hcl: {
		render(gl: TSGLContext) {
			renderHueCylinder(gl, 0.5, "0", "chroma", "200", "0", "luminance", "100")
		},
		convert(color: Color) {
			const [l, c, h] = color.lch()
			return V3.polar((c / 200) * 0.5, h * DEG).plus(new V3(0, 0, l / 100))
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
			gl.begin(gl.LINES)
			gl.color("black")
			// L*
			gl.vertex(V3.O)
			gl.vertex(new V3(0, 0, 1))
			// A*
			gl.vertex(new V3((-87 / 100) * 0.5, 0, 0))
			gl.vertex(new V3((99 / 100) * 0.5, 0, 0))
			// B*
			gl.vertex(new V3(0, (-108 / 100) * 0.5, 0))
			gl.vertex(new V3(0, (95 / 100) * 0.5, 0))
			gl.end()

			gl.pushMatrix()
			gl.rotate(90, 1, 0, 0)

			gl.renderText("A*", [1, 0, 0, 1], 0.05, "center", "top")
			gl.translate((-87 / 100) * 0.5, 0, 0)
			gl.renderText("-87", [0, 0, 0, 1], 0.05, "left", "top")
			gl.translate(((99 + 87) / 100) * 0.5, 0, 0)
			gl.renderText("99", [0, 0, 0, 1], 0.05, "right", "top")
			gl.popMatrix()

			gl.pushMatrix()
			gl.rotate(90, 0, 0, 1)
			gl.rotate(90, 1, 0, 0)

			gl.renderText("B*", [1, 0, 0, 1], 0.05, "center", "top")
			gl.translate((-108 / 100) * 0.5, 0, 0)
			gl.renderText("-108", [0, 0, 0, 1], 0.05, "left", "top")
			gl.translate(((95 + 108) / 100) * 0.5, 0, 0)
			gl.renderText("95", [0, 0, 0, 1], 0.05, "right", "top")
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
			return new V3((a / 100) * 0.5, (b / 100) * 0.5, l / 100)
		},
		title: "CIELAB",
		children: (
			<>
				CIELAB color space. Much closer to perceptual uniform that RGB or HSL.{" "}
				<a href="https://en.wikipedia.org/wiki/CIELAB_color_space">wiki</a>
			</>
		),
	},
	xyz: {
		render(gl: TSGLContext) {
			gl.begin(gl.LINES)
			gl.color("black")
			// L*
			gl.vertex(V3.O)
			gl.vertex(new V3(0, 0, 1))
			// A*
			gl.vertex(new V3((-87 / 100) * 0.5, 0, 0))
			gl.vertex(new V3((99 / 100) * 0.5, 0, 0))
			// B*
			gl.vertex(new V3(0, (-108 / 100) * 0.5, 0))
			gl.vertex(new V3(0, (95 / 100) * 0.5, 0))
			gl.end()

			gl.pushMatrix()
			gl.rotate(90, 1, 0, 0)

			gl.renderText("X", [1, 0, 0, 1], 0.05, "center", "top")
			gl.translate((-87 / 100) * 0.5, 0, 0)
			gl.renderText("-87", [0, 0, 0, 1], 0.05, "left", "top")
			gl.translate(((99 + 87) / 100) * 0.5, 0, 0)
			gl.renderText("99", [0, 0, 0, 1], 0.05, "right", "top")
			gl.popMatrix()

			gl.pushMatrix()
			gl.rotate(90, 0, 0, 1)
			gl.rotate(90, 1, 0, 0)

			gl.renderText("Y", [1, 0, 0, 1], 0.05, "center", "top")
			gl.translate((-108 / 100) * 0.5, 0, 0)
			gl.renderText("-108", [0, 0, 0, 1], 0.05, "left", "top")
			gl.translate(((95 + 108) / 100) * 0.5, 0, 0)
			gl.renderText("95", [0, 0, 0, 1], 0.05, "right", "top")
			gl.popMatrix()

			gl.pushMatrix()
			gl.rotate(-135, 0, 0, 1)
			gl.rotate(90, 1, 0, 0)

			gl.renderText("0", [0, 0, 0, 1], 0.05, "left", "bottom")
			gl.translate(0, 0.5, 0)
			gl.renderText("Z", [0, 0, 1, 1], 0.05, "left", "middle")
			gl.translate(0, 0.5, 0)
			gl.renderText("255", [0, 0, 0, 1], 0.05, "left", "top")
			gl.popMatrix()
		},
		convert(color: Color) {
			const [x, y, z] = color.xyz()
			return new V3(x * 0.5, y * 0.5, z)
		},
		title: "XYZ",
		children: (
			<>
				CIELAB color space. Much closer to perceptual uniform that RGB or HSL.{" "}
				<a href="https://en.wikipedia.org/wiki/CIELAB_color_space">wiki</a>
			</>
		),
	},
}
