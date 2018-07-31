"use strict";

const { promisify } = require( 'util' );
const { Service } = require( 'feathers-knex' );
const errors = require( '@feathersjs/errors' );
const imageFiles = require( '@openagenda/image-files' );
const crypto = require( './utils/crypto' );
const config = require( './config' );

class Users extends Service {
  setup( app, path ) {
    this.app = app;
    this.path = path;

    // TODO register tokens service here
    // app.use(...);
    // this.tokens = app.service(...);
  }

  async findOne( params ) {
    params = params || {};
    params.query = params.query || {};
    params.query.$limit = 1;

    const result = await this.find( params );
    const data = result.data || result;

    return Array.isArray( data ) ? data[ 0 ] : data;
  }

  async setImageProfile( uid, { path, url }, params = {} ) {
    const user = await this.get( uid );

    const result = await imageFiles.load( {
      path,
      url,
      formats: this._getImageFormats( `user.profile.${user.uid}` )
    } );

    result.user = await this.patch( user.uid, {
      image: result.uploadedPaths[ 0 ].split( '/' ).pop()
    }, { ...params, action: 'setImageProfile', } );

    return result;
  }

  async clearImageProfile( uid, params = {} ) {
    const user = await this.get( uid );

    const extension = user.image.split( '.' ).pop();
    const paths = this._getImageFormats( `user.profile.${user.uid}`, extension ).map( v => v.name );

    await promisify( imageFiles.clear )( paths );

    await this.patch( user.uid, { image: null }, { ...params, action: 'clearImageProfile' } );

    return { success: true };
  }

  requestChangeEmail( uid, data, params = {} ) {
    return this.patch( uid, data, { ...params, action: 'requestChangeEmail' } );
  }

  confirmChangeEmail( uid, params = {} ) {
    return this.patch( uid, {}, { ...params, action: 'confirmChangeEmail' } );
  }

  changePassword( uid, data, params = {} ) {
    return this.patch( uid, data, { ...params, action: 'changePassword' } );
  }

  generateApiKey( uid, params = {} ) {
    return this.patch( uid, {}, { ...params, action: 'generateApiKey' } );
  }

  setNewFlag( uid, data, params = {} ) {
    return this.patch(
      uid,
      typeof data === 'boolean' ? { isNew: data } : data,
      { ...params, action: 'setNewFlag' }
    );
  }

  refresh( uid, data, params = {} ) {
    return this.patch( uid, data, { ...params, action: 'refresh' } );
  }

  async verifyPassword( data, params = {} ) {
    if ( !params.query ) {
      throw new errors.BadRequest( 'Query is needed for `verifyPassword`' );
    }

    const user = await this.findOne( { query: params.query, internal: true } );

    if ( !user ) {
      throw new errors.NotFound( 'User not found for `verifyPassword`' );
    }

    return crypto.verifyPassword(
      user.password,
      typeof data === 'string' ? data : data.password,
      user.salt
    );
  }

  async activate(uid, data, params = {}) {
    const tokensSvc = await this.app.service( `${this.path}/tokens` );
    let user;

    if ( uid ) {
      user = await this.get( uid );

      if ( !user ) {
        throw new errors.NotFound( 'User not found for `activate`' );
      }
    }

    const token = await tokensSvc.findOne( {
      query: {
        token: data.token,
        ...(user ? { userId: user.id } : {})
      }
    } );

    if ( !token ) {
      throw new errors.NotFound( 'Token not found for `activate`' );
    }

    if ( !user ) {
      user = await this.findOne( {
        query: { id: token.userId }
      } );

      if ( !user ) {
        throw new errors.NotFound( 'User not found for `activate`' );
      }
    }

    if ( !user.isActivated ) {
      user = await this.patch( user.uid, { isActivated: true }, { internal: true } );
    }

    await tokensSvc.remove( token.id );

    return user;
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
