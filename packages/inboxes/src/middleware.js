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
      list( options ) {
        const { limit } = _.merge( {
          limit: 20
        }, options );

        return wrap( async ( req, res ) => {
          const conversations = await Inboxes
            .user( _.get( req, namespace ) )
            .conversations.list( (req.query.page > 0 ? req.query.page - 1 : 0) * limit, limit, /* options */ );

          res.send( { conversations } );
        } );
      }
    }
  };
}

/******************/
/* Other enpoints */
/******************/

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
        params: 'conversationParams',
        message: 'body.message',
        creatorInboxUser: 'creatorInboxUser'
      }
    }, options );

    return wrap( async ( req, res ) => {
      const conversation = await Inboxes( {
        type: _.get( req, namespaces.type ),
        identifier: parseInt( _.get( req, namespaces.identifier ) ),
      } ).conversations.create( {
        destinationInbox: {
          type: _.get( req, namespaces.destinationInbox.type ),
          identifier: parseInt( _.get( req, namespaces.destinationInbox.identifier ) )
        },
        type: _.get( req, namespaces.conversationType ),
        params: _.get( req, namespaces.params ),
        creatorInboxUser: _.get( req, namespaces.creatorInboxUser ),
        message: _.get( req, namespaces.message )
      } );

      res.send( { conversation } );
    } );
  },

  list( options ) {
    const { namespaces, limit } = _.merge( {
      namespaces: {
        type: 'type',
        identifier: 'identifier'
      },
      limit: 20
    }, options );

    return wrap( async ( req, res ) => {
      const conversations = await new Inboxes( {
        type: _.get( req, namespaces.type ),
        identifier: parseInt( _.get( req, namespaces.identifier ) ),
      } )
        .conversations.list( (req.query.page > 0 ? req.query.page - 1 : 0) * limit, limit, /* options */ );

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
    const { namespaces, limit } = _.merge( {
      namespaces: {
        type: 'type',
        identifier: 'identifier',
        conversationId: 'conversation.id'
      },
      limit: 20
    }, options );

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
