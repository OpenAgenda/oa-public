import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import FormSchemaBuilder from '@openagenda/form-schemas/client/build/FormSchemaBuilder';

import reducers from '../reducers';

class NetworkEdit extends Component {

  componentDidMount() {

    this.props.onMount();

  }

  render() {

    const { network, schema } = this.props.network;
    const { eventSchema, lang } = this.props.config;
    const { onUpdate } = this.props;

    if ( !network ) return <p>ça charge</p>

    return <div className="wsq padding-all-sm">
      <h1>{network.title}</h1>
      <FormSchemaBuilder
        lang={lang}
        addEnabled={true}
        settingsEnabled={true}
        editableExtensions={true}
        schema={schema}
        extendedFrom={[ {
          schema: eventSchema,
          info: {
            label: 'Evénement',
            info: 'Champ événement.'
          }
        } ]}
        onUpdate={onUpdate}
      />
      <pre><code>{JSON.stringify( schema, null, 2 )}</code></pre>
      <pre><code>{JSON.stringify( eventSchema, null, 2 )}</code></pre>
    </div>

  }

}

export default connect(
  state => state,
  dispatch => ( {
    onMount: () => dispatch( reducers.network.load() ),
    onUpdate: updated => dispatch( reducers.network.updateSchema( updated ) )
  } )
)( NetworkEdit );
