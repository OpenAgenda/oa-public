import should from 'should';
import restrictLabelLanguages from '../client/src/FormSchemaBuilder/lib/restrictLabelLanguages';

describe( '16 - unit - restrictLabelLanguages', () => {

  it( 'restricts labels of field to given set of languages', () => {

    restrictLabelLanguages( {
      label: {
        fr: 'Titre',
        en: 'Title'
      },
      info: {
        fr: 'Info sur le titre',
        en: 'Info about the title'
      },
      fieldType: 'text'
    }, [ 'fr', 'es' ] ).should.eql( {
      label: {
        fr: 'Titre',
        es: 'Titre'
      },
      info: {
        fr: 'Info sur le titre',
        es: 'Info sur le titre'
      },
      fieldType: 'text'
    } );

  } );

  it( 'turns multilingual to monolingual', () => {

    restrictLabelLanguages( {
      label: {
        fr: 'Titre',
        en: 'Title'
      },
      info: {
        fr: 'Info sur le titre',
        en: 'Info about the title'
      },
      fieldType: 'text'
    } ).should.eql( {
      label: 'Titre',
      info: 'Info sur le titre',
      fieldType: 'text'
    } );

  } );

  it( 'turns monolingual to multilingual', () => {

    restrictLabelLanguages( {
      label: 'Titre',
      info: 'Info sur le titre',
      fieldType: 'text'
    }, [ 'fr', 'es' ] ).should.eql( {
      label: {
        fr: 'Titre',
        es: 'Titre'
      },
      info: {
        fr: 'Info sur le titre',
        es: 'Info sur le titre'
      },
      fieldType: 'text'
    } );

  } );

  it( 'apply restrict languages to schema', () => {

    restrictLabelLanguages.applyToSchema( {
      fields: [ {
        label: 'Titre',
        field: 'title',
        fieldType: 'text'
      }, {
        label: 'Description',
        field: 'description',
        fieldType: 'text'
      } ]
    }, [ 'fr' ] ).should.eql( {
      fields: [ {
        label: {
          fr: 'Titre'
        },
        field: 'title',
        fieldType: 'text'
      }, {
        label: {
          fr: 'Description'
        },
        field: 'description',
        fieldType: 'text'
      } ]
    } );

  } );

} );
