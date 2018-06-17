const path = require('path');

module.exports = {
    mode: "development",
    entry: {
        app: [
            'babel-polyfill',
            './js/Game.js',
        ],
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js',
    },
    module: {
        rules: [{
            test: /\.js?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
                presets: ['env', 'stage-0']
            }
        }]
    },
    resolve: {
        modules: [
            path.resolve('./js/'),
            path.resolve('./js/main_menu/'),
            path.resolve('./js/world/'),
            path.resolve('./js/world/camera'),
            path.resolve('./js/world/camera/player_controls'),
            path.resolve('./js/world/camera/builder_controls'),
            path.resolve('./js/gui'),
            path.resolve('./js/game_menu'),
            path.resolve('./node_modules')
        ]
    },
    devtool: "source-map"
};
