import React, { Component, ReactNode, MouseEvent, TouchEvent, PureComponent } from "react"
import { V3, V, M4, DEG } from "ts3dutils"

import { SpacesCanvas, What, Camera, whats as csWhats } from "./SpacesCanvas"
import { Picker, PickerItem } from "./Picker"
import chroma from ".."
import { DrawableColorSpaces, colorSpaces } from "./colorSpaces"
import { colorsExtended } from "../src/colorsExtended"
type Color = chroma.Color
const whats: (PickerItem<What> & { detail: (color: Color) => ReactNode })[] = [
	{
		value: "_50shadesOfGrey",
		title: "50 shades of grey (+ black and white)",
		children: "Evenly spaced in HSL color space.",
		detail: color => {
			const l = color.hsl()[2]
			const i = (l * 51) | 0
			return (0 == i ? "black" : 51 == i ? "white" : "grey " + i + "/50") + " Lightness: " + l.toFixed(2)
		},
	},
	{
		value: "rgbCube16",
		title: "RGB color cube",
		children: "Only the faces of the cube though.",
		detail: color => color.css("rgb"),
	},
	{
		value: "hues",
		title: "Hues",
		children: "All the colors of the rainbow.",
		detail: color => "Hue: " + (color.hsl()[0] | 0),
	},
	{
		value: "w3cx11",
		title: "CSS Colors",
		children: "All the named CSS colors.",
		detail: color => color.name(),
	},
	{
		value: "ks",
		title: "Temperatures",
		children: "",
		detail: color => "Temperature: " + (color.temperature() | 0),
	},
	{
		value: "cubehelix",
		title: "chroma.cubehelix()",
		children: "100 samples of the default settings.",
		detail: () => "",
	},
	{
		value: "scalePaired",
		title: "chroma.scale('Paired')",
		children: "100 samples.",
		detail: () => "",
	},
	{
		value: "hslCylinder",
		title: "HSL cylinder",
		children: "Lightness goes from 1% to 99%, as 0% (black) and 100% (white) colors collapse into a single point.",
		detail: color => color.css("hsl"),
	},
	{
		value: "colors2",
		title: "Extended Colors",
		detail: color => {
			const num = color.num()
			return (Object.keys(colorsExtended) as (keyof typeof colorsExtended)[]).find(
				name => colorsExtended[name] === num,
			)
		},
		children: "",
	},
	{
		value: "l05",
		title: "HSL Cylinder Slice at L=50%",
		children: "",
		detail: () => "",
	},
]
let m
if ((m = (window.location.hash || "").match(/^#(.*?)-((?:[a-f\d]{6})+)$/))) {
	const [, name, hexes] = m
	const colors = hexes.match(/.{6}/g)!.map(hex => chroma.css(hex))
	whats.push({ value: "hash", title: decodeURI(name), children: "from the URL hash", detail: () => "" } as any)
	;(csWhats as any).hash = () => colors
}
class AppState {
	public readonly colorSpace: DrawableColorSpaces = "rgb"
	public readonly what: What = (csWhats as any).hash ? ("hash" as any) : "hslCylinder"
	public readonly rotation: boolean = true
	public readonly highlightedColor: Color | undefined = undefined
	public readonly selectedColor: Color | undefined = undefined

	public readonly camera = new Camera()
}
const colorSpaceItems: PickerItem<DrawableColorSpaces>[] = (Object.keys(colorSpaces) as DrawableColorSpaces[]).map(
	key => {
		const colorSpace = colorSpaces[key]
		return {
			value: key,
			title: colorSpace.title,
			children: colorSpace.children,
		}
	},
)
export class App extends PureComponent<{}, AppState> {
	public state = new AppState()

	protected canvasMousePos = V3.O

	/** Use when dragging. */
	protected cancelNextClick = false

	public render() {
		const { highlightedColor, selectedColor, colorSpace, what, rotation, camera } = this.state
		const displayColor = highlightedColor || selectedColor
		return (
			<>
				<Picker
					id="colorSpace"
					title="Choose a color space..."
					items={colorSpaceItems}
					className="picker"
					onchange={colorSpace => this.setState({ colorSpace })}
					value={this.state.colorSpace}
				/>
				<Picker
					id="what"
					title="...and what to draw:"
					items={whats}
					className="picker"
					onchange={what => this.setState({ what })}
					value={this.state.what}
				/>
				<div id="canvasContainer">
					<SpacesCanvas
						id="spacesCanvas"
						colorSpace={this.state.colorSpace}
						style={{ cursor: highlightedColor ? "crosshair" : "move" }}
						what={this.state.what}
						rotation={rotation}
						colorHighlight={displayColor}
						onHoverChange={highlightedColor => this.setState({ highlightedColor })}
						onClick={this.canvasClick}
						camera={camera}
						onMouseMove={this.canvasMove}
						onTouchMove={this.canvasMove}
					/>
					<div id="info">
						<div
							id="activeColorPreview"
							style={
								displayColor && {
									backgroundColor: displayColor.css(),
									color: displayColor.textColor().name(),
								}
							}
						>
							<div id="activeColorHex">{displayColor && displayColor.hex()}</div>
							<div id="activeColorDetail">
								{displayColor && whats.find(cs => cs.value == what)!.detail(displayColor)}
							</div>
						</div>
						<label>
							<input
								type="checkbox"
								checked={rotation}
								onChange={e => this.setState({ rotation: e.target.checked })}
							/>
							Rotation
						</label>
						<button onClick={() => this.setCamera(V(5, 0, 0.5), V(0, 0, 0.5), V3.Z)}>X</button>
						<button onClick={() => this.setCamera(V(0, 5, 0.5), V(0, 0, 0.5), V3.Z)}>Y</button>
						<button onClick={() => this.setCamera(V(0, 0, 5.5), V(0, 0, 0.5), V3.Y)}>Z</button>
						<button onClick={() => this.setState({ camera: new Camera() })}>Default</button>
						<div style={{ textAlign: "right" }}>
							<a href="github.com/NaridaL/chroma.ts">view source on github</a>
						</div>
					</div>
				</div>
			</>
		)
	}

	protected setCamera(eye: V3, center: V3, up: V3) {
		this.setState({ camera: { eye, center, up } })
	}

	protected canvasMove = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
		let eventOffset
		if (e.type == "mousemove") {
			const me = e as MouseEvent
			eventOffset = V(me.nativeEvent.offsetX, me.nativeEvent.offsetY)
		} else {
			const te = e as TouchEvent
			if (te.targetTouches.length !== 1) {
				return
			}
			eventOffset = V(te.targetTouches[0].clientX, te.targetTouches[0].clientY)
		}
		if (e.type !== "mousemove" || (e as MouseEvent).buttons & 1) {
			const delta = this.canvasMousePos.to(eventOffset)
			const { eye, center, up } = this.state.camera
			const transformation = M4.multiply(
				M4.rotateZ((-delta.x * DEG) / 10),
				M4.rotate((-delta.y * DEG) / 10, eye.to(center).cross(up)),
			)

			this.setState({
				camera: { eye: transformation.transformPoint(eye), center, up: transformation.transformVector(up) },
			})
			this.cancelNextClick = true
			e.preventDefault()
		}
		this.canvasMousePos = eventOffset
	}

	protected canvasClick = () => {
		if (!this.cancelNextClick) {
			this.setState({ selectedColor: this.state.highlightedColor })
		}
		this.cancelNextClick = false
	}
}
