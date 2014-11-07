module.exports = function ( m ) {

  return controllers( m );

};

var controllers = function( model ) {

  var exposed = function() {

    return {
      contactRemove: contactRemove
    };

  },


  /**
   * remove a contact from an agenda contact list
   */
  
  contactRemove = function( agenda, contactListUid, email, cb, formCb ) {
    
    agenda.contactLists.get( { uid: contactListUid }, function ( err, contactList ) {

      if ( err ) return cb( err );

      contactList = agenda.contactLists.instance( contactList );

      contactList.contacts.get({ email: email }, function ( err, contact ) {

        if ( err ) return cb( err );

        if ( !contact && formCb ) return formCb( 'this email was not recognized', contactList );

        contactList.contacts.instance( contact ).remove( cb );

      });

    });

  };

  return exposed();

};