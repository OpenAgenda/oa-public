import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import FormSchemaBuilder from '@openagenda/form-schemas/client/build/FormSchemaBuilder';
import EnabledRanges from '@openagenda/event-form/build/components/configuration/EnabledRanges'; 

import reducers from '../reducers';

import Canvas from '../components/Canvas';
import ListHead from '../components/ListHead';

import Loading from '../components/Loading';

export class NetworkEdit extends Component {

  componentDidMount() {

    this.props.onMount();

  }

  render() {

    const { network, schema } = this.props.network;
    const { eventSchema, lang } = this.props.config;
    const { onUpdate } = this.props;

    return <Canvas {...this.props}>
      { network ? <div className="wsq padding-all-sm">
        <FormSchemaBuilder
          lang={lang}
          addEnabled={true}
          settingsEnabled={true}
          editableExtensions={true}
          schema={schema}
          extendedFrom={[{
            schema: eventSchema,
            info: {
              label: 'Evénement',
              info: 'Champ événement.'
            }
          }]}
          onUpdate={onUpdate}
          components={{
            enabledRanges: EnabledRanges
          }}
          customFieldConfigurationSchemas={({
            timings: {
              fields: [{
                field: 'label',
                fieldType: 'abstract'
              }, {
                field: 'sub',
                fieldType: 'abstract'
              },{
                field: 'enabledRanges',
                fieldType: 'enabledRanges',
                label: 'Configurateur des saisie de dates'
              }],
            }
          })}
        />
        <pre><code>{JSON.stringify(schema, null, 2)}</code></pre>
        <pre><code>{JSON.stringify(eventSchema, null, 2)}</code></pre>
      </div> : <Loading /> }
    </Canvas>

  }

}

export default connect(
  state => state,
  dispatch => ( {
    onMount: () => dispatch( reducers.network.load() ),
    onUpdate: updated => dispatch( reducers.network.updateSchema( updated ) )
  } )
)( NetworkEdit );
