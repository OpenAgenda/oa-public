import { useState } from 'react';
import FormSchemaComponent from '../client/src/index.js';
import SimpleRowDecorator from './decorators/SimpleRow.js';

import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'Fields/Boolean',
  decorators: [SimpleRowDecorator],
};

export const Optional = () => {
  const [data, setData] = useState();

  return (
    <>
      <p>A single optional checkbox</p>
      <div className="col col-sm-6 wsq">
        <FormSchemaComponent
          onChange={(d) => setData(d)}
          onSubmit={(d) => setData(d)}
          schema={{
            fields: [
              {
                field: 'maybeyesmaybeno',
                fieldType: 'boolean',
                label: 'Tu peux cocher',
                info: 'Ou pas',
                sub: "C'est comme voulvoul",
              },
            ],
          }}
        />
      </div>
      <div className="col col-sm-6">
        <pre style={{ minHeight: 400 }}>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </>
  );
};

export const Required = () => {
  const [data, setData] = useState();

  return (
    <>
      <p>A single optional checkbox</p>
      <div className="col col-sm-6 wsq">
        <FormSchemaComponent
          onChange={(d) => setData(d)}
          onSubmit={(d) => setData(d)}
          schema={{
            fields: [
              {
                field: 'surelyyes',
                fieldType: 'boolean',
                label: 'Tu dois cocher',
                optional: false,
                sub: "C'est pas comme voulvoul",
                allowFalse: false,
              },
            ],
          }}
        />
      </div>
      <div className="col col-sm-6">
        <pre style={{ minHeight: 400 }}>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </>
  );
};

export function WithLinkedNonOptionalFields() {
  const [data, setData] = useState();

  return (
    <>
      <p>Check to fill</p>
      <div className="col col-sm-6 wsq">
        <FormSchemaComponent
          onChange={(d) => setData(d)}
          onSubmit={(d) => setData(d)}
          lang="fr"
          schema={{
            fields: [
              {
                field: 'checktoenable',
                fieldType: 'boolean',
                label: 'Cocher pour activer',
              },
              {
                field: 'yourName',
                fieldType: 'text',
                label: 'Ton nom',
                optional: false,
                enableWith: 'checktoenable',
              },
            ],
          }}
        />
      </div>
      <div className="col col-sm-6">
        <pre style={{ minHeight: 400 }}>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </>
  );
}

export function Other() {
  const [data, setData] = useState();

  const props = {
    res: {
      post: '',
      redirect: '/',
    },
    lang: 'fr',
    onChange: (d) => setData(d),
    onSubmit: (d) => setData(d),
    schema: {
      fields: [
        {
          field: 'wellok',
          fieldType: 'boolean',
          label: 'Well ok',
          optional: false,
        },
        {
          field: 'thisfieldisoptionalwithalonglabelandnodefault',
          fieldType: 'boolean',
          label: [
            'This field is optional. It has a very long label.',
            'When it left not checked, it counts as a false.',
            'Meaning it will be set at false when the user loads the form and never interacts with the control',
          ].join(' '),
          info: 'An info text displayed under the label',
          help: 'Click here for more info',
          helpLink: 'https://openagenda.com',
        },
        {
          field: 'checkedbydefault',
          fieldType: 'boolean',
          label: 'This should be checked by default',
          default: true,
        },
      ],
    },
  };

  return (
    <>
      <p>A single required choice field</p>
      <div className="col col-sm-6 wsq">
        <FormSchemaComponent {...props} />
      </div>
      <div className="col col-sm-6">
        <pre style={{ minHeight: 400 }}>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </>
  );
}
