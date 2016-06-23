var babelPlugin = require("./babelRelayPlugin");
var path = require('path');
var webpack = require('webpack');
var HtmlwebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: "./js/app.js",
  output: {
    path: __dirname + "/public",
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.js$/, exclude: /node_modules/,

        loader: "babel",
        query: {
          cacheDirectory: true,
          // plugins: ['transform-decorators-legacy'],
          plugins: ['transform-decorators-legacy', 'transform-runtime', '../../../babelRelayPlugin'],
          presets: ['es2015', 'stage-0', 'react'],
        }

      }

      , {test: /\.json$/, loader: 'json-loader'}
    ]
  }
  , devtool: 'eval-source-map'
  // , devtool: '#eval-cheap-module-source-map'
  ,
  devServer: {
    historyApiFallback: true,
    // hot: true,
    inline: true,
    progress: true
    , port: 5000
  }    
  
  

  , node: {
    // tls: "empty",
    // console: 'empty',
    // net:'empty' ,
    fs: 'empty',

  }


  , plugins: [
    new webpack.HotModuleReplacementPlugin(),


    // new webpack.DefinePlugin({"global.GENTLY": false}),


    new HtmlwebpackPlugin({
      title: 'ADMIN_MODULE'
    })
  ]


};
