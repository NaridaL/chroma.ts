import ReactDOMServer from "react-dom/server"
import chroma from "./src/index"
import {
	DeclarationReflection,
	Type,
	ContainerReflection,
	SignatureReflection,
	ParameterReflection,
	TypeParameterReflection,
} from "typedoc"
import * as React from "react"
import { ReactNode, ReactElement } from "react"
import * as fs from "fs"
import { lerp, lerpInv, round10 } from "ts3dutils"
import { tmpNameSync } from "tmp"
import { execSync } from "child_process"
import filesize from "filesize"
import { gzip, gzipSync } from "zlib"
// @ts-ignore
import svgToDataURL from "svg-to-dataurl"
// @ts-ignore
import unescape from "unescape"
import ReactMarkdown from "react-markdown"
// import docjson from "./doc.json"

// const tmpName = tmpNameSync({ postfix: ".json" })
const tmpName = "./doc.json"
console.log(tmpName)
execSync("node node_modules/typedoc/bin/typedoc src/index.ts --json " + tmpName, {
	cwd: __dirname,
	stdio: "inherit",
})
const docjson = require(tmpName)

// @ts-ignore
import { gfm } from "turndown-plugin-gfm"
// @ts-ignore
import TurndownService from "turndown"
import { SourceReference } from "typedoc/dist/lib/models/sources/file"
import { TypeAliasDeclaration } from "typescript"

let scaleCounter = 0

const turndownService = new TurndownService({ codeBlockStyle: "fenced" })
turndownService.use(gfm)
turndownService.keep(["sub"])
turndownService.addRule("keep", {
	filter: ["img"],
	replacement: function(content: string, node: any) {
		return node.outerHTML
	},
})
// turndownService.addRule("inlineLink", {
// 	filter: function(node, options) {
// 		return options.linkStyle === "inlined" && node.nodeName === "A" && node.getAttribute("href")
// 	},

// 	replacement: function(content, node) {
// 		var href = node.getAttribute("href")
// 		var title = node.title ? ' "' + node.title + '"' : ""
// 		return "[" + content + "](" + encodeURI(href) + title + ")"
// 	},
// })

const sorter = (a: any, b: any) => a.sources[0].line - b.sources[0].line

const gzippedBundleSize = filesize(gzipSync(fs.readFileSync("./dist/index.umd.min.js", "utf8")).byteLength)
console.log(gzippedBundleSize)

function DocPage({ docJson }: { docJson: typeof docjson }) {
	docJson.children[0].children.sort(sorter)
	return (
		<>
			<h1>chroma.ts</h1>
			TypeScript rewrite of <a href="https://github.com/gka/chroma.js">chroma-js</a>. Includes:
			<ul>
				<li>Proper ES module support.</li>
				<li>Included typings generated from the source.</li>
				<li>A number of bugfixes.</li>
				<li>
					No more <code>NaN</code> values.
				</li>
				<li>Exceptions on invalid inputs.</li>
				<li>Better inline documentation.</li>
				<li>Smaller ({gzippedBundleSize} gzipped).</li>
			</ul>
			<h2>Installation</h2>
			<pre>
				<code>npm install --save chroma.ts</code>
			</pre>
			<h2>Usage</h2>
			<pre>
				<code className="language-ts">{`// in TypeScript / using ES modules
import chroma from 'chroma.ts'

// commonjs
const chroma = require('chroma.ts').default

chroma.css('powderblue') // create a color
    .darker(2) // transform it
    .gl() // output it`}</code>
			</pre>
			Alternatively, you can include the <a href="./dist/index.umd.js">UMD bundle</a> in a script tag and use the{" "}
			<code>chroma</code> global.
			<h2>API</h2>
			{docJson.children[0].children.map(x => render(x, ""))}
			<h2>License</h2>
			...
		</>
	)
}
function Typealias({ of: props }: { of: TypeAliasDeclaration }) {
	return (
		<>
			<h3>
				<em>type</em> <code>{props.name}</code> = <Type {...props.type} />
			</h3>
			<Comment of={props.comment} />
		</>
	)
}

