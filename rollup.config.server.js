const typescript = require ("@rollup/plugin-typescript");
const terser = require("@rollup/plugin-terser");
const iifeNS = require("rollup-plugin-iife-namespace");

module.exports = {
    input: "browser/server/index.ts",
    output: {
        file: "static/js/server/index.js",
        format: "iife",
        name: "server",
    },
    plugins: [
        typescript({ module: "esnext", declaration: false, moduleResolution: "bundler" }),
        iifeNS(),
        terser(),
    ]
}