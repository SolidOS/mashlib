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
      // 'auto' determines the public path at runtime based on the script's location
      // This works for both the HTML file and dynamically loaded chunks
      publicPath: 'auto',
      library: {
        name: 'Mashlib',
        type: 'umd'
      },
    },
    resolve: {
      extensions: ['.js', '.ts'],
      alias: {
        // Ensure consistent versions of core libraries
        'rdflib': path.resolve('./node_modules/rdflib'),
        'solid-logic': path.resolve('./node_modules/solid-logic'),
        'solid-ui': path.resolve('./node_modules/solid-ui'),
        UI: path.resolve('./node_modules/solid-ui'),
        // Handle $rdf alias used by solid-logic
        '$rdf': path.resolve('./node_modules/rdflib'),
        // Handle SolidLogic global reference in solid-ui
        'SolidLogic': path.resolve('./node_modules/solid-logic')
      }
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
    devServer: {
      port: 8080,
      open: '/browse-test.html',
      hot: true,
      historyApiFallback: true,
      allowedHosts: 'all',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https: http:; img-src 'self' data: blob: https: http:; connect-src 'self' https: http: ws: wss:;"
      },
      static: [
        {
          directory: path.resolve(process.cwd(), 'static'),
          publicPath: '/'
        },
        {
          directory: path.resolve(process.cwd(), 'dist'),
          publicPath: '/'
        }
      ],
      devMiddleware: {
        publicPath: '/',
        writeToDisk: false
      }
    },
    devtool: 'source-map',
    performance: { hints: false }
}

export default (env, args) => {
  // Shared optimization configuration
  const sharedOptimization = {
    providedExports: true,
    usedExports: true,
    sideEffects: false,
    // Ensure no externals for core libraries - bundle everything
    removeEmptyChunks: true,
    mergeDuplicateChunks: true
  }

  // Check if running in watch mode
  const isWatchMode = process.argv.includes('--watch')

  // For dev server or watch mode, return only unminified config (preserves console.log)
  if (process.env.WEBPACK_SERVE || args.mode === 'development' || isWatchMode) {
    return {
      ...common,
      mode: 'development',
      output: {
        ...common.output,
        filename: 'mashlib.js'
      },
      externals: externalsBase,
      optimization: {
        ...sharedOptimization,
        minimize: false
      }
    }
  }

  // UMD Minified, everything bundled
  const minified = {
    ...common,
    mode: args.mode || 'production',
    output: {
      ...common.output,
      filename: 'mashlib.min.js'
    },
    externals: externalsBase,
    optimization: {
      ...sharedOptimization,
      minimize: true,
      minimizer: [new TerserPlugin({ 
        extractComments: false,
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.debug']
          }
        }
      })]
    }
  }

  // UMD Unminified, everything bundled  
  const unminified = {
    ...common,
    mode: args.mode || 'production',
    output: {
      ...common.output,
      filename: 'mashlib.js'
    },
    externals: externalsBase,
    optimization: {
      ...sharedOptimization,
      minimize: false
    }
  }

  return [minified, unminified]
}

