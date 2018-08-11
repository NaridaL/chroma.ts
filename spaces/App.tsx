import React, { Component, ReactNode } from "react"
import { SpacesCanvas, What, Camera } from "./SpacesCanvas"
import { Picker, PickerItem } from "./Picker"
import { V3, V } from "ts3dutils"

import { Color } from "../src"
import { DrawableColorSpaces, colorSpaces } from "./colorSpaces"
class AppState {
	public colorSpace: DrawableColorSpaces = "hsl"
	public what: What = "hslCylinder"
	public rotation: boolean = true
	public highlightedColor: Color | undefined = undefined
	public selectedColor: Color | undefined = undefined

	public camera = new Camera()
}
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
		children: "Lightness goes from 1% to 99%, as 0% (black) and 100% (white) colors collapse into a single",
		detail: color => color.css("hsl"),
	},
]
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
export class App extends Component<{}, AppState> {
	public state = new AppState()

	public render() {
		const { highlightedColor, selectedColor, colorSpace, what, rotation, camera } = this.state
		const displayColor = highlightedColor || selectedColor
		return (
			<div id="container">
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
					{
						// @ts-ignore
						<SpacesCanvas
							id="spacesCanvas"
							colorSpace={this.state.colorSpace}
							what={this.state.what}
							rotation={rotation}
							colorHighlight={displayColor}
							onHoverChange={highlightedColor => this.setState({ highlightedColor })}
							onClick={() => this.setState({ selectedColor: this.state.highlightedColor })}
							camera={camera}
						/>
					}
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
							<div id="activeColorHex">{(displayColor && displayColor.hex()) || "goo"}</div>
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
						<button onClick={() => this.setState({ camera: { eye: V(5, 0, 0), center: V3.O, up: V3.Z } })}>
							X
						</button>
						<button onClick={() => this.setState({ camera: { eye: V(0, 5, 0), center: V3.O, up: V3.Z } })}>
							Y
						</button>
						<button onClick={() => this.setState({ camera: { eye: V(0, 0, 5), center: V3.O, up: V3.Y } })}>
							Z
						</button>
					</div>
				</div>
			</div>
		)
	}
}
