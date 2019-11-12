import should from 'should';
import flattenLabels from '../client/src/lib/flatten';
import unflattenLabels from '../client/src/FormSchemaBuilder/lib/unflattenLabels';

describe('17 - unit - flatten labels', () => {

  it('flattens field labels', () => {

    const flattened = flattenLabels( {
      label: {
        fr: 'Un champ',
        en: 'A field'
      },
      info: {
        fr: 'Un peu plus sur le champ',
        en: 'A bit more about the field'
      }
    }, 'fr' );

    flattened.should.eql( {
      label: 'Un champ',
      info: 'Un peu plus sur le champ'
    } );

  } );

  it( 'flattens option values of field', () => {

    const flattened = flattenLabels( {
      label: {
        fr: 'Un autre champ',
        en: 'Another field'
      },
      options: [ {
        label: {
          fr: 'Un'
        }
      }, {
        label: {
          fr: 'Deux'
        }
      } ]
    } );

    flattened.should.eql( {
      label: 'Un autre champ',
      options: [ {
        label: 'Un'
      }, {
        label: 'Deux'
      } ]
    } );

  } );

  it( 'does not flatten option values if already flat', () => {

    const flattened = flattenLabels( {
      options: [ {
        label: 'Un'
      }, {
        label: 'Deux'
      } ]
    } );

    flattened.should.eql( {
      options: [ {
        label: 'Un'
      }, {
        label: 'Deux'
      } ]
    } );

  } );

});
