const path = require('path');
module.exports = {
    entry: "/browser/server/index.ts",
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, '../../static/js/server')
    },
    resolve: {
        extensions: [".webpack.js", ".web.js", ".ts", ".js"]
    },
    module: {
        rules: [
            {test: /\.ts$/, loader: "ts-loader"}
        ]
    },
    devtool: 'source-map'
}