import InboxUser from './InboxUser';

export default class InboxUsers {
  constructor( options ) {
    this.inbox = options.inbox;
  }

  add( data, options ) {
    return new InboxUser( null, { inbox: this.inbox } ).create( data, options );
  }

  get( identifiers, options ) {
    return new InboxUser( identifiers, { inbox: this.inbox } ).get( options );
  }

  remove( identifiers ) {
    return new InboxUser( identifiers, { inbox: this.inbox } ).remove();
  }
}
