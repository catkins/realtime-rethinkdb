var path = require('path');
var webpack = require('webpack');

var host = 'http://localhost:3001';
var publicPath = host + '/static/';

module.exports = {
  entry: [ './src/index' ],
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
        loaders: ['babel'],
        include: path.join(__dirname, 'src')
      },
      {
        test: /\.css$/,
        loader: 'style!css?modules'
      }
    ]
  }
};
