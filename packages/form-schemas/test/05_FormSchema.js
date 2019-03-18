"use strict";

const should = require( 'should' );

const customValidator = require( './custom/wigglypoof.validator' );
const FormSchema = require( '../iso/FormSchema.js' );

describe( 'form-schemas -05- FormSchema', () => {

  describe( 'getting started', () => {

    it( 'instanciate a new FormSchema by giving it nothing', () => {

      let s = new FormSchema();

      s.isNew().should.equal( true );

    } );

    it( 'a new FormSchema is empty', () => {

      let s = new FormSchema();

      s.isEmpty().should.equal( true );

    } );

    it( 'you can add a field to a form schema instance', () => {

      let s = new FormSchema();

      s.getFieldCount().should.equal( 0 );

      s.addField( {
        field: 'atextfield',
        label: { fr: 'Un champ texte' },
        fieldType: 'text'
      } );

      s.getFieldCount().should.equal( 1 );

    } );

    it( 'but you can\'t add two fields with the same name', () => {

      let s = new FormSchema(), error = [];

      s.addField( {
        field: 'atextfield',
        label: { fr: 'Un champ texte' },
        fieldType: 'text'
      } );

      try {

        s.addField( {
          field: 'atextfield',
          label: { fr: 'Un champ texte' },
          fieldType: 'text'
        } );

      } catch( e ) {

        error = e;

      }

      error.should.equal( 'This field name is taken! : atextfield' );

    } );


    it( 'a FormSchema can be initialized with preset fields', () => {

      const s = new FormSchema( {
        fields: [ {
          field: 'atextfield',
          label: { fr: 'Un champ texte' },
          fieldType: 'text'
        }, {
          field: 'anotherfield',
          label: { fr: 'Un nombre' },
          fieldType: 'number',
          min: 2
        }, {
          field: 'andanotherfield',
          label: {
            fr: 'Un choix'
          },
          fieldType: 'radio',
          options: [ {
            value: 'option-1',
            label: { fr: 'Option 1' }
          }, {
            value: 'option-2',
            label: { fr: 'Option 2' }
          } ]
        } ],
        custom: null
      } );

      s.getFieldCount().should.equal( 3 );

    } );

    it( 'preset fields defining labels do not need to be given with language keys', () => {

      const s = new FormSchema( {
        fields: [ {
          field: 'asinglefield',
          label: 'Un champ texte',
          fieldType: 'text'
        } ],
        defaultLabelLanguage: 'fr'
      } )

      s.getFields()[ 0 ].label.should.eql( { fr: 'Un champ texte' } );

    } );

  } );

  describe( 'adding fields', () => {

    let s;

    beforeEach( () => {

      s = new FormSchema( {
        fields: [ {
          field: 'atextfield',
          label: { fr: 'Un champ texte' },
          fieldType: 'text'
        }, {
          field: 'anotherfield',
          label: { fr: 'Un nombre' },
          fieldType: 'number',
          min: 2
        }, {
          field: 'andanotherfield',
          label: { fr: 'Un choix' },
          fieldType: 'radio',
          options: [ {
            id: 1,
            value: 'option-1',
            label: { fr: 'Option 1' }
          }, {
            id: 2,
            value: 'option-2',
            label: { fr: 'Option 2' }
          } ]
        } ]
      } );

    } );

    it( 'adding a field puts it at the bottom of the schema', () => {

      s.addField( {
        field: 'anaddedfield',
        label: { fr: 'Un nouveau champ' }
      } );

      s.getField( 3 ).field.should.equal( 'anaddedfield' );

    } );

  } );

  describe( 'updating all fields', () => {

    let s;

    before( () => {

      s =new FormSchema( {
        nextOptionId: 1000,
        fields: [ {
          field: 'aradiofield',
          fieldType: 'radio',
          label:'Un choix unique',
          options: [ {
            id: 1,
            label: 'Un',
            value: 'un'
          }, {
            label: 'Deux',
            value: 'deux'
          } ]
        } ]
      } );

      s.updateFields( [ {
        field: 'aradiofield',
        fieldType: 'radio',
        label:'Un choix unique',
        options: [ {
          id: 1,
          label: 'Un',
          value: 'un'
        }, {
          label: 'Deux',
          value: 'deux'
        }, {
          label: 'Trois',
          value: 'trois'
        } ]
      }, {
        field: 'acheckboxfield',
        fieldType: 'checkbox',
        label: 'Un choix multiple',
        options: [ {
          label: 'A',
          value: 'a'
        }, {
          label: 'B',
          value: 'b'
        } ]
      } ] );

    } );

    it( 'adds new fields', () => {

      const s = new FormSchema( {
        fields: [ {
          field: 'atextfield',
          label: { fr: 'Un champ texte' },
          fieldType: 'text'
        } ]
      } );

      s.updateFields( [ {
        field: 'atextfield',
        label: 'Un texte',
        fieldType: 'text'
      }, {
        field: 'aninteger',
        label: 'Un entier',
        fieldType: 'integer'
      } ] );

      s.getData().fields.length.should.equal( 2 );

    } );

    it( 'removes absent fields', () => {

      const s = new FormSchema( {
        fields: [ {
          field: 'atextfield',
          label: { fr: 'Un champ texte' },
          fieldType: 'text'
        } ]
      } );

      s.updateFields( [ {
        field: 'aninteger',
        label: 'Un entier',
        fieldType: 'integer'
      } ] );

      s.getData().fields.length.should.equal( 1 );

      s.getData().fields[ 0 ].field.should.equal( 'aninteger' );

    } );

    it( 'options with missing id have been given one', () => {

      s.getField( 'aradiofield' ).options.map( o => o.id ).should.eql( [ 1, 1001, 1002 ] );

    } );

    it( 'options of newly added fields are given ids', () => {

      s.getField( 'acheckboxfield' ).options.map( o => o.id ).should.eql( [ 1003, 1004 ] );

    } );

    it( 'nextOptionId is incremented', () => {

      s.getData().nextOptionId.should.equal( 1005 );

    } );

    it( 'ordering respects given fields order', () => {

      const s = new FormSchema( {
        "fields": [
          {
            "field": "hello",
            "fieldType": "abstract"
          },
          {
            "field": "cat",
            "fieldType": "abstract"
          }
        ]
      } );

      s.updateFields( [
        {
          "field": "location",
          "fieldType": "abstract"
        },
        {
          "field": "hello",
          "fieldType": "abstract"
        },
        {
          "field": "cat",
          "fieldType": "abstract"
        },
        {
          "field": "image",
          "fieldType": "abstract"
        }
      ] );

      s.getData().fields.map( f => f.field ).should.eql( [ 'location', 'hello', 'cat', 'image' ] );

    } );

  } );

  describe( 'getting, moving and removing fields', () => {

    let s;

    beforeEach( () => {

      s = new FormSchema( {
        fields: [ {
          field: 'atextfield',
          label: { fr: 'Un champ texte' },
          fieldType: 'text'
        }, {
          field: 'anotherfield',
          label: { fr: 'Un nombre' },
          fieldType: 'number',
          min: 2
        }, {
          field: 'andanotherfield',
          label: { fr: 'Un choix' },
          fieldType: 'radio',
          options: [ {
            id: 1,
            value: 'option-1',
            label: { fr: 'Option 1' }
          }, {
            id: 2,
            value: 'option-2',
            label: { fr: 'Option 2' }
          } ]
        } ]
      } );

    } );


    it( 'Fields can be fetched by their position index in the schema', () => {

      s.getField( 1 ).field.should.equal( 'anotherfield' );

    } );

    it( 'Fields can be moved down in the schema', () => {

      s.moveField( 0, 2 );

      s.getField( 2 ).field.should.equal( 'atextfield' );

    } );

    it( 'Fields can also be moved up', () => {

      s.moveField( 2, -2 );

      s.getField( 0 ).field.should.equal( 'andanotherfield' );

    } );

    it( 'A field move does not affect schema field count', () => {

      s.moveField( 0, 2 );

      s.getFieldCount().should.equal( 3 );

    } );

    it( 'Moves cannot throw fields out of schema index bounds', () => {

      let error;

      try {

        s.moveField( 0, 102 );

      } catch( e ) {

        error = e;

      }

      error.should.equal( 'Move value exceeds possible value' );

    } );

    it( 'A field is removed using its index in the schema', () => {

      s.removeField( 0 );

      s.getFieldCount().should.equal( 2 );

    } );

    it( 'A field remove shifts the index of following fields', () => {

      s.removeField( 1 );

      s.getField( 1 ).field.should.equal( 'andanotherfield' );

    } );

  } );


  describe( 'deriving validator', () => {

    const fs = new FormSchema( {
      fields: [ {
        field: 'atextfield',
        label: { fr: 'Un champ texte' },
        fieldType: 'text'
      }, {
        field: 'anotherfield',
        label: { fr: 'Un nombre' },
        fieldType: 'number',
        min: 2
      }, {
        field: 'andanotherfield',
        label: { fr: 'Un choix' },
        fieldType: 'radio',
        optional: false,
        options: [ {
          id: 1,
          value: 'option-1',
          label: { fr: 'Option 1' }
        }, {
          id: 2,
          value: 'option-2',
          label: { fr: 'Option 2' }
        } ]
      } ]
    } );

    const validate = fs.getValidate();

    it( '.getValidate() returns the validator defined by the FormSchema fields', () => {

      validate.default.should.eql( {
        atextfield: null,
        anotherfield: null,
        andanotherfield: null
      } );

    } );

    // this fails when languages is a possibility
    it( '.getValidate() validates choice fields correctly', () => {

      validate( {
        andanotherfield: 1
      } )

      .should.eql( {
        atextfield: null,
        anotherfield: null,
        andanotherfield: 1
      } );

    } );

    it( '.getValidate by default returns a validator that processes the full schema', () => {

      try {

        validate();

      } catch( errors ) {

        // because andanotherfield is required
        errors.length.should.equal( 1 );

        return;

      }

      // should never reach here
      should().ok();

    } );

    it( '.getValidate with draft option validates fields independently of their optional state', () => {

      const draftValidate = fs.getValidate( { draft: true } );

      try {

        const clean = draftValidate();

        clean.should.eql( { atextfield: null, anotherfield: null, andanotherfield: null } );

      } catch ( e ) {

        // should never reach here
        should().ok();

      }

    } );

  } );


  describe( 'extending FormSchema with custom types', () => {

    const fs = new FormSchema( {
      custom: {
        wigglypoof: customValidator
      },
      fields: [ {
        field: 'atextfield',
        label: { fr: 'Un champ texte' },
        fieldType: 'text'
      }, {
        field: 'acustomfield',
        label: { fr: 'Saisir Wigglypoof' },
        fieldType: 'wigglypoof'
      } ]
    } );

    const validate = fs.getValidate();


    it( 'validate data with a schema that includes a custom field - throws an error', () => {

      try {

        validate( {
          atextfield: 'Un petit text',
          acustomfield: 'Not wigglypoof'
        } );

      } catch ( errors ) {

        errors.should.eql( [ {
          code: 'invalid',
          message: 'Not Wigglypoof',
          origin: 'Not wigglypoof',
          field: 'acustomfield'
        } ] );

      }

    } );

    it( 'validate data with a schema that includes a custom field - valid', () => {

      const clean = validate( {
        atextfield: 'un petit texte',
        acustomfield: 'Wigglypoof'
      } );

      clean.should.eql( {
        atextfield: 'un petit texte',
        acustomfield: 'Wigglypoof'
      } );

    } );


  } );

} );
