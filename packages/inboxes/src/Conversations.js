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
import populateParticipants from './db/populateParticipants';
import populateLatestMessage from './db/populateLatestMessage';
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

  update( identifiers, data, options ) {
    return new Conversation( identifiers, { inbox: this.inbox, userUid: this.userUid } )
      .update( data, options );
  }

  action( identifiers, code, inboxUser ) {
    return new Conversation( identifiers, { inbox: this.inbox, userUid: this.userUid } )
      .action( code, inboxUser );
  }

  async list( ...args ) {
    await this._loadInbox();

    const { query, offset, limit, options } = parseListArguments( ...args );

    validate( ajv, listSchema, query );

    const request = knex( schemas.conversation )
      .select()
      .column(
        mapper.listFields( conversationFieldsMap, 'select', 'db', options, true )
          .map( v => `${schemas.conversation}.${v}` )
      )
      .column( `${schemas.inbox}.id as inboxContextId` )
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
      .where(
        _.mapKeys(
          mapper.toDb( conversationFieldsMap, 'select', query, options ),
          ( v, key ) => `${schemas.conversation}.${key}`
        )
      )
      .groupBy( `${schemas.conversation}.id` )
      .orderByRaw( '(resolvedAt IS NOT NULL)' )
      .orderByRaw( `latestMessageId DESC` )
      .orderByRaw( `GREATEST( ${schemas.conversation}.created_at, ${schemas.conversation}.updated_at ) DESC` )
      .offset( offset )
      .limit( limit );

    let rows;

    if ( this.userUid ) { // viewed by user endpoint
      rows = await request
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
      rows = await request
        .where( `${schemas.inboxConversation}.inbox_id`, this.inbox.data.id );
    }

    let result = rows.map( row =>
      _.reduce(
        { ...row, ...mapper.toObj( conversationFieldsMap, row, options ) },
        ( result, value, key ) => _.set( result, key, value ),
        {}
      )
    );

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
    return this.data || null;
  }
}
