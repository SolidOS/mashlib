import path from 'path'
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import CopyPlugin from 'copy-webpack-plugin'
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'

const externalsBase = {
  'fs': 'null',
  'node-fetch': 'fetch',
  'isomorphic-fetch': 'fetch',
  '@xmldom/xmldom': 'window',
  'text-encoding': 'TextEncoder',
  'whatwg-url': 'window',
  '@trust/webcrypto': 'crypto'
}

const common = {
    entry: [
      './src/index.ts'
    ],
    target: 'web',
    output: {
      path: path.resolve(process.cwd(), 'dist'),
      publicPath: '/',
      library: {
        name: 'Mashlib',
        type: 'umd'
      },
    },
    resolve: {
      extensions: ['.js', '.ts'],
    },
    module: {
      rules: [
        {
          test: /\.ttl$/, // Target text  files
          type: 'asset/source', // Load the file's content as a string
        },
        {
          test: /\.(mjs|js|ts)$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
          }
        },
        {
          test: /^.*\/solid-app-set\/.*\.js$/,
          loader: 'babel-loader'
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            'css-loader'
          ],
        },
        {
          test: /\.(eot|ttf|woff2?)$/i,
          loader: 'file-loader'
        },
        {
          test: /\.(png|jpg|gif|svg)$/i,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 8192,
              },
            },
          ],
        },
      ]
    },
    plugins: [
      new webpack.DefinePlugin({ 'global.IS_BROWSER': true }),
      new HtmlWebpackPlugin({
        title: 'SolidOS Web App',
        template: './src/databrowser.html',
        filename: 'databrowser.html'
      }),
      new MiniCssExtractPlugin({
        filename: 'mash.css'
      }),
      new NodePolyfillPlugin(),
      new CopyPlugin({
        patterns: [
          { from: 'static', to: '.' }
        ]
      })
    ],
    devtool: 'source-map',
    performance: { hints: false }
}

// UMD Minified, rdflib bundled
const minified = {
  ...common,
  mode: 'production',
  output: {
    ...common.output,
    filename: 'mashlib.min.js'
  },
  externals: externalsBase,
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({ extractComments: false })]
  }
}

// UMD Unminified, rdflib bundled
const unminified = {
  ...common,
  mode: 'production',
  output: {
    ...common.output,
    filename: 'mashlib.js'
  },
  externals: externalsBase,
  optimization: {
    minimize: false
  }
}

export default [
  minified,
  unminified
]

