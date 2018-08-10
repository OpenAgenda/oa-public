'use strict';

const getDecorate = require( '../iso/getDecorate.js' );

const should = require( 'should' );

describe( 'extended events - functional (iso): getDecorate', () => {

  it( 'returns a decorated object', () => {

    const decorate = getDecorate( [ {
      field: 'atextfield',
      label: { fr: 'Un champ texte' },
      fieldType: 'text',
    }, {
      field: 'anotherfield',
      label: { fr: 'Un nombre' },
      fieldType: 'number',
      min: 2,
    }, {
      field: 'andanotherfield',
      label: {
        fr: 'Un choix',
      },
      fieldType: 'radio',
      options: [ {
        id: 123,
        value: 'option-1',
        label: { fr: 'Option 1' },
      }, {
        id: 456,
        value: 'option-2',
        label: { fr: 'Option 2' },
      } ],
    }, {
      field: 'multiplechoicefield',
      label: { fr: 'Ok' },
      fieldType: 'checkbox',
      options: [ {
        id: 789,
        value: 'checkbox-1',
        label: { fr: 'Checkbox 1' },
        legacyId: 29190,
      }, {
        id: 101112,
        value: 'checkbox-2',
        label: { fr: 'Checkbox 2' },
      }, {
        id: 101222,
        value: 'checkbox-3',
        label: { fr: 'Checkbox 3' },
      } ],
    } ] );


    const decorated = decorate( {
      anotherfield: 12,
      andanotherfield: 123,
      multiplechoicefield: [ 789, 101222 ],
    } );

    decorated.should.eql( {
      anotherfield: 12,
      andanotherfield: {
        id: 123,
        value: 'option-1',
        label: {
          fr: 'Option 1'
        }
      },
      multiplechoicefield: [
        {
          id: 789,
          value: 'checkbox-1',
          label: {
            fr: 'Checkbox 1'
          }
        },
        {
          id: 101222,
          value: 'checkbox-3',
          label: {
            fr: 'Checkbox 3'
          }
        }
      ]
    } );

  } );

} );
