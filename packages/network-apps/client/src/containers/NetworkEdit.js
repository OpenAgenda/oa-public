import { Component } from 'react';
import { connect } from 'react-redux';

import FormSchemaBuilder from '@openagenda/form-schemas/client/build/FormSchemaBuilder/index.mjs';
import EnabledRanges from '@openagenda/event-form/components/configuration/EnabledRanges';

import * as reducers from '../reducers/index.js';

import Canvas from '../components/Canvas.js';

import Loading from '../components/Loading.js';

export class NetworkEditComponent extends Component {
  componentDidMount() {
    const { onMount } = this.props;

    onMount();
  }

  render() {
    const {
      network: { network, schema },
      config: { eventSchema, lang, base },
      onUpdate,
    } = this.props;

    if (!network) {
      return (
        <Canvas {...this.props}>
          <Loading />
        </Canvas>
      );
    }

    return (
      <Canvas
        {...this.props}
        secondaryNavLinks={[
          {
            path: `${base}/${network.uid}/agendas`,
            label: 'Voir les agendas',
          },
        ]}
      >
        <div className="wsq padding-all-sm">
          <FormSchemaBuilder
            lang={lang}
            addEnabled
            settingsEnabled
            editableExtensions
            schema={schema}
            extendedFrom={[
              {
                schema: eventSchema,
                info: {
                  label: 'Evénement',
                  info: 'Champ événement.',
                },
              },
            ]}
            onUpdate={onUpdate}
            components={{
              enabledRanges: EnabledRanges,
            }}
            customFieldConfigurationSchemas={{
              timings: {
                fields: [
                  {
                    field: 'label',
                    fieldType: 'abstract',
                  },
                  {
                    field: 'sub',
                    fieldType: 'abstract',
                  },
                  {
                    field: 'enabledRanges',
                    fieldType: 'enabledRanges',
                    label: 'Configurateur des saisie de dates',
                  },
                ],
              },
            }}
          />
          <pre>
            <code>{JSON.stringify(schema, null, 2)}</code>
          </pre>
          <pre>
            <code>{JSON.stringify(eventSchema, null, 2)}</code>
          </pre>
        </div>
      </Canvas>
    );
  }
}

const NetworkEdit = connect(
  (state) => state,
  (dispatch) => ({
    onMount: () => dispatch(reducers.network.load()),
    onUpdate: (updated) => dispatch(reducers.network.updateSchema(updated)),
  }),
)(NetworkEditComponent);

export default NetworkEdit;
