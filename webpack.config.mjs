import path from 'path'
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import CopyPlugin from 'copy-webpack-plugin'
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'

const PACKAGE_RESOLUTION_MODE = 'package'
const WORKSPACE_RESOLUTION_MODE = 'workspace'

const packageAliases = {
  'rdflib': path.resolve('./node_modules/rdflib'),
  'solid-logic': path.resolve('./node_modules/solid-logic'),
  'solid-ui$': path.resolve('./node_modules/solid-ui/dist/solid-ui.esm.js'),
  'UI$': path.resolve('./node_modules/solid-ui/dist/solid-ui.esm.js'),
  'solid-ui/components/header$': path.resolve('./node_modules/solid-ui/dist/components/header/index.esm.js'),
  'solid-panes$': path.resolve('./node_modules/solid-panes/dist/index.js'),
  'pane-registry': path.resolve('./node_modules/pane-registry'),
  '$rdf': path.resolve('./node_modules/rdflib'),
  'SolidLogic': path.resolve('./node_modules/solid-logic')
}

const workspaceAliases = {
  'solid-panes$': path.resolve('../solid-panes/src/index.ts'),
  'solid-ui$': path.resolve('../solid-ui/src/index.ts'),
  'UI$': path.resolve('../solid-ui/src/index.ts'),
  'solid-ui/components/header$': path.resolve('../solid-ui/src/v2/components/header/index.ts'),
}

function getResolutionMode (env = {}) {
  const resolutionMode = env.resolutionMode || process.env.MASHLIB_RESOLUTION_MODE || PACKAGE_RESOLUTION_MODE
  if (resolutionMode !== PACKAGE_RESOLUTION_MODE && resolutionMode !== WORKSPACE_RESOLUTION_MODE) {
    throw new Error(`Invalid mashlib webpack resolution mode: ${resolutionMode}. Use "${PACKAGE_RESOLUTION_MODE}" or "${WORKSPACE_RESOLUTION_MODE}".`)
  }
  return resolutionMode
}

function getResolveConfig (resolutionMode) {
  return {
    extensions: ['.js', '.ts'],
    alias: {
      ...packageAliases,
      ...(resolutionMode === WORKSPACE_RESOLUTION_MODE ? workspaceAliases : {})
    }
  }
}

const externalsBase = {
  'fs': 'null',
  'node-fetch': 'fetch',
  'isomorphic-fetch': 'fetch',
  '@xmldom/xmldom': 'window',
  'text-encoding': 'TextEncoder',
  'whatwg-url': 'window',
  '@trust/webcrypto': 'crypto'
}

function createCommonConfig (resolutionMode) {
  return {
    entry: [
      './src/index.ts'
    ],
    target: 'web',
    output: {
      path: path.resolve(process.cwd(), 'dist'),
      // Use /mashlib/dist/ for GitHub Pages, / for localhost
      publicPath: process.env.PUBLIC_PATH || '/',
      library: {
        name: 'Mashlib',
        type: 'umd'
      },
    },
    resolve: getResolveConfig(resolutionMode),
    module: {
      rules: [
        {
          test: /\.ttl$/, // Target text  files
          type: 'asset/source', // Load the file's content as a string
        },
        {
          test: /\.(mjs|js|ts)$/,
          exclude: (modulePath) => {
            if (/node_modules[\/\\]solid-panes[\/\\]src/.test(modulePath)) return false
            return /node_modules|bower_components/.test(modulePath)
          },
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
}

export default (env, args) => {
  const resolutionMode = getResolutionMode(env)
  const common = createCommonConfig(resolutionMode)

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

