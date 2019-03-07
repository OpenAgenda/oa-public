import should from 'should';
import { change, reducer as formReducer } from 'redux-form';
import { formPlugin as agendaFormPlugin } from '../src/client/redux/modules/agenda';

describe( 'reducers', () => {

  describe( 'agenda redux-form\'s plugin', () => {

    it( 'synchronize the slug with the title', () => {

      const reducer = formReducer.plugin( { agendaCreation: agendaFormPlugin } );

      should( reducer( undefined, change( 'agendaCreation', 'title', 'Foo & bar, why ?' ) ) )
        .eql( {
          agendaCreation: {
            values: {
              title: 'Foo & bar, why ?',
              slug: 'foo-and-bar-why'
            }
          }
        } );

    } );

    it( 'do not synchronize the slug if it has already been manually changed and that changes the title', () => {

      const reducer = formReducer.plugin( { agendaCreation: agendaFormPlugin } );
      const state = {
        agendaCreation: {
          slugModified: true,
          values: {
            slug: 'pasbouger'
          }
        }
      };

      should( reducer( state, change( 'agendaCreation', 'title', 'Foo & bar, why ?' ) ) )
        .eql( {
          agendaCreation: {
            slugModified: true,
            values: {
              title: 'Foo & bar, why ?',
              slug: 'pasbouger'
            }
          }
        } );

    } );

  } );

} );
