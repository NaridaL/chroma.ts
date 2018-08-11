import React, { Component, HTMLAttributes, MouseEvent } from "react"
import { TSGLContext, Mesh, Shader } from "tsgl"
import { V3, V, M4, DEG, assertNever, lerp, int, Matrix } from "ts3dutils"
import posVS from "tsgl/src/shaders/posVS.glslx"
import memoize from "lodash.memoize"
import colorFS from "tsgl/src/shaders/colorFS.glslx"

// @ts-ignore
import posNormalColorVS from "./interpolationVS.glslx"
import varyingColorFS from "tsgl/src/shaders/varyingColorFS.glslx"
import chroma, { Color, ColorMode } from "../src/index"
import { colorSpaces, DrawableColorSpaces } from "./colorSpaces"

class SpacesCanvasState {}
function distanceLinePoint(anchor: V3, dir: V3, x: V3) {
	// See http://mathworld.wolfram.com/Point-LineDistance3-Dimensional.html
	const dir1 = dir.unit()
	const t = x.minus(anchor).dot(dir1)
	return dir1
		.times(t)
		.plus(anchor)
		.distanceTo(x)

	//return x.minus(this.anchor).cross(x.minus(this.anchor.plus(this.dir1))).length()
}
export class Camera {
	public eye: V3 = V(0, -2.5, 0.5)
	public center: V3 = V3.O
	public up: V3 = V3.Z
}
export type What = keyof typeof whats
interface SpacesCanvasProps extends HTMLAttributes<HTMLCanvasElement> {
	colorSpace: DrawableColorSpaces
	what: What
	rotation: boolean
	onHoverChange: (value: Color | undefined) => void
	colorHighlight: Color | undefined

	camera: Camera
}
export class SpacesCanvas extends Component<SpacesCanvasProps, SpacesCanvasState> {
	public canvas!: HTMLCanvasElement
	public gl!: TSGLContext
	public colorPointsMesh!: Mesh

	public interpolationAnimation: int = 0

	public getColorsForWhat = memoize(function(what: What) {
		return whats[what]()
	})
	public colorPoss!: V3[]
	public colorPossPrev!: V3[]
	public highlightIndex!: int

	public state = new SpacesCanvasState()
	public sphereMesh!: Mesh & { normals: any[]; TRIANGLES: number[]; LINES: number[] }
	protected createMeshForWhat = memoize(
		function(this: SpacesCanvas, what: What, colorSpace: DrawableColorSpaces) {
			return this.createMeshFromColors(this.getColorsForWhat(what), colorSpace)
		},
		(what, colorSpace) => what + " " + colorSpace,
	)
	private rotationTime: int = 0
	private hoverColor: Color | undefined

	public render() {
		const { colorSpace, onHoverChange, what, colorHighlight, rotation, ...htmlAttributes } = this.props
		return <canvas {...htmlAttributes} ref={r => (this.canvas = r!)} onMouseMove={this.onMouseMove} />
	}

	public windowOnResize = () => {
		this.gl.fixCanvasRes()
	}

