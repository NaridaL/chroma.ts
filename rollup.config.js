import typescriptPlugin from "@rollup/plugin-typescript"
import typescript from "typescript"
import { terser } from "rollup-plugin-terser"

const pkg = require("./package.json")
export default {
	input: "src/index.ts",
	output: [
		["es", false],
		["es", true],
		["umd", false],
		["umd", true],
	].map(([format, compress]) => ({
		format: format,
		entryFileNames: "[name].[format]" + (compress ? ".min" : "") + ".js",
		sourcemap: true,
		dir: "dist",
		name: pkg.umdGlobal,
		exports: "named",
		plugins: compress
			? [
					terser({
						compress: {
							passes: 3,
							unsafe: true,
							ecma: 7,
						},
						toplevel: true,
						mangle: {
							properties: { regex: /^_/ },
						},
					}),
			  ]
			: [],
	})),
	external: Object.keys(pkg.dependencies || {}),
	plugins: [typescriptPlugin({ typescript })].filter((x) => x),
	onwarn: function (warning, warn) {
		if ("THIS_IS_UNDEFINED" === warning.code) return
		// if ('CIRCULAR_DEPENDENCY' === warning.code) return
		warn(warning)
	},
}
