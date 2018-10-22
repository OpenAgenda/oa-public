"use strict";

const fs = require( 'fs' );
const should = require( 'should' );

const merge = require( '../iso/merge' );

describe( 'unit - assigning schema properties to another schema', function() {

  it( 'ids of options of merged schemas are no longer unique', () => {

    const agendaSchema = {
      fields: [ {
        field: 'someagendafield',
        fieldType: 'radio',
        options: [ {
          id: 1,
          value: 'clubs',
          label: 'Clubs'
        }, {
          id: 2,
          value: 'comite',
          label: 'Comités'
        } ]
      } ]
    };

    const networkSchema = {
      fields: [ {
        field: 'somenetworkfield',
        fieldType: 'checkbox',
        options: [ {
          id: 1,
          value: 'dogs',
          label: 'Dogs'
        }, {
          id: 2,
          value: 'tics',
          label: 'Tics'
        } ]
      } ]
    };

    merge( networkSchema, agendaSchema ).fields.map( f => f.options )
      .should.eql( [ 
        [ 
          { id: 1, value: 'clubs', label: 'Clubs' },
          { id: 2, value: 'comite', label: 'Comités' } 
        ], [ 
          { id: 1, value: 'dogs', label: 'Dogs' },
          { id: 2, value: 'tics', label: 'Tics' }
        ] 
      ] );

  } );

  // ids will need to be prefixed by formschema id before they can make sense
  
  it( 'order of fields is dictated by outer-most schema', () => {

    const eventSchema = {
      fields: [ {
        field: 'title',
        fieldType: 'text',
        label: 'Le titre'
      }, {
        field: 'description',
        fieldType: 'text',
        label: 'La description'
      } ]
    };

    const networkSchema = {
      fields: [ {
        field: 'theme',
        fieldType: 'text',
        label: 'Thème'
      } ]
    }

    const agendaSchema = {
      fields: [ {
        field: 'title',
        fieldType: 'abstract',
        label: 'Nom de la manifestation'
      }, {
        field: 'participants',
        fieldType: 'integer',
        label: 'Participants'
      }, {
        field: 'description',
        fieldType: 'abstract'
      } ]
    }

    merge( eventSchema, networkSchema, agendaSchema ).fields
      .map( f => f.field ).should.eql( [
        'title', 'participants', 'description', 'theme'
      ] );

  } );


  it( 'merge extends schemas', () => {

    const s1 = {
      fields: [ {
        field: "participants",
        optional: false,
        fieldType: "integer",
        label: "Participants",
        info: "Combien de participants"
      } ]
    };

    const s2 = {
      fields: [ {
        field: 'organizer',
        optional: false,
        fieldType: 'text',
        label: 'Organizer'
      } ]
    };

    const s3 = {
      fields: [ {
        field: 'budget',
        optional: false,
        fieldType: 'text',
        label: 'Budget'
      } ]
    };

    merge( s1, s2, s3 ).should.eql( { 
      fields: [ { 
        field: 'budget',
        optional: false,
        fieldType: 'text',
        label: 'Budget' 
      }, { 
         field: 'organizer',
         optional: false,
         fieldType: 'text',
         label: 'Organizer' 
      }, { 
         field: 'participants',
         optional: false,
         fieldType: 'integer',
         label: 'Participants',
         info: 'Combien de participants' 
      } ] 
    } );

  } ); 

  it( 'merge can render optional field non-optional', () => {

    const schema = {
      fields: [ {
        "field" : "image",
        "fieldType" : "text",
        "label" : "Image",
        "optional" : true
      }, {
        "field" : "imageCredits",
        "fieldType" : "text",
        "optional" : true,
        "label" : "Image credits",
        "enableWith" : "image"
      } ]
    };

    const abstract = {
      fields: [ {
        "field" : "imageCredits",
        "fieldType" : "abstract",
        "optional" : false
      } ]
    };

    merge( schema, abstract ).fields.filter( f => f.field === 'imageCredits' )[ 0 ].optional.should.equal( false );

  } );

  it( 'merge can relabel fields', () => {

    const schema = {
      fields: [ {
        "field": "participants",
        "optional": true,
        "fieldType": "integer",
        "min": null,
        "max": null,
        "label": {
          "fr": "Participants",
          "en": "Participants"
        },
        "info": {
          "fr": "Combien de participants",
          "en": "How many participants"
        },
        "placeholder" : null,
        "sub" : null
      } ]
    }

    const abstract = {
      fields: [ {
        field: 'participants',
        fieldType: 'abstract',
        label: {
          fr: 'Les gens',
          en: 'People'
        },
        info: {
          fr: 'Combien de gens',
          en: 'How many people'
        }
      } ]
    };

    merge( schema, abstract ).should.eql( {
      fields: [ {
        "field": "participants",
        "optional": true,
        "fieldType": "integer",
        "min": null,
        "max": null,
        label: {
          fr: 'Les gens',
          en: 'People'
        },
        info: {
          fr: 'Combien de gens',
          en: 'How many people'
        },
        "placeholder" : null,
        "sub" : null
      } ]
    } );

  } );


  it( 'an abstract field is maintained as abstract as long as no field with the same name is added to the merge', () => {

    const schema = {
      fields: [ {
        "field": "title",
        "fieldType": "text",
        "label": "Titre"
      } ]
    }

    const abstract = {
      fields: [ {
        field: 'references',
        fieldType: 'abstract',
        label: 'Références'
      } ]
    };

    merge( schema, abstract ).should.eql( { 
      fields: [ { 
        field: 'references',
        fieldType: 'abstract',
        label: 'Références' 
      }, {
        field: 'title', 
        fieldType: 'text',
        label: 'Titre' 
      } ] 
    } );


  } );

} );
