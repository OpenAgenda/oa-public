import _ from 'lodash';
import Inboxes from './';

export let config;

export function init( c ) {
  config = c;
}

/******************/
/* User enpoints  */

/******************/

export function user( namespace ) {
  return {
    conversations: {
      // list( options ) {
      //   const params = _.merge( {
      //     limit: 20
      //   }, options );
      //
      //   const limit = getLimit( config.mw.limit, params.limit );
      //
      //   return wrap( async ( req, res ) => {
      //     const conversations = await Inboxes
      //       .user( _.get( req, namespace ) )
      //       .conversations.list( (req.query.page > 0 ? req.query.page - 1 : 0) * limit, limit, /* options */ );
      //
      //     res.send( { conversations } );
      //   } );
      // },

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

/******************/
/* Other enpoints */
/******************/

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
        destinationInbox: {
          type: 'destinationInbox.type',
          identifier: 'destinationInbox.identifier'
        },
        conversationType: 'conversationType',
        conversationTypeIdentifier: 'conversationTypeIdentifier',
        params: 'conversationParams',
        message: 'body.message',
        creatorInboxUser: 'creatorInboxUser',
        options: 'options'
      }
    }, options );

    return wrap( async ( req, res ) => {
      const data = {
        destinationInbox: {
          type: _.get( req, namespaces.destinationInbox.type ),
          identifier: parseInt( _.get( req, namespaces.destinationInbox.identifier ) )
        },
        type: _.get( req, namespaces.conversationType ),
        params: _.get( req, namespaces.params ),
        creatorInboxUser: _.get( req, namespaces.creatorInboxUser ),
        message: _.get( req, namespaces.message )
      };

      const optionalData = _.pickBy( {
        typeIdentifier: _.get( req, namespaces.conversationTypeIdentifier )
      } );

      const conversation = await Inboxes( {
        type: _.get( req, namespaces.type ),
        identifier: parseInt( _.get( req, namespaces.identifier ) ),
      } ).conversations.create(
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
      const conversation = await new Inboxes( {
        type: _.get( req, namespaces.type ),
        identifier: parseInt( _.get( req, namespaces.identifier ) ),
      } )
        .conversations.get( parseInt( _.get( req, namespaces.conversationId ) ) );

      await conversation.action( _.get( req, namespaces.code ), { userUid: _.get( req, namespaces.userUid ) } );

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
        conversationId: 'conversation.id'
      },
      limit: 20
    }, options );

    const limit = getLimit( config.mw.limit, params.limit );

    return wrap( async ( req, res ) => {
      const conversation = await new Inboxes( {
        type: _.get( req, namespaces.type ),
        identifier: parseInt( _.get( req, namespaces.identifier ) ),
      } )
        .conversations.get( parseInt( _.get( req, namespaces.conversationId ) ) );

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
        body: 'body.body'
      }
    }, options );

    return wrap( async ( req, res ) => {
      const conversation = await new Inboxes( {
        type: _.get( req, namespaces.type ),
        identifier: parseInt( _.get( req, namespaces.identifier ) ),
      } )
        .conversations.get( parseInt( _.get( req, namespaces.conversationId ) ) );

      const message = await conversation.messages
        .create( {
          body: _.get( req, namespaces.body ),
          userUid: _.get( req, namespaces.userUid )
        } );

      res.send( { message } );
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
