import _ from 'lodash';
import uppy from 'uppy-server';
import axios from 'axios';
import mime from 'mime-types';
import Inboxes from './';
import Conversations from './Conversations';
import { aws, knex, schemas } from './config';

export let config;

export function init( c ) {
  config = c;
}

/* User enpoints */

export function user( namespace ) {
  return {
    conversations: {
      list( options ) {
        const { namespaces, ...params } = _.merge( {
          namespaces: {
            query: {
              typeIdentifier: 'query.typeIdentifier',
              type: 'query.type'
            }
          },
          limit: 20
        }, options );

        return wrap( async ( req, res ) => {
          const query = _.pickBy( {
            type: _.get( req, namespaces.query.type ),
            typeIdentifier: parseInt( _.get( req, namespaces.query.typeIdentifier ) )
          } );
          const limit = getLimit( config.mw.limit, params.limit );

          const conversations = await Inboxes
            .user( _.get( req, namespace ) )
            .conversations.list( query, (req.query.page > 0 ? req.query.page - 1 : 0) * limit, limit, /* options */ );

          res.send( { conversations } );
        } );
      }
    }
  };
}

/* Other enpoints */

export const inboxUser = {
  get( options ) {
    const { namespaces, fallbackGetter } = _.merge( {
      namespaces: {
        type: 'type',
        identifier: 'identifier',
        userUid: 'user.uid'
      },
      fallbackGetter: null
    }, options );

    return wrap( async ( req, res ) => {
      const inboxIdentifiers = {
        type: _.get( req, namespaces.type ),
        identifier: parseInt( _.get( req, namespaces.identifier ) ),
      };
      const userUid = parseInt( _.get( req, namespaces.userUid ) );

      let inbox = await Inboxes( inboxIdentifiers );
      let inboxUser = await inbox.users.get( { userUid } );

      if ( inboxUser && inboxUser.data ) {
        inboxUser = Object.assign(
          {},
          inboxUser.toJSON(),
          (await config.interfaces.getUsersDetails( [ inboxUser.data ] ))[ 0 ]
        );
      } else if ( fallbackGetter ) {
        inboxUser = await fallbackGetter( { req, inbox: inbox.data, userUid } );
      }

      inbox = Object.assign(
        {},
        inbox.toJSON(),
        (await config.interfaces.getInboxesDetails( [ inbox.data ] ))[ 0 ]
      );

      res.send( { inbox, inboxUser } );
    } );
  }
};

