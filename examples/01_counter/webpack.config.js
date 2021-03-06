var path = require('path')

module.exports = {
    entry: {
        'index': ['babel-polyfill', './src/index.js']
    },
    output: {
        path: 'dist',
        publicPath: '/dist/',
        filename: '[name].js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    }
};

var reelmSrc = path.join(__dirname, '..', '..', 'src')
var reelmNodeModules = path.join(__dirname, '..', '..', 'node_modules')
var fs = require('fs')

if (fs.existsSync(reelmSrc) && fs.existsSync(reelmNodeModules)) {
    module.exports.resolve = { alias: { 'reelm': reelmSrc } };
    module.exports.module.loaders.push({
        test: /\.js$/,
        loaders: [ 'babel' ],
        include: reelmSrc
    });
}