function Comment(props: { of: any }) {
	const { shortText, text, tags } = props.of || {}
	return (
		<>
			<ReactMarkdown source={shortText} />
			<ReactMarkdown source={text} />
			{tags &&
				tags.map(({ tag, text }: { tag: string; text: string }) => {
					const out = (text: string, result?: React.ReactNode) => (
						<>
							<em>example</em>{" "}
							<code>
								{text
									/* remove existing result in comment */
									.replace(/\/\/\s*=.*?((?=\/\/)|$)/m, "")
									.trim()}
							</code>{" "}
							{result} <br />
						</>
					)
					const getScaleLink = (scale: Scale, name: string) => {
						const d = scale.domain()
						const [min, max] = [d[0], d[d.length - 1]]
						const s = 100
						const hexes = Array.from({ length: s }, (_, i) => scale(lerp(min, max, i / (s - 1))))
							.map(c => c.hex().substr(1))
							.join("")
						return "http://localhost:10002/spaces/index.html#" + encodeURI(name) + "-" + hexes
					}

					if ("example" === tag) {
						const evalFunction = "return (\n" + text + "\n)"
						const format = (x: any) => {
							if ("number" == typeof x) {
								const x2 = round10(x, -2)
								if (x2 !== x) return "~" + x2
								return "" + x
							}
							return JSON.stringify(x)
						}
						try {
							const x = new Function("chroma", evalFunction)(chroma)
							let resultOutput
							if (x instanceof chroma.Color) {
								const imgName = genColorIcon(x)
								return out(text, <img align="right" src={imgName} />)
							} else if ("function" == typeof x) {
								const scale = x.domain ? x : chroma.scale(x)
								const imgName = genScale(scale)

								return out(text, [
									<a href={getScaleLink(scale, text)}>
										<img align="right" src={imgName} />
									</a>,
								])
							} else if (Array.isArray(x)) {
								resultOutput = (
									<>
										[
										{reactJoin(
											x.map(v => {
												if ("number" !== typeof v) {
													try {
														return (
															<img
																align="top"
																src={genColorIcon(
																	chroma(v),
																	true,
																	v instanceof chroma.Color
																		? undefined
																		: JSON.stringify(v),
																)}
															/>
														)
													} catch (e) {}
												}
												return format(v)
											}),
										)}
										]
									</>
								)
							} else {
								resultOutput = <code>{format(x)}</code>
							}
							return out(text, resultOutput)
						} catch (e) {
							console.log(evalFunction)
							console.log(e)
						}
						return out(text)
					}
					return (
						<p>
							@{tag} {text}
						</p>
					)
				})}
		</>
	)
}
function Class({
	of: { name, kindString, comment, children, signatures, sources, typeParameter },
}: {
	of: DeclarationReflection
}) {
	console.log(name)
	return (
		<>
			<h3>
				<em>{kindString == "Class" ? "interface" : "namespace"}</em> <code>{name}</code>
				<TypeParameters of={typeParameter} />
			</h3>
			<Comment of={comment} />
			{signatures &&
				signatures.map((sig, i) => (
					<Signature of={{ ...sig, name: "__call" }} prefix={name} src={sources[i]} />
				))}
			{children && children.sort(sorter) && children.map(c => render(c, name))}
		</>
	)
}
function Objectliteral({ name, kindString, comment, children }: any) {
	console.log(name)
	return (
		<>
			<h3>
				<em>{kindString}</em> <code>{name}</code>
			</h3>
			<Comment of={comment} />
		</>
	)
}
function Method({
	of: { signatures, name, kindString, comment, children, sources },
	prefix,
}: {
	of: DeclarationReflection
	prefix: string
}) {
	return (
		<>
			{signatures.map((sig, i) => (
				<Signature of={sig} prefix={prefix} src={sources[i]} />
			))}
			<Comment of={comment} />
			{children && children.sort(sorter) && children.map(c => render(c, name))}
		</>
	)
}
function render(child: any, prefix: string): React.ReactNode {
	const n = child.kindString.replace(/\s+/g, "")
	const What = X[n] || Class
	if (child.flags && child.flags.isPrivate) {
		return undefined
	}
	if (child.comment && child.comment.tags && child.comment.tags.some(tag => tag.tag === "internal")) {
		return undefined
	}
	if (!child.flags.isExported && !["Interface", "Class"].includes(child.kindString)) {
		return undefined
	}
	if (!What) throw new Error(child.kindString)
	return What && <What of={child} prefix={prefix} />
}
function reactJoin(x: React.ReactNode[], joiner: React.ReactNode = ", ") {
	const result: React.ReactNode[] = []
	x.forEach((x, i) => result.push(...(0 == i ? [x] : [joiner, x])))
	return result
}
function Parameters({ of }: { of: ParameterReflection[] }): React.ReactNode {
	return of
		? reactJoin(
				of.map(param => {
					const defaultMatch =
						param.comment && param.comment.text && param.comment.text.match(/default=(.*)$/m)
					const defaultValue = param.defaultValue || (defaultMatch && defaultMatch[1])
					return (
						<>
							{param.flags.isRest && "..."}
							<em>{param.name}</em>
							{param.flags.isOptional && !defaultMatch && "?"}:{" "}
							<Type {...param.type} noUndefinedInUnion={defaultValue} />
							{defaultValue && " = " + defaultValue.trim()}
						</>
					)
				}),
		  )
		: []
}

