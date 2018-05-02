"use strict";

const { promisify } = require( 'util' );
const { Service } = require( 'feathers-knex' );
const imageFiles = require( '@openagenda/image-files' );

class Users extends Service {
  setup( app ) {
    this.app = app;
  }

  async setImageProfile( uid, { path, url } ) {
    const user = await this.get( uid );

    const result = await imageFiles.load( {
      path,
      url,
      formats: this._getImageFormats( `user.profile.${user.uid}` )
    } );

    await this.patch( user.uid, {
      image: result.uploadedPaths[ 0 ].split( '/' ).pop()
    } );

    return result;
  }

  async clearImageProfile( uid ) {
    const user = await this.get( uid );

    const extension = user.image.split( '.' ).pop();
    const paths = this._getImageFormats( `user.profile.${user.uid}`, extension ).map( v => v.name );

    const result = await promisify( imageFiles.clear )( paths );

    await this.patch( user.uid, {
      image: null
    } );

    return result;
  }

  async requestChangeEmail( uid, data, params = {} ) {
    const user = await this.get( uid );

    return this.patch( user.uid, data, {
      provider: params.provider,
      query: params.query,
      action: 'requestChangeEmail'
    } );
  }

  async confirmChangeEmail( uid, params ) {
    const user = await this.get( uid );

    return this.patch( user.uid, data, {
      provider: params.provider,
      query: params.query,
      action: 'confirmChangeEmail'
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