export const conversations = {
  create( options ) {
    const { namespaces } = _.merge( {
      namespaces: {
        type: 'type',
        identifier: 'identifier',
        destinationInbox: 'destinationInbox',
        conversationType: 'conversationType',
        conversationTypeIdentifier: 'conversationTypeIdentifier',
        params: 'conversationParams',
        message: 'body.message',
        creatorInboxUser: 'creatorInboxUser',
        options: 'options',
        userUid: 'user.uid'
      }
    }, options );

    return wrap( async ( req, res ) => {
      const data = {
        destinationInbox: _.get( req, namespaces.destinationInbox ),
        type: _.get( req, namespaces.conversationType ),
        params: _.get( req, namespaces.params ),
        creatorInboxUser: _.get( req, namespaces.creatorInboxUser ),
        message: _.get( req, namespaces.message )
      };

      const optionalData = _.pickBy( {
        typeIdentifier: _.get( req, namespaces.conversationTypeIdentifier )
      } );

      const conversations = await new Conversations( {
        userUid: parseInt( _.get( req, namespaces.userUid ) ),
        inbox: await Inboxes( {
          type: _.get( req, namespaces.type ),
          identifier: parseInt( _.get( req, namespaces.identifier ) ),
        } )
      } );

      const conversation = await conversations.create(
        {
          ...data,
          ...optionalData
        },
        _.get( req, namespaces.options )
      );

      res.send( { conversation } );
    } );
  },

  list( options ) {
    const { namespaces, ...params } = _.merge( {
      namespaces: {
        type: 'type',
        identifier: 'identifier',
        query: {
          typeIdentifier: 'query.typeIdentifier',
          type: 'query.type'
        }
      },
      limit: 20
    }, options );

    return wrap( async ( req, res ) => {
      const query = _.pickBy( {
        type: _.get( req, namespaces.query.type ),
        typeIdentifier: parseInt( _.get( req, namespaces.query.typeIdentifier ) )
      } );
      const limit = getLimit( config.mw.limit, params.limit );

      const conversations = await new Inboxes( {
        type: _.get( req, namespaces.type ),
        identifier: parseInt( _.get( req, namespaces.identifier ) ),
      } )
        .conversations.list( query, (req.query.page > 0 ? req.query.page - 1 : 0) * limit, limit, /* options */ );

      res.send( { conversations } );
    } );
  },

  action( options ) {
    const { namespaces } = _.merge( {
      namespaces: {
        type: 'type',
        identifier: 'identifier',
        conversationId: 'conversation.id',
        userUid: 'user.uid',
        code: 'code'
      }
    }, options );

    return wrap( async ( req, res ) => {
      const conversation = await new Conversations( {
        userUid: parseInt( _.get( req, namespaces.userUid ) ),
        inbox: new Inboxes( {
          type: _.get( req, namespaces.type ),
          identifier: parseInt( _.get( req, namespaces.identifier ) ),
        } )
      } ).get( parseInt( _.get( req, namespaces.conversationId ) ) );

      await conversation.action(
        _.get( req, namespaces.code ),
        { userUid: parseInt( _.get( req, namespaces.userUid ) ) }
      );

      res.send( { conversation } );
    } );
  },

  resume( options ) {
    const { namespaces } = _.merge( {
      namespaces: {
        type: 'type',
        identifier: 'identifier',
        conversationId: 'conversation.id',
        userUid: 'user.uid'
      }
    }, options );

    return wrap( async ( req, res ) => {
      const conversation = await new Conversations( {
        userUid: parseInt( _.get( req, namespaces.userUid ) ),
        inbox: new Inboxes( {
          type: _.get( req, namespaces.type ),
          identifier: parseInt( _.get( req, namespaces.identifier ) ),
        } )
      } ).get( parseInt( _.get( req, namespaces.conversationId ) ) );

      await conversation.update( { closedAt: null }, { userUid: _.get( req, namespaces.userUid ) } );

      res.send( { conversation } );
    } );
  }
};

