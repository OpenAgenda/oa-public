'use strict';

const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');

const unusedFile = 'unused.js';

module.exports = (mainSASSFilePath, assetsPath) => new Promise((rs, rj) => {
  webpack(
    {
      mode: 'production',
      entry: mainSASSFilePath,
      output: {
        path: assetsPath,
        filename: unusedFile,
      },
      module: {
        rules: [
          {
            test: /\.s[ac]ss$/i,
            use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
          },
        ],
      },
      plugins: [
        new MiniCssExtractPlugin({
          filename: '[name].css',
          chunkFilename: '[id].css',
        }),
        new CleanWebpackPlugin({
          cleanOnceBeforeBuildPatterns: [
            `${assetsPath}/main.css`
          ]
        })
      ],
      optimization: {
        minimizer: [new CssMinimizerPlugin()],
      },
    },
    err => {
      if (err) {
        return rj(err);
      }
      fs.unlink(`${assetsPath}/${unusedFile}`, () => {
        rs();
      });
    }
  );
});
