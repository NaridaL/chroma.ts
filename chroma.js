require("ts-node").register({ transpileOnly: true, compilerOptions: { module: "commonjs" } })
module.exports = require("./src/index.ts").default