function TypeParameters({ of: typeParameters }: { of: TypeParameterReflection[] }) {
	if (!typeParameters) return null
	const uniqueTPs: TypeParameterReflection[] = []
	for (const tp of typeParameters) {
		if (!uniqueTPs.some(utp => utp.name == tp.name)) {
			uniqueTPs.push(tp)
		}
	}
	return (
		<>
			{"&lt;"}
			{reactJoin(uniqueTPs.map(tp => tp.name), ", ")}
			{"&gt;"}
		</>
	)
}
function Signature({ of: sig, prefix, src }: { of: SignatureReflection; prefix: string; src: SourceReference }) {
	return (
		<>
			<h3>
				<a id={sig.name} />
				<code>
					{prefix.toLowerCase()}
					{sig.name != "__call" && "." + sig.name}
				</code>
				<TypeParameters of={sig.typeParameter} />(<Parameters of={sig.parameters} />
				): <Type {...sig.type} /> <Src {...src} />
			</h3>
			<Comment of={sig.comment} />
		</>
	)
}
function Type(type: Type & { inUnion?: boolean; noUndefinedInUnion?: boolean }) {
	switch (type.type) {
		case "reference":
			return (
				<>
					<a href={"#" + type.name}>{type.name}</a>
				</>
			)
		case "intrinsic":
		case "typeParameter":
		case "unknown":
			return type.name
		case "union":
			return reactJoin(
				type.types
					.filter(t => !(type.noUndefinedInUnion && t.type == "intrinsic" && t.name == "undefined"))
					.map(t => <Type {...t} inUnion={true} noUndefinedInUnion={type.noUndefinedInUnion} />),
				" | ",
			)
		case "tuple":
			return <>[{reactJoin(type.elements.map((type, i) => <Type {...type} />))}]</>
		case "reflection":
			if (type.declaration.signatures.length == 1) {
				const sig = type.declaration.signatures[0]
				return (
					<>
						{type.inUnion && "("}(<Parameters of={sig.parameters} />) => <Type {...sig.type} />
						{type.inUnion && ")"}
					</>
				)
			}
		case "array":
			return (
				<>
					<Type {...type.elementType} />
					[]
				</>
			)
		case "stringLiteral":
			return <code>{JSON.stringify(type.value)}</code>
		case "typeOperator":
			return "typeof " + type
	}
	console.log(type)

	throw new Error(type)
}

function Src(x: SourceReference) {
	return (
		<sub>
			<a href={"src/" + x.fileName + "#L" + x.line}>src</a>
		</sub>
	)
}
const imgHeight = "22px"
function genColorIcon(color: chroma.Color, small?: boolean, name?: string) {
	return genSVG(
		color.hex("rgba").substr(1) + (small ? "_small" : "") + (name ? "_name" : ""),
		<svg xmlns="http://www.w3.org/2000/svg" width={small ? "80px" : "100px"} height={imgHeight}>
			<defs>
				<pattern id="bg" viewBox="0,0,10,10" width="16px" height="16px" patternUnits="useSpaceOnUse">
					<rect width="100%" height="100%" fill="red" />
					<rect width="5" height="5" fill="grey" />
					<rect width="5" height="5" x="5" y="5" fill="grey" />
				</pattern>
			</defs>
			<rect width="100%" height="100%" fill="url(#bg)" />
			<g opacity={color.alpha()}>
				<rect width="100%" height="100%" fill={color.hex()} />
				<text
					x="50%"
					y="50%"
					fill={color.textColor().css()}
					textAnchor="middle"
					style={{ fontFamily: "monospace", fontWeight: "bold", dominantBaseline: "central" }}
				>
					{name || color.hex(1 == color.alpha() ? "rgb" : "rgba")}
				</text>
			</g>
		</svg>,
	)
}

function genScale(scale: chroma.Scale) {
	const d = scale.domain()
	const [min, max] = [d[0], d[d.length - 1]]
	const splits = 128
	return genSVG(
		"scale" + scaleCounter++,
		<svg xmlns="http://www.w3.org/2000/svg" width="256px" height={imgHeight}>
			{Array.from({ length: splits }, (_, i) => {
				const f = i / (splits - 1)
				return (
					<rect
						width="2%"
						height="100%"
						x={((f * 100) | 0) + "%"}
						fill={scale(lerp(min, max, f)).hex()}
						key={i}
					/>
				)
			})}

			{d.map(dd => (
				<text
					x={((lerpInv(min, max, dd) * 100) | 0) + "%"}
					y="95%"
					fill={scale(dd)
						.textColor()
						.css()}
					textAnchor={dd == min ? "start" : dd == max ? "end" : "middle"}
					style={{ fontFamily: "monospace", fontSize: "smaller" }}
				>
					{round10(dd, -2)}
				</text>
			))}
		</svg>,
	)
}

function genSVG(name: string, svg: ReactElement<any>) {
	const imgContent = ReactDOMServer.renderToStaticMarkup(svg)
	const fileName = "./readme_img/" + name + ".svg"
	fs.writeFileSync(fileName, imgContent, "utf8")
	return fileName
	// return svgToDataURL(imgContent)
}

const X: { [key: string]: React.ComponentType<any> } = {
	Comment,
	Typealias,
	Class,
	Method,
	Function: Method,
	Objectliteral,
}
const html = ReactDOMServer.renderToStaticMarkup(<DocPage docJson={docjson} />)
const md = turndownService.turndown(html)
const mdFileName = "README.md"
const prevReadme = fs.readFileSync(mdFileName, "utf8")
fs.writeFileSync(mdFileName, md, "utf8")
fs.writeFileSync("README.html", html, "utf8")
process.exit(prevReadme == md ? 0 : 1)
