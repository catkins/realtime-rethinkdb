var path = require('path');
var webpack = require('webpack');

var publicPath = '/static/';

module.exports = {
  entry: [
    'webpack-dev-server/client?http://localhost:8080',
    'webpack/hot/only-dev-server',
    './src/index'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: publicPath
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['react-hot', 'babel'],
        include: path.join(__dirname, 'src')
      },
      {
        test: /\.css$/,
        loader: 'style!css?modules'
      }
    ]
  },
  devServer: {
    publicPath: publicPath,
    hot: true,
    historyApiFallback: true,
    stats: { colors: true },
  }
};
