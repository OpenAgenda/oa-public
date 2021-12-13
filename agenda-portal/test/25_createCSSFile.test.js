'use strict';

const fs = require('fs');
const rimraf = require('rimraf');
const createCSSFile = require('../lib/createCSSFile');

const cwd = `${__dirname}/createCSSFile`;

describe('25 - lib/createCSSFile', () => {
  afterAll(() => {
    try {
      rimraf.sync(cwd);
    } catch (e) {
      console.log(e);
    }
  });

  test('successfully builds a css file', async () => {
    await createCSSFile(`${__dirname}/fixtures/sample.scss`, cwd);

    expect(
      fs.readFileSync(`${cwd}/main.css`, 'utf-8')
    ).toEqual('.portal div{background:#00f}');
  });
});
