import { useState } from 'react';
import '@openagenda/bs-templates/compiled/main.css';

import FormSchemaComponent from '../client/src/index';
import SimpleRowDecorator from './decorators/SimpleRow';

export default {
  title: 'Fields/Phone',
  decorators: [SimpleRowDecorator],
};

export const Optional = () => {
  const [data, setData] = useState();

  return (
    <>
      <p>A single optional phone number</p>
      <div className="col col-sm-6 wsq">
        <FormSchemaComponent
          onChange={(d) => setData(d)}
          onSubmit={(d) => setData(d)}
          schema={{
            fields: [
              {
                field: 'tontel',
                fieldType: 'phone',
                label: 'Ton tel',
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
                field: 'tontel',
                fieldType: 'phone',
                label: 'Il faut.',
                optional: false,
                sub: "C'est pas comme voulvoul",
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
