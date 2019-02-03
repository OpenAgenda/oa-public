"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );
const should = require( 'should' );

const merge = require( '../iso/merge' );

describe( 'unit - assigning schema properties to another schema', () => {

  describe( 'simple merge', () => {

    let merged;

    before( () => {

      const networkSchema = {
        id: 1,
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

      const agendaSchema = {
        id: 2,
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

      merged = merge( networkSchema, agendaSchema );

    } );

    it( 'ids of options of merged schemas are no longer unique', () => {

      merged.fields.map( f => f.options )
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

    it( 'in-field identifier of schema shows where field was defined', () => {

      merged.fields.map( f => _.pick( f, [ 'field', 'schemaId' ] ) )
        .should.eql( [ {
          field: 'someagendafield',
          schemaId: 2
        }, {
          field: 'somenetworkfield',
          schemaId: 1
        } ] );

    } );

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
      id: 1,
      fields: [ {
        field: "participants",
        optional: false,
        fieldType: "integer",
        label: "Participants",
        info: "Combien de participants"
      }, {
        field: 'keywords',
        fieldType: 'keywords',
        optional: true,
        max: 255,
        label: 'Mots clés'
      } ]
    };

    const s2 = {
      id: 2,
      fields: [ {
        field: 'organizer',
        optional: false,
        fieldType: 'text',
        label: 'Organizer'
      }, {
        field: 'keywords',
        fieldType: 'abstract',
        display: false
      } ]
    };

    const s3 = {
      id: 3,
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
        label: 'Budget',
        schemaId: 3
      }, {
        field: 'organizer',
        optional: false,
        fieldType: 'text',
        label: 'Organizer',
        schemaId: 2
      }, {
        field: 'keywords',
        fieldType: 'keywords',
        label: 'Mots clés',
        max: 255,
        optional: true,
        display: false,
        schemaId: 1
      }, {
        field: 'participants',
        optional: false,
        fieldType: 'integer',
        label: 'Participants',
        info: 'Combien de participants',
        schemaId: 1
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
      id: 1,
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
      id: 2,
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
        "sub" : null,
        schemaId: 1
      } ]
    } );

  } );


  it( 'an abstract field is maintained as abstract as long as no field with the same name is added to the merge', () => {

    const schema = {
      id: 1,
      fields: [ {
        "field": "title",
        "fieldType": "text",
        "label": "Titre"
      } ]
    }

    const abstract = {
      id: 2,
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
        label: 'Références',
        schemaId: null
      }, {
        field: 'title',
        fieldType: 'text',
        label: 'Titre',
        schemaId: 1
      } ]
    } );

  } );


  it( 'all values of an abstract field trickle down to merge', () => {

    const schema = {
      id: 1,
      fields: [ {
        field: 'references',
        label: 'Evénements liés',
        fieldType: 'references',
        suggest: false,
        related: [ 'title', 'description', 'location' ],
        res: '/references'
      } ]
    };

    const abstract = {
      id: 2,
      fields: [ {
        field : 'references',
        fieldType: 'abstract',
        suggest : true
      } ]
    };

    merge( schema, abstract ).should.eql( {
      fields: [ {
        field: 'references',
        label: 'Evénements liés',
        fieldType: 'references',
        suggest: true,
        related: [ 'title', 'description', 'location' ],
        res: '/references',
        schemaId: 1
      } ]
    } );

  } );


  it( 'null schemas are ignored', () => {

    const schema = {
      id: 1,
      fields: [ {
        "field": "title",
        "fieldType": "text",
        "label": "Titre"
      } ]
    }

    merge( null, schema ).should.eql( {
      fields: [ {
        "field": "title",
        "fieldType": "text",
        "label": "Titre",
        schemaId: 1
      } ]
    } );

    merge( schema, null ).should.eql( {
      fields: [ {
        "field": "title",
        "fieldType": "text",
        "label": "Titre",
        schemaId: 1
      } ]
    } );

  } );

  it( 'origin value is maintained when present', () => {

    const schema = {
      id: 1,
      fields: [ {
        field: 'chooseyouravatar',
        fieldType: 'radio',
        optional: true,
        origin: 'tags',
        options: [ {
          label: 'Retarded cat',
          id: 1
        }, {
          label: 'Phteven',
          id: 2
        } ]
      } ]
    };

    const otherSchema = {
      id: 1,
      fields: [ {
        "field": "title",
        "fieldType": "text",
        "label": "Titre",
        origin: 'custom'
      } ]
    }

    const merged = merge( schema, otherSchema );

    merged.fields.map( f => f.origin ).should.eql( [ 'custom', 'tags' ] );

  } );


  it( 'options can be limited to allowed set through a schema merge', () => {

    const schema = {
      id: 1,
      fields: [ {
        field: 'chooseyouravatar',
        fieldType: 'radio',
        optional: true,
        options: [ {
          label: 'Retarded cat',
          id: 1
        }, {
          label: 'Phteven',
          id: 2
        } ]
      } ]
    };

    const restrictiveSchema = {
      id: 2,
      fields: [ {
        field: 'chooseyouravatar',
        fieldType: 'abstract',
        allowedOptions: [ 2 ]
      } ]
    }

    merge( schema, restrictiveSchema ).fields.should.eql( [ {
      field: 'chooseyouravatar',
      fieldType: 'radio',
      optional: true,
      options: [ {
        label: 'Phteven',
        id: 2
      } ],
      schemaId: 1
    } ] );

  } );

} );