export const messages = {
  list( options ) {
    const { namespaces, ...params } = _.merge( {
      namespaces: {
        type: 'type',
        identifier: 'identifier',
        conversationId: 'conversation.id',
        userUid: 'user.uid'
      },
      limit: 20
    }, options );

    const limit = getLimit( config.mw.limit, params.limit );

    return wrap( async ( req, res ) => {
      const conversation = await new Conversations( {
        userUid: parseInt( _.get( req, namespaces.userUid ) ),
        inbox: new Inboxes( {
          type: _.get( req, namespaces.type ),
          identifier: parseInt( _.get( req, namespaces.identifier ) ),
        } )
      } ).get( parseInt( _.get( req, namespaces.conversationId ) ) );

      const messages = await conversation.messages
        .list( (req.query.page > 0 ? req.query.page - 1 : 0) * limit, limit, /* options */ );

      res.send( { conversation, messages } );
    } );
  },

  create( options ) {
    const { namespaces } = _.merge( {
      namespaces: {
        type: 'type',
        identifier: 'identifier',
        conversationId: 'conversation.id',
        userUid: 'user.uid',
        body: 'body.body',
        options: 'options'
      }
    }, options );

    return wrap( async ( req, res ) => {
      const conversation = await new Conversations( {
        userUid: parseInt( _.get( req, namespaces.userUid ) ),
        inbox: new Inboxes( {
          type: _.get( req, namespaces.type ),
          identifier: parseInt( _.get( req, namespaces.identifier ) ),
        } )
      } ).get( parseInt( _.get( req, namespaces.conversationId ) ) );

      const message = await conversation.messages
        .create(
          {
            body: _.get( req, namespaces.body ),
            userUid: _.get( req, namespaces.userUid )
          },
          _.get( req, namespaces.options )
        );

      res.send( { message } );
    } );
  },

  prepareAttachment( options ) {
    const { namespaces, uppyOptions } = _.merge( {
      namespaces: {
        type: 'type',
        identifier: 'identifier',
        conversationId: 'conversation.id',
        messageId: 'message.id',
        userUid: 'user.uid'
      },
      uppyOptions: {
        providerOptions: {
          s3: {
            getKey: req => req.filename,
            key: config.aws.accessKeyId,
            secret: config.aws.secretAccessKey,
            bucket: config.aws.bucket,
            region: config.aws.region
          }
        },
        server: {
          host: config.domain,
          protocol: 'https'
        },
        sendSelfEndpoint: config.domain,
        secret: '***SECRET***',
        debug: false
      }
    }, options );

    return wrap( async ( req, res ) => {
      const messageId = parseInt( _.get( req, namespaces.messageId ) );

      const conversation = await new Conversations( {
        userUid: parseInt( _.get( req, namespaces.userUid ) ),
        inbox: new Inboxes( {
          type: _.get( req, namespaces.type ),
          identifier: parseInt( _.get( req, namespaces.identifier ) ),
        } )
      } ).get( parseInt( _.get( req, namespaces.conversationId ) ) );

      const message = await conversation.messages.get( messageId );

      if ( !message || !message.data ) {
        res.status( 400 );
        throw new VError( 'Message doesn\'t exist' );
      }

      const { filename: originalName } = req.query;
      const conversationFileKey = conversation.data.fileKey;
      const extension = originalName.split( '.' ).pop();

      const foreignFilename = `conv.${conversationFileKey}.msg.${messageId}${extension ? '.' + extension : ''}`;

      req.filename = foreignFilename;

      uppy.app( uppyOptions )( req, res );
    } );
  },

  addAttachment( options ) {
    const { namespaces } = _.merge( {
      namespaces: {
        type: 'type',
        identifier: 'identifier',
        conversationId: 'conversation.id',
        messageId: 'message.id',
        userUid: 'user.uid',
        filename: 'filename',
        originalName: 'originalName'
      }
    }, options );

    return wrap( async ( req, res ) => {
      const messageId = parseInt( _.get( req, namespaces.messageId ) );

      const conversation = await new Conversations( {
        userUid: parseInt( _.get( req, namespaces.userUid ) ),
        inbox: new Inboxes( {
          type: _.get( req, namespaces.type ),
          identifier: parseInt( _.get( req, namespaces.identifier ) ),
        } )
      } ).get( parseInt( _.get( req, namespaces.conversationId ) ) );

      const message = await conversation.messages.get( messageId );

      if ( !message || !message.data ) {
        res.status( 400 );
        throw new VError( 'Message doesn\'t exist' );
      }

      const originalName = _.get( req, namespaces.originalName );
      const filename = _.get( req, namespaces.filename );

      await conversation.messages.addAttachment( messageId, {
        originalName,
        filename
      } );

      res.send( { message: await message.get() } );
    } );
  },

  downloadAttachment( options ) {
    const { namespaces } = _.merge( {
      namespaces: {
        id: 'attachment.id',
        filename: 'attachment.filename'
      }
    }, options );

    return wrap( async ( req, res ) => {
      const filename = _.get( req, namespaces.filename, null );

      const attachment = await knex( schemas.messageAttachment )
        .select()
        .first()
        .where( {
          id: parseInt( _.get( req, namespaces.id, null ) ),
          filename
        } )
        .then( v => _.mapKeys( v, ( value, key ) => _.camelCase( key ) ) );

      if ( attachment ) {

        res.set( 'Content-Type', mime.contentType( filename ) || 'application/octet-stream' );

        res.set(
          'Content-Disposition',
          /\.(jpeg|jpg|gif|png|svg|bmp)$/.test( filename )
            ? 'inline'
            : `attachment; filename=${attachment.originalName}`
        );

      }

      const { data } = await axios( {
        method: 'get',
        url: `https://s3.${aws.region}.amazonaws.com/${aws.bucket}/${filename}`,
        responseType: 'stream'
      } );

      data.pipe( res );
    } );
  }
};

/* Utils */

function wrap( fn ) {
  return ( req, res, next ) => fn( req, res, next ).catch( next );
}

function getLimit( max, limit ) {
  limit = parseInt( limit );

  if ( !limit ) {
    return max;
  }

  return limit > max ? max : limit;
}
