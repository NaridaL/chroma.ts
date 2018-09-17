import sourcemaps from "rollup-plugin-sourcemaps"
import typescriptPlugin from "rollup-plugin-typescript2"
import commonjs from "rollup-plugin-commonjs"
import nodeResolve from "rollup-plugin-node-resolve"
import serve from "rollup-plugin-serve"
import livereload from "rollup-plugin-livereload"
import replace from "rollup-plugin-replace"
import glsl from "rollup-plugin-glsl"
import { plugin as analyze } from "rollup-plugin-analyzer"
import * as typescript from "typescript"
import * as fs from "fs"
import { terser } from "rollup-plugin-terser"

const pkg = JSON.parse(fs.readFileSync("package.json"))
export default {
	input: __dirname + "/index.ts",
	output: {
		format: "iife",
		file: __dirname + (process.env.BUILD == "production" ? "/bundle.min.js" : "/bundle.js"),
		sourcemap: true,
		name: "spaces",
		globals: {
			react: "React",
			"react-dom": "ReactDOM",
		},
		// globals: moduleName => {
		// 	const x = require(moduleName + '/package.json').umdGlobal || pkg.umdGlobals && pkg.umdGlobals[moduleName]
		// 	console.log(moduleName, x)
		// 	return x
		// },
	},
	external: ["react", "react-dom"],
	plugins: [
		nodeResolve({
			// use "module" field for ES6 module if possible
			module: true, // Default: true

			// use "jsnext:main" if possible
			// – see https://github.com/rollup/rollup/wiki/jsnext:main
			jsnext: true, // Default: false

			// use "main" field or index.js, even if it's not an ES6 module
			// (needs to be converted from CommonJS to ES6
			// – see https://github.com/rollup/rollup-plugin-commonjs
			main: true, // Default: true

			// some package.json files have a `browser` field which
			// specifies alternative files to load for people bundling
			// for the browser. If that's you, use this option, otherwise
			// pkg.browser will be ignored
			browser: true, // Default: false

			// not all files you want to resolve are .js files
			extensions: [".js", ".json"], // Default: ['.js']

			// whether to prefer built-in modules (e.g. `fs`, `path`) or
			// local ones with the same names
			preferBuiltins: false, // Default: true

			// Lock the module search in this path (like a chroot). Module defined
			// outside this path will be mark has external
			//   jail: '/my/jail/path', // Default: '/'

			// If true, inspect resolved files to check that they are
			// ES2015 modules
			//   modulesOnly: true, // Default: false

			// Any additional options that should be passed through
			// to node-resolve
			//   customResolveOptions: {
			// 	moduleDirectory: 'js_modules'
			//   }
		}),
		commonjs({
			// non-CommonJS modules will be ignored, but you can also
			// specifically include/exclude files
			// include: 'node_modules/**',  // Default: undefined
			// exclude: [ 'node_modules/foo/**', 'node_modules/bar/**' ],  // Default: undefined
			// these values can also be regular expressions
			// include: /node_modules/

			// search for files other than .js files (must already
			// be transpiled by a previous plugin!)
			extensions: [".js", ".coffee"], // Default: [ '.js' ]

			// if true then uses of `global` won't be dealt with by this plugin
			ignoreGlobal: false, // Default: false

			// if false then skip sourceMap generation for CommonJS modules
			// sourceMap: false,  // Default: true

			// explicitly specify unresolvable named exports
			// (see below for more details)
			namedExports: {
				react: ["Component"],
			}, // Default: undefined

			// sometimes you have to leave require statements
			// unconverted. Pass an array containing the IDs
			// or a `id => boolean` function. Only use this
			// option if you know what you're doing!
			// ignore: [ 'conditional-runtime-dependency' ]
		}),
		replace({
			"process.env.NODE_ENV": JSON.stringify(process.env.BUILD || "development"),
		}),
		sourcemaps(),
		glsl({
			// By default, everything gets included
			include: "/**/*.glslx",

			// Undefined by default
			// exclude: ['**/index.html'],

			// Source maps are on by default
			// sourceMap: false
		}),
		typescriptPlugin({
			typescript,
			tsconfig: __dirname + "/tsconfig.json",
			declaration: false,
		}),
		process.env.BUILD == "production" &&
			terser({
				// mangle: false,
				// output: {
				// 	beautify: true,
				// },
				compress: {
					passes: 4,
				},
				toplevel: true,
			}),
		process.env.ROLLUP_WATCH &&
			serve({
				contentBase: ".",
				open: true,
				openPage: '/spaces/index.html',
				host: "localhost",
				port: 10002,
			}),
		process.env.ROLLUP_WATCH && livereload(),
		process.env.BUILD == "production" && analyze(),
	].filter(x => x),
	onwarn: function(warning, warn) {
		if ("THIS_IS_UNDEFINED" === warning.code) return
		// if ('CIRCULAR_DEPENDENCY' === warning.code) return
		warn(warning)
	},
}
