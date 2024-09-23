import { http, HttpResponse } from 'msw';
import DisplaySchemaData from '../client/src/Components/DisplaySchemaData';
import SimplePageDecorator from './decorators/SimplePage';

import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'Displaying schema data',
  decorators: [SimplePageDecorator],
  parameters: {
    msw: {
      handlers: [
        http.get('/basic', () =>
          HttpResponse({
            schema: {
              fields: [
                {
                  field: 'name',
                  fieldType: 'text',
                  label: { fr: 'Nom', en: 'Name' },
                },
              ],
            },
            data: {
              name: 'Gaius Helen Mohiam',
            },
          })),
      ],
    },
  },
};

export function BasicExample() {
  const schema = {
    fields: [
      {
        field: 'name',
        fieldType: 'text',
        label: { fr: 'Nom', en: 'Name' },
      },
      {
        field: 'email',
        fieldType: 'email',
        label: { fr: 'Dernière connexion', en: 'Last signin' },
      },
      {
        field: 'someLink',
        fieldType: 'link',
        label: 'Some link',
      },
    ],
  };

  return (
    <div className="margin-v-sm">
      <p>
        A schema an some data is passed to the component that dispatches the
        data through weach fields and displays it.
      </p>
      <DisplaySchemaData
        schema={schema}
        data={{
          name: 'Ptheven',
          email: 'tuna@the.dog',
          lastSignin: '2024-03-18T16:30:00+0200',
          someLink: 'https://openagenda.com/agendas',
        }}
      />
    </div>
  );
}

export function BasicExampleWithRes() {
  return (
    <div className="margin-v-sm">
      <p>
        Schema and data are loaded from a remote resource provided through props
      </p>
      <DisplaySchemaData res="/basic" />
    </div>
  );
}
