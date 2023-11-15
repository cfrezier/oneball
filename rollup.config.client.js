const typescript = require("@rollup/plugin-typescript");
const terser = require("@rollup/plugin-terser");
const iifeNS = require("rollup-plugin-iife-namespace");

module.exports = {
    input: "browser/player/index.ts",
    output: {
        file: "static/js/player/index.js",
        format: "iife",
        name: "client",
    },
    plugins: [
        typescript({module: "esnext", declaration: false, moduleResolution: "bundler"}),
        iifeNS(),
        terser(),
    ]
}