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

    ,  {
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
      title: 'relay_app'
    })
  ]


};
