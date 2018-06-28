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
        }
    };
    if(argv.mode !== 'production'){
        config.devtool = "source-map";
        config.mode = 'development';
        config.output.path = path.resolve(__dirname, 'build');
    }
    return config;
};
