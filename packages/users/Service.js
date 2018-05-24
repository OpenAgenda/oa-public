"use strict";

const { promisify } = require( 'util' );
const _ = require( 'lodash' );
const { Service } = require( 'feathers-knex' );
const imageFiles = require( '@openagenda/image-files' );

class Users extends Service {
  async setImageProfile( uid, { path, url }, params = {} ) {
    const user = await this.get( uid );

    const result = await imageFiles.load( {
      path,
      url,
      formats: this._getImageFormats( `user.profile.${user.uid}` )
    } );

    result.user = await this.patch( user.uid, {
      image: result.uploadedPaths[ 0 ].split( '/' ).pop()
    }, {
      provider: params.provider,
      query: params.query,
      action: 'setImageProfile'
    } );

    return result;
  }

  async clearImageProfile( uid, params = {} ) {
    const user = await this.get( uid );

    const extension = user.image.split( '.' ).pop();
    const paths = this._getImageFormats( `user.profile.${user.uid}`, extension ).map( v => v.name );

    await promisify( imageFiles.clear )( paths );

    await this.patch( user.uid, {
      image: null
    }, {
      provider: params.provider,
      query: params.query,
      action: 'clearImageProfile'
    } );

    return { success: true };
  }

  requestChangeEmail( uid, data, params = {} ) {
    return this.patch( uid, data, {
      provider: params.provider,
      query: params.query,
      action: 'requestChangeEmail'
    } );
  }

  confirmChangeEmail( uid, params = {} ) {
    return this.patch( uid, {}, {
      provider: params.provider,
      query: params.query,
      action: 'confirmChangeEmail'
    } );
  }

  changePassword( uid, data, params = {} ) {
    return this.patch( uid, data, {
      provider: params.provider,
      query: params.query,
      action: 'changePassword'
    } );
  }

  generateApiKey( uid, params = {} ) {
    return this.patch( uid, {}, {
      provider: params.provider,
      query: params.query,
      action: 'generateApiKey',
      ..._.pick( params, 'publicKey', 'secretKey' )
    } );
  }

  setNewFlag( uid, data, params = {} ) {
    return this.patch( uid, data, {
      provider: params.provider,
      query: params.query,
      action: 'setNewFlag'
    } );
  }

  refresh( uid, data, params = {} ) {
    return this.patch( uid, data, {
      provider: params.provider,
      query: params.query,
      action: 'refresh'
    } );
  }

  _getImageFormats( name, includeExtension = false ) {
    const extension = includeExtension ? `.${includeExtension}` : '';

    return [ {
      name: name + extension,
      format: { width: 600 }
    }, {
      name: `${name}_o${extension}`
    }, {
      name: `${name}_sm${extension}`,
      format: { width: 300 }
    } ];
  }
}

module.exports = Users;