	public onMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
		const { anchor, dir } = this.gl.getMouseLine(e.nativeEvent)
		const t = this.colorPoss
			.map((p, i) => [p, i] as [V3, int])
			.filter(([p, _i]) => distanceLinePoint(anchor, dir, p) < 0.01)
			.withMax(([p, _i]) => -p.minus(anchor).dot(dir.unit()))
		const newHoverIndex = t ? t[1] : -1
		const newHoverColor = this.getColorsForWhat(this.props.what)[newHoverIndex]
		if (newHoverColor != this.hoverColor) {
			this.hoverColor = newHoverColor
			this.props.onHoverChange(newHoverColor)
		}
	}

	public async componentDidMount() {
		const gl = (this.gl = TSGLContext.create({ canvas: this.canvas }))
		gl.fixCanvasRes()
		gl.meshes = {}
		gl.shaders = {}
		this.sphereMesh = Mesh.sphere(0)
		gl.shaders.singleColor = Shader.create(posVS, colorFS)
		gl.shaders.varyingColor = Shader.create(posNormalColorVS, varyingColorFS)

		gl.clearColor(0.8, 0.8, 0.8, 1)
		gl.enable(gl.DEPTH_TEST)
		gl.enable(gl.CULL_FACE)

		gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE)
		gl.enable(gl.BLEND)

		await gl.setupTextRendering("OpenSans-Regular.png", "OpenSans-Regular.json")

		this.componentDidUpdate()
		gl.animate((t, dt) => this.renderCanvas(t, dt))

		window.addEventListener("resize", this.windowOnResize)
	}

	public componentDidUpdate(prevProps?: Readonly<SpacesCanvasProps>) {
		console.time()
		const newMesh = this.createMeshForWhat(this.props.what, this.props.colorSpace)
		if (this.colorPointsMesh && prevProps && prevProps.what == this.props.what) {
			newMesh.vertexBuffers.ts_Vertex2 = this.colorPointsMesh.vertexBuffers.ts_Vertex
			this.interpolationAnimation = 2000
		} else {
			newMesh.vertexBuffers.ts_Vertex2 = newMesh.vertexBuffers.ts_Vertex
		}
		this.colorPointsMesh = newMesh

		this.colorPossPrev = this.colorPoss
		this.colorPoss = this.getColorsForWhat(this.props.what).map(colorSpaces[this.props.colorSpace].convert)

		this.highlightIndex =
			undefined == this.props.colorHighlight
				? -1
				: this.getColorsForWhat(this.props.what).findIndex(color => color.equals(this.props.colorHighlight!))
		console.timeEnd()
	}

	public componentWillUnmount() {
		window.removeEventListener("resize", this.windowOnResize)
	}

	protected renderCanvas(_t: number, dt: number) {
		const { gl } = this
		const { eye, center, up } = this.props.camera
		if (this.props.rotation) {
			this.rotationTime += dt
		}
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

		gl.cullFace(gl.BACK)

		gl.matrixMode(gl.PROJECTION)
		gl.loadIdentity()
		gl.perspective(40, gl.canvas.width / gl.canvas.height, 0.1, 1000)
		gl.lookAt(eye, center, up)

		gl.matrixMode(gl.MODELVIEW)
		gl.loadIdentity()
		// gl.rotate((this.rotationTime / 1000) * 10, 0, 0, 1)
		gl.pushMatrix()
		colorSpaces[this.props.colorSpace].render(gl)
		gl.popMatrix()
		let f = 0
		if (this.interpolationAnimation > 0) {
			f = this.interpolationAnimation / 2000
			this.interpolationAnimation -= dt
		}
		gl.shaders.varyingColor.uniforms({ f }).draw(this.colorPointsMesh)
		if (-1 !== this.highlightIndex) {
			gl.cullFace(gl.FRONT)
			const pos =
				0 == f
					? this.colorPoss[this.highlightIndex]
					: this.colorPoss[this.highlightIndex].lerp(this.colorPossPrev[this.highlightIndex], f)
			gl.translate(pos)
			gl.scale(0.01 * 1.8)
			gl.shaders.singleColor
				.uniforms({ color: this.props.colorHighlight!.textColor().gl() })
				.draw(this.sphereMesh)
		}
	}
	protected createMeshFromColors(colors: Color[], colorSpace: DrawableColorSpaces) {
		const { sphereMesh } = this
		const tempMatrix1 = new M4(),
			tempMatrix2 = new M4(),
			tempMatrix3 = new M4()
		const pointMeshes = colors.map(color => {
			const pos = colorSpaces[colorSpace].convert(color)
			const pointSize = 0.01
			const glColor = color.gl()
			const result = sphereMesh
				.transform(M4.multiply(M4.translate(pos, tempMatrix2), M4.scale(pointSize, tempMatrix1), tempMatrix3))
				.addVertexBuffer("colors", "ts_Color")
			result.colors = fillArray(sphereMesh.vertices.length, glColor)
			return result
		})
		return new Mesh()
			.addIndexBuffer("TRIANGLES")
			.addVertexBuffer("normals", "ts_Normal")
			.addVertexBuffer("colors", "ts_Color")
			.concat(...pointMeshes)
			.compile()
	}
}
const whats = {
	hues() {
		return Array.from({ length: 180 }, (_, i) => chroma.hsl(i * 2, 1, 0.5))
	},
	rgbCube16() {
		return rgbCube(16)
	},
	w3cx11() {
		return Object.keys(chroma.w3cx11).map(x => chroma(x))
	},
	_50shadesOfGrey() {
		return Array.from({ length: 52 }, (_, i) => chroma.hsl(0, 0, i / 51))
	},
	ks() {
		const result = []
		for (let i = 1000; i <= 40000; i += 100) {
			result.push(chroma.kelvin(i))
		}
		return result
	},
	cubehelix() {
		return chroma.scale(chroma.cubehelix()).colors(100, false) as Color[]
	},
	scalePaired() {
		return chroma.scale("Paired").colors(100, false) as Color[]
	},
	hslCylinder() {
		const X = 5
		const Y = 10
		const R = 90
		const result = []
		for (let r = 0; r < R; r++) {
			for (let x = 0; x < X; x++) {
				for (let y = 0; y < Y; y++) {
					result.push(chroma.hsl((r / R) * 360, x / (X - 1), lerp(0.01, 0.99, y / (Y - 1))))
				}
				// result.push(chroma.hsl((r / R) * 360, x / X, 0))
				// result.push(chroma.hsl((r / R) * 360, x / X, 1))
			}
		}
		return result
	},
}
function rgbCube(r = 16) {
	return Mesh.box(r, r, r).vertices.map(({ x, y, z }) => chroma.gl(x, y, z, 1))
}

function fillArray(length: int, value: {}) {
	const result = new Array(length)
	let i = length
	while (i--) {
		result[i] = value
	}
	return result
}
