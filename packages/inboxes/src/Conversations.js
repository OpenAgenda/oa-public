import _ from 'lodash';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import ajvKeywords from 'ajv-keywords';
import parseListArguments from '@openagenda/service-utils/parseListArguments';
import Conversation from './Conversation';
import mapper from './utils/mapper';
import validate from './utils/validate';
import conversationFieldsMap from './db/conversationFieldsMap';
import inboxUserFieldsMap from './db/inboxUserFieldsMap';
import inboxFieldsMap from './db/inboxFieldsMap';
import populateParticipants from './db/populateParticipants';
import populateLatestMessage from './db/populateLatestMessage';
import populateDetails from './db/populateDetails';
import { listSchema } from './validators/conversationSchemas';
import { knex, schemas, types } from './config';

const ajv = new Ajv( { allErrors: true, jsonPointers: true, errorDataPath: 'property' } );
ajvErrors( ajv );
ajvKeywords( ajv, [ 'instanceof' ] );

export default class Conversations {
  constructor( options ) {
    this.inbox = options.inbox;
    this.userUid = options.userUid; // define if it's in context of a user or not
  }

  create( data, options ) {
    return new Conversation( null, { inbox: this.inbox, userUid: this.userUid } )
      .create( data, options );
  }

  get( identifiers, options ) {
    return new Conversation( identifiers, { inbox: this.inbox, userUid: this.userUid } )
      .get( options );
  }

  update( identifiers, data, inboxUser, options ) {
    return new Conversation( identifiers, { inbox: this.inbox, userUid: this.userUid } )
      .update( data, inboxUser, options );
  }

  action( identifiers, code, inboxUser ) {
    return new Conversation( identifiers, { inbox: this.inbox, userUid: this.userUid } )
      .action( code, inboxUser );
  }

  async list( ...args ) {
    await this._loadInbox();

    const { query, offset, limit, options } = parseListArguments( ...args );

    const params = _.assign( {
      total: false
    }, options );

    validate( ajv, listSchema, query );

    const request = knex( schemas.conversation )
      .select()
      .column(
        mapper.listFields( conversationFieldsMap, 'select', 'db', options, true )
          .map( v => `${schemas.conversation}.${v}` )
      )
      .column( `${schemas.inbox}.id as inboxContextId` )
      .column(
        mapper.listFields( inboxUserFieldsMap, 'select', 'db', options, true, 'creatorInboxUser.' )
          .map( v => `creatorInboxUser.${v}` )
      )
      .column(
        mapper.listFields( inboxFieldsMap, 'select', 'db', options, true, 'creatorInbox.' )
          .map( v => `creatorInbox.${v}` )
      )
      .max( `${schemas.message}.id as latestMessageId` )
      .leftJoin(
        schemas.inboxConversation,
        `${schemas.inboxConversation}.conversation_id`,
        `${schemas.conversation}.id`
      )
      .leftJoin(
        schemas.inbox,
        `${schemas.inbox}.id`,
        `${schemas.inboxConversation}.inbox_id`
      )
      .leftJoin(
        schemas.message,
        `${schemas.message}.conversation_id`,
        `${schemas.conversation}.id`
      )
      .leftJoin(
        `${schemas.inboxUser} as creatorInboxUser`,
        `creatorInboxUser.id`,
        `${schemas.conversation}.creator_inbox_user_id`
      )
      .leftJoin(
        `${schemas.inbox} as creatorInbox`,
        `creatorInbox.id`,
        `creatorInboxUser.inbox_id`
      )
      .where(
        _.mapKeys(
          mapper.toDb( conversationFieldsMap, 'select', query, options ),
          ( v, key ) => `${schemas.conversation}.${key}`
        )
      )
      .groupBy( `${schemas.conversation}.id` )
      .orderByRaw( '(closedAt IS NOT NULL)' )
      .orderByRaw( `latestMessageId DESC` )
      .orderByRaw( `GREATEST( ${schemas.conversation}.created_at, ${schemas.conversation}.updated_at ) DESC` );

    if ( this.userUid ) { // viewed by user endpoint
      request
        .column(
          mapper.listFields( inboxUserFieldsMap, 'select', 'db', options, true, 'inboxUser.' )
            .map( v => `${schemas.inboxUser}.${v}` )
        )
        .leftJoin(
          schemas.inboxUser,
          join => join
            .on( `${schemas.inboxUser}.inbox_id`, `${schemas.inboxConversation}.inbox_id` )
            .onNull( `${schemas.inboxUser}.left_at` )
        )
        .where( `${schemas.inboxUser}.user_uid`, this.userUid );
    } else { // viewed by inbox endpoint
      request.where( `${schemas.inboxConversation}.inbox_id`, this.inbox.data.id );
    }

    if ( params.total ) {
      const countResult = await knex
        .count( 'cnt.id AS total' )
        .first()
        .from( request.clone().as( 'cnt' ) );
      const countOpenedResult = await knex
        .count( 'cnt.id AS total' )
        .whereNull( 'closedAt' )
        .first()
        .from( request.clone().as( 'cnt' ) );
      this.total = countResult.total || 0;
      this.totalOpened = countOpenedResult.total || 0;
      this.totalClosed = countResult.total - countOpenedResult.total;
    } else {
      this.total = null;
    }

    let result = await request
      .offset( offset )
      .limit( limit )
      .map( row =>
        _.reduce(
          { ...row, ...mapper.toObj( conversationFieldsMap, row, options ) },
          ( result, value, key ) => _.set( result, key, value ),
          {}
        )
      );

    result = await populateDetails( result, this.inbox );

    result = await populateLatestMessage( result, this.inbox );

    result = await populateParticipants( result );

    this.data = result;

    return this;
  }

  async _loadInbox() {
    if ( !this.inbox.data ) {
      await this.inbox.get();
    }

    if ( !this.inbox.data ) {
      throw new VError( 'Inbox %j not found', this.inbox.identifiers );
    }
  }

  toJSON() {
    if ( typeof this.total === "number" ) {
      return {
        total: this.total,
        totalOpened: this.totalOpened,
        totalClosed: this.totalClosed,
        data: this.data || null
      }
    }

    return this.data || null;
  }
}
