var babelPlugin = require("./babelRelayPlugin");
var path = require('path');
var webpack = require('webpack');
var HtmlwebpackPlugin = require('html-webpack-plugin');
var precss = require('precss');
var autoprefixer = require('autoprefixer');
var postcssImport = require('postcss-import');
var pkg = require('./package.json');
var TARGET = process.env.npm_lifecycle_event;

const DEV_MODE = TARGET === 'dev';

console.warn("DEV_MODE: " + DEV_MODE);
const deps = Object.keys(pkg.dependencies);
module.exports = {

  entry:{
    vendor: deps,
    main: path.resolve(path.resolve(__dirname), './js/app.js')
  }
 ,
  output: {
    path: path.resolve(__dirname, './server/static'),
    chunkFilename: '/[id].chunk.js',
    filename: DEV_MODE ? '[name].[chunkhash].js' : '[name].[chunkhash].min.js'
  },

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
          cacheDirectory: true,
          // plugins: ['transform-decorators-legacy'],
          plugins: ['transform-decorators-legacy', 'transform-runtime', '../../../babelRelayPlugin'],
          presets: ['es2015', 'stage-0', 'react'],
        }

      }

      , {
        test: /\.css$/,
        // loaders: ['style', 'css?modules&localIdentName=[local]---[hash:base64:5]', 'cssnext'],  //  2st - css, 1 - css
        // loaders: ['style', 'css?modules&localIdentName=[local]---[hash:base64:5]', 'cssnext'],  //  2st - css, 1 - css
        loader: "style-loader!css-loader?modules&localIdentName=[local]---[hash:base64:5]&importLoaders=1!postcss-loader",
        exclude: /node_modules/
      }


      , {test: /\.json$/, loader: 'json-loader'}

      // ,   {
      //   test: /\.html$/,
      //   loader: "html",
      //   include: [
      //     path.resolve(__dirname, "/public"),
      //
      //   ],
      // }

    ]
  }
  , devtool: 'eval-source-map'
  ,
  devServer: {
    historyApiFallback: true,
    // hot: true,
    inline: true,
    progress: true
    , port: 5000
  }


  , node: {
    fs: 'empty',
  }


  , plugins: [
    new webpack.HotModuleReplacementPlugin(),

    new webpack.DefinePlugin({
      __DEV__: DEV_MODE,
      'process.env.NODE_ENV': JSON.stringify(DEV_MODE ? 'development' : 'production')
    }),
    // new webpack.DefinePlugin({"global.GENTLY": false}),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.[hash].js',
      //minChunks: 2


      minChunks: function (module, count) {
        return module.resource && module.resource.indexOf(path.join(__dirname, '..', 'node_modules')) === 0;
      }
    }),

    new HtmlwebpackPlugin({
      title: 'relay_app'
    })
  ]


};
