#!/usr/bin/env node

'use strict';

const path = require('node:path');
const webpack = require('webpack');
const loadEnvironment = require('../utils/loadEnvironment');

const envDir = process.env.PORTAL_DEV
  ? path.join(__dirname, '../boot')
  : process.cwd();

loadEnvironment(envDir);

const webpackConfig = require('./webpack.inte');

const compiler = webpack(webpackConfig);

compiler.run((err, stats) => {
  if (err) {
    console.error(err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
    return;
  }

  const info = stats.toJson();

  if (stats.hasErrors()) {
    console.error(info.errors);
  }

  if (stats.hasWarnings()) {
    console.warn(info.warnings);
  }

  console.log(stats.toString());
});
