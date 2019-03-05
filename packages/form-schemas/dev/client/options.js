import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { render } from 'react-dom';

import FormSchemaComponent from '../../client/src/index';
import Options from '../../client/src/Components/Options';
import optionsValidator from '../../client/src/lib/optionsValidator';

if ( module.hot ) module.hot.accept();

const cases = {
  empty: {
    components: {
      options: Options
    },
    lang: 'fr',
    values: {
      optionsfield: []
    },
    schema: {
      custom: {
        options: optionsValidator
      },
      fields: [ {
        field: 'optionsfield',
        fieldType: 'options',
        label: 'Option values',
        languages: [ 'fr', 'en' ],
        optional: false
      } ]
    }
  },
  withOptions: {
    components: {
      options: Options
    },
    lang: 'fr',
    values: {
      optionsfield: [ {
        id: 1,
        value: 'un',
        label: {
          fr: 'Un',
          en: 'One'
        }
      }, {
        id: 2,
        value: 'deux',
        label: {
          fr: 'Deux',
          en: 'Two'
        }
      }, {
        id: 3,
        value: 'trois',
        label: {
          fr: 'Trois',
          en: 'Three'
        }
      } ]
    },
    schema: {
      custom: {
        options: optionsValidator
      },
      fields: [ {
        field: 'optionsfield',
        fieldType: 'options',
        label: 'Option values',
        languages: [ 'fr', 'en' ],
        optional: false
      } ]
    }
  },
  withEditedOption: {
    components: {
      options: Options
    },
    lang: 'fr',
    values: {
      optionsfield: [ {
        id: 1,
        value: 'un',
        label: {
          fr: 'Un',
          en: 'One'
        }
      }, {
        id: 2,
        value: 'deux',
        label: {
          fr: 'Deux',
          en: 'Two'
        }
      }, {
        id: 3,
        value: 'trois',
        label: {
          fr: 'Trois',
          en: 'Three'
        }
      } ]
    },
    schema: {
      custom: {
        options: optionsValidator
      },
      fields: [ {
        field: 'optionsfield',
        fieldType: 'options',
        label: 'Option values',
        languages: [ 'fr', 'en' ],
        optional: false,
        devInitState: {
          mode: 1,
          editedIndex: 1
        }
      } ]
    }
  }
}

class Main extends Component {

  render() {

    return <div className="container top-margined">
      {_.chunk( _.keys( cases ), 3 ).map( ( keys, i ) => <div className="row margin-v-md margin-h-sm" key={'chunk-'+i}>
       { keys.map( ( key, i ) => <div className="col-sm-4" key={'chunk-item-'+i}>
          <div className="padding-all-sm margin-all-sm wsq">
            <FormSchemaComponent { ...cases[ key ] } actionComponents={[{ position: 'bottom', Component: () => null }]} />
          </div>
        </div> ) }
      </div> ) }
    </div>

  }

}

render( <Main />, document.getElementById( 'app' ) );
