const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: './src/main.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './dist')
    },

    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            }
        ]
    },
    
    plugins: [
        new MiniCssExtractPlugin({
            // [contenthash:8] 冒号之后不能有分号
            filename: '[name].css',
        })
    ], 

    devServer: {
        port: '8090',
        open: true,
        hot: true,
        contentBase: path.resolve(__dirname, 'public')
    }
}