const path = require('path');

module.exports = (env, argv) => {
    let config = {
        mode: "production",
        entry: {
            app: [
                'babel-polyfill',
                './js/Game.js',
            ],
        },
        output: {
            path: path.resolve(__dirname, 'build/prod'),
            filename: 'bundle.js',
        },
        module: {
            rules: [
                {
                    test: /\.js?$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                    options: {
                        presets: ['env', 'stage-0']
                    }
                },
                {
                    enforce: "pre",
                    test: /\.js?$/,
                    exclude: /node_modules/,
                    loader: "eslint-loader"
                }
            ]
        },
        resolve: {
            modules: [
                path.resolve('./js/'),
                path.resolve('./js/main_menu/'),
                path.resolve('./js/arena/'),
                path.resolve('./js/arena/camera'),
                path.resolve('./js/arena/camera/player_controls'),
                path.resolve('./js/arena/camera/builder_controls'),
                path.resolve('./js/arena/tools'),
                path.resolve('./js/gui'),
                path.resolve('./js/game_menu'),
                path.resolve('./js/connection_screen'),
                path.resolve('./node_modules')
            ]
        }
    };
    if(argv.mode !== 'production'){
        config.devtool = "source-map";
        config.mode = 'development';
        config.output.path = path.resolve(__dirname, 'build');
    }
    return config;
};
