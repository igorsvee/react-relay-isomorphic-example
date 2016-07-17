var babelPlugin = require("./babelRelayPlugin");
var path = require('path');
var webpack = require('webpack');
var HtmlwebpackPlugin = require('html-webpack-plugin');
var precss = require('precss');
var autoprefixer = require('autoprefixer');
var postcssImport = require('postcss-import');
var pkg = require('./package.json');
import merge from 'webpack-merge'

var ExtractTextPlugin = require('extract-text-webpack-plugin');

const SERVER = process.env.SERVER === 'true';
const DEVELOPMENT = process.env.NODE_ENV === "development";

console.log("DEVELOPMENT " + DEVELOPMENT)
console.log("SERVER " + SERVER)
console.log("NODE_PATH "+process.env.NODE_PATH)

const common = {

  postcss: function (webpack) {
    return [precss, autoprefixer
      , postcssImport({
        addDependencyTo: webpack
      })
    ];
  },

  module: {
    loaders: [
      {
        test: /\.js$/, exclude: /node_modules/,
        loader: "babel",
        query: {
          // ignore babelrc, which is used for some package.json scripts.
          babelrc: !!SERVER,
          cacheDirectory: true,
          plugins: ['transform-decorators-legacy', 'transform-runtime', '../../../babelRelayPlugin'],
          presets: ['es2015', 'stage-0', 'react'],
        }

      }

      , {
        test: /\.css$/,
        // loader: ExtractTextPlugin.extract("isomorphic-style-loader", "css-loader?modules&localIdentName=[local]---[hash:base64:5]&importLoaders=1", "postcss-loader"),
        loader: ExtractTextPlugin.extract("style-loader", "css-loader?modules&localIdentName=[local]---[hash:base64:5]&importLoaders=1", "postcss-loader"),
        exclude: /node_modules/
      }
      , {test: /\.md$/, loader: 'null'}
      , {test: /^inputfile[0-9]+$ /, loader: 'null'}
      , {test: /\.json$/, loader: 'json-loader'}

    ]
  }
  , devtool: 'eval-source-map'
  ,
  devServer: {
    historyApiFallback: true,
    inline: true,
    progress: true
    , port: 5000
  }

}

if (SERVER) {
  console.log("IN SERVER CONFIG")
  module.exports = merge(common, {
    target: "node",
    node: {
      __filename: true,
      __dirname: true,
      console: true
    },
    entry: {
      server: path.resolve(__dirname, "./server/server.js"),
      // main: path.resolve(__dirname, './src/client.js')
    },
    output: {
      path: path.resolve(__dirname, './server/webpack'),
      filename: 'server.js',
      libraryTarget: 'commonjs2'
    }

    , plugins: [

      new webpack.DefinePlugin({
        __DEV__: DEVELOPMENT,
        'process.env.NODE_ENV': JSON.stringify(DEVELOPMENT ? 'development' : 'production')
      }),
      // new ExtractTextPlugin('styles.[chunkhash].css'),
      new ExtractTextPlugin('styles.css'),
      // new ExtractTextPlugin("[name]-[chunkhash].css"),

      // new webpack.optimize.CommonsChunkPlugin({
      //   name: 'vendor',
      //   filename: 'vendor.[hash].js',
      //   minChunks: function (module, count) {
      //     return module.resource && module.resource.indexOf(path.join(__dirname, '..', 'node_modules')) === 0;
      //   }
      // }),

    ]
  })
} else {
  console.log("IN CLIENT CONFIG")
  const deps = Object.keys(pkg.dependencies);

  module.exports = merge(common, {
    entry: "./src/client.js",
    node: {fs: 'empty'},
    // output: {
    //   path: path.resolve(__dirname, './server/static'),
    //   chunkFilename: '/[id].chunk.js',
    //   // filename: DEVELOPMENT ? '[name].[chunkhash].js' : '[name].[chunkhash].min.js'
    //   filename: DEVELOPMENT ? '[name].[chunkhash].js' : '[name].[chunkhash].min.js'
    // },
    //  SPLIT
    //  entry:{
    //    vendor: deps,
    //    app: path.resolve(__dirname, './src/client.js')
    //  } ,
    output: {
      path: path.resolve(__dirname, './server/static'),
      chunkFilename: '/[id].chunk.js',
      // filename: DEVELOPMENT ? '[name].js' : '[name].min.js'  // app filename not vendor
      filename: DEVELOPMENT ? 'app.js' : 'app.min.js'  // app filename not vendor
    },
     // output: {
     //   path: path.resolve(__dirname, './server/static'),
     //   chunkFilename: '/[id].chunk.js',
     //   filename: DEVELOPMENT ? '[name].[chunkhash].js' : '[name].[chunkhash].min.js'
     // },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new ExtractTextPlugin('styles.css'),
      new webpack.DefinePlugin({
        __DEV__: DEVELOPMENT,
        'process.env.NODE_ENV': JSON.stringify(DEVELOPMENT ? 'development' : 'production')
      }),

      // new ExtractTextPlugin('styles.[chunkhash].css'),

      // new ExtractTextPlugin('[name].css'),
      // new ExtractTextPlugin("[name]-[chunkhash].css"),

      // new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js')

      // new webpack.optimize.CommonsChunkPlugin({
      //   name: 'vendor',
      //   // filename: 'vendor.[hash].js',
      //   filename: 'vendor.js',
      //   minChunks: function (module, count) {
      //     return module.resource && module.resource.indexOf(path.join(__dirname, '..', 'node_modules')) === 0;
      //   }
      // })
    ]
  })
}



