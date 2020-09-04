'use strict';

const assert = require('assert');
const fs = require('fs');
const { promisify } = require('util');

const config = require('../testconfig');

const Images = require('../utils/Images');

const copyFile = promisify(fs.copyFile);

describe('agenda-locations - unit - images', function () {

  this.timeout(60000);

  let images;

  before(() => {
    images = Images({
      transforms: [{
        name: '{{name}}',
        width: 600
      }, {
        name: '{{name}}_o'
      }, {
        name: '{{name}}_sm',
        width: 300
      }],
      aws: {
        key: config.files.accessKeyId,
        secret: config.files.secretAccessKey,
        bucket: config.files.bucket,
        ContentType: 'image/jpeg'
      }
    });
  });

  describe('transform', () => {

    after(async () => {
      const files = await promisify(fs.readdir)('/tmp')
        .then(files => files.filter(f => f.match(/^vieilles_pierres/)));

      for (const file of files) {
        await promisify(fs.unlink)('/tmp/' + file);
      }
    });

    it('transform method returns local paths of transformed images', async () => {
      const transormedImages = await images.transform(__dirname + '/fixtures/images/vieilles_pierres.jpg');

      assert.deepEqual(transormedImages, [
        '/tmp/vieilles_pierres.jpg',
        '/tmp/vieilles_pierres_o.jpg',
        '/tmp/vieilles_pierres_sm.jpg'
      ]);
    });

  });

  describe('cdn', () => {

    it('upload method puts files on cdn', async () => {
      const url = await images.upload(__dirname + '/fixtures/images/vieilles_pierres.jpg');

      assert.notEqual(url.indexOf('.amazonaws.com'), -1);
    });

    it('renameUploaded renames files placed on cdn', async () => {
      const url = await images.upload(__dirname + '/fixtures/images/vieilles_pierres.jpg');

      const renamedUrl = await images.renameUploaded('vieilles_pierres.jpg', 'tres_vieilles_pierres.jpg');

      assert.notEqual(renamedUrl.indexOf('tres_vieilles_pierres'), -1);
    });

    it('removeUploaded does not throw exception if remove went alright', async () => {
      const url = await images.upload(__dirname + '/fixtures/images/vieilles_pierres.jpg');

      await images.removeUploaded('vieilles_pierres.jpg');
    });

    it('removeUploaded throws exception if remove did not go well', async () => {
      await images.removeUploaded('fdsqfsdq.jpg');
    });
  });

  describe('group', function() {

    const tmpFile = '/tmp/21_images';
    let urls, movedUrls;

    before(() => {
      fs.copyFileSync(__dirname + '/fixtures/images/vieilles_pierres.jpg', tmpFile);
    });

    before(async () => {
      urls = await images(tmpFile, '21_images_transformed');
      movedUrls = await images.renameUploadedTransforms('21_images_transformed', '21_images_transformed_and_moved');
    });

    it('transforms and puts on cdn', () => {
      for (const url of urls) {
        assert.notEqual(url.indexOf('.amazonaws.com'), -1);
      }
    });

    it('moves what was put on cdn', () => {
      for (const url of movedUrls) {
        assert.notEqual(url.indexOf('.amazonaws.com'), -1);
        assert.notEqual(url.indexOf('_and_moved'), -1);
      }
    });

    it('origin local file is removed', () => {
      assert.equal(fs.existsSync(tmpFile), false)
    });

  });

});
