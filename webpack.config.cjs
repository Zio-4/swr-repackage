/* eslint-disable quote-props */
const path = require('path');
const webpack = require('webpack');
// // eslint-disable-next-line import/no-extraneous-dependencies
const { merge } = require('webpack-merge');
// // eslint-disable-next-line import/no-extraneous-dependencies
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const TerserPlugin = require("terser-webpack-plugin");
// const { EsbuildPlugin } = require('esbuild-loader')

const commonConfig = {
  entry: {
    index: path.resolve(__dirname, 'src/experiment', 'serve.js'),
  },
  output: {
    filename: '[name].[contenthash].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: {
      keep: /\.git/,
    },
    // library: {
    //   type: 'module',
    // },
  },
  optimization: {
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // get the name. E.g. node_modules/packageName/not/this/part.js
            // or node_modules/packageName
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

            // npm package names are URL-safe, but some servers don't like @ symbols
            return `npm.${packageName.replace('@', '')}`;
          },
          chunks: 'all',
        },
      },
    },
  },
  resolve: {
    fallback: {
      path: require.resolve("path-browserify")
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-env', { targets: "defaults" }]
          ]
        }
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name][ext]',
        },
      },
      {
        test: /\.mp3$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
              outputPath: 'audio',
            },
          },
        ],
      },
      {
        test: /\.mp4$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'video',
            },
          },
        ],
      },
      {
        test: /\.csv$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'corpora',
            },
          },
        ],
      },
    ],
  },
  experiments: {
    topLevelAwait: true,
    // outputModule: true
  },
};

const productionConfig = {
  mode: 'production',
};

const developmentConfig = {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: './dist',
  },
};

const libraryConfig = {
  mode: 'production',
  output: {
    filename: '[name].[contenthash].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: {
      keep: /\.git/,
    },
    library: {
      type: 'module',
    },
  },
  experiments: {
    topLevelAwait: true,
    outputModule: true
  },
}

module.exports = async (env, args) => {
  const roarDB = env.dbmode === 'production' ? 'production' : 'development';

  let merged;
  switch (args.mode) {
    case 'development':
      merged = merge(commonConfig, developmentConfig);
      break;
    case 'production':
      merged = merge(commonConfig, productionConfig);
      break;
    case 'none':
      merged = merge(commonConfig, libraryConfig)
    default:
      throw new Error('No matching configuration was found!');
  }

  return merge(merged, {
    plugins: [
      new HtmlWebpackPlugin({ title: 'Rapid Online Assessment of Reading - SWR'}),
      new webpack.ids.HashedModuleIdsPlugin(), // so that file hashes don't change unexpectedly
      new webpack.DefinePlugin({
        ROAR_DB: JSON.stringify(roarDB)
      }),
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
    ],
  });
};
