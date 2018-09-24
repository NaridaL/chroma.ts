import typescriptPlugin from "rollup-plugin-typescript"
import typescript from "typescript"
import { terser } from "rollup-plugin-terser"
function config(format/* : "umd" | "es" */, compress/*: boolean */) {
	return {
		input: "src/index.ts",
		output: [
			{
				format: format,
				file: "dist/index." + (format === "umd" ? "umd" : "module") + (compress ? ".min" : "") + ".js",
				sourcemap: true,
				name: "chroma",
				exports: "named"
			},
		],
		plugins: [
			typescriptPlugin({
				typescript,
				tsconfig: __dirname + "/tsconfig.json",
				declaration: false,
				resolveJsonModule: false
			}),
			compress && terser({
				compress: {
					passes: 3,
					unsafe: true,
					ecma: 7,
				},
				toplevel: true,
				mangle: {
					// properties: { regex: /^_/ },
				},
				// output: {
				// 	beautify: true,
				// }
			}),
		].filter(x => x),
		onwarn: function(warning, warn) {
			if ("THIS_IS_UNDEFINED" === warning.code) return
			// if ('CIRCULAR_DEPENDENCY' === warning.code) return
			warn(warning)
		},
	}
}

export default [config("es", false), config("es", true), config("umd", false), config("umd", true)]
