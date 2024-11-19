import { http, HttpResponse } from 'msw';
import ih from 'immutability-helper';
import FormSchemaComponent from '../client/src/index.js';
import serverErrors from '../dev/schemas/servererrors.js';
import SimplePageDecorator from './decorators/SimplePage.js';

import '@openagenda/bs-templates/compiled/main.css';

const { schema } = serverErrors;

export default {
  title: 'Displaying errors',
  decorators: [SimplePageDecorator],
  parameters: {
    msw: {
      handlers: [
        http.post(
          '/image-data',
          () =>
            new HttpResponse(
              JSON.stringify({
                success: false,
                errors: [
                  {
                    field: 'image',
                    fieldLabel: 'Image',
                    label: "Le format de l'image n'est pas géré",
                    code: 'format.unknown',
                    message: 'provided format is unknown',
                  },
                ],
                event: null,
              }),
              {
                status: 400,
                headers: {
                  'Content-Type': 'application/json',
                },
              },
            ),
        ),
      ],
    },
  },
};

export function ErrorsNotDisplayedOnMount() {
  const props = {
    res: {
      post: '',
      redirect: '/',
    },
    lang: 'fr',
    values: {
      conditions: '',
    },
    withErrors: false, // default value
    schema: {
      fields: [
        {
          field: 'conditions',
          fieldType: 'text',
          required: true,
          min: 12,
          label: 'Ce schema a la props withErrors a false',
          sub: 'Tel format est accepté',
        },
      ],
    },
  };
  return (
    <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <FormSchemaComponent {...props} />
      </div>
    </div>
  );
}

export function ErrorsDisplayedOnMount() {
  const props = {
    res: {
      post: '',
      redirect: '/',
    },
    lang: 'fr',
    values: {
      conditions: '',
    },
    withErrors: true,
    schema: {
      fields: [
        {
          field: 'conditions',
          fieldType: 'text',
          optional: false,
          min: 12,
          label: 'Ce schema a la props withErrors à true',
          sub: 'la la la',
        },
      ],
    },
  };

  const exteriorGroupedErrorsProps = ih(props, {
    classNames: {
      $set: {
        fieldsCanvas: 'wsq padding-all-sm',
        bottomActionsCanvas: 'wsq padding-all-sm padding-top-md',
      },
    },
    errorComponents: {
      $set: [
        {
          position: 'bottom',
          Component: ({ errors }) => (
            <div className="error-summary padding-v-sm padding-h-sm">
              <div className="padding-bottom-sm">
                Oh no&apos;s! Cannot submit!:
              </div>
              <ul className="list-unstyled">
                {errors.map((e) => (
                  <li key={`error-${e.code}`}>
                    <strong>{e.fieldLabel}</strong>:&nbsp;
                    <span>{e.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          ),
        },
      ],
    },
  });

  return (
    <div className="container top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row">
        <p>Default presentation</p>
        <div className="wsq padding-all-sm">
          <FormSchemaComponent {...props} />
        </div>
      </div>
      <div className="text-center">
        _____________________________________________
      </div>
      <div className="margin-top-lg row">
        <p>
          Here the component is custom-styled and the grouped errors component
          is defined outside of the FormSchemaComponent
        </p>
        <FormSchemaComponent {...exteriorGroupedErrorsProps} />
      </div>
    </div>
  );
}

export function ServerError() {
  const props = {
    lang: 'fr',
    schema,
  };
  return (
    <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <FormSchemaComponent {...props} />
      </div>
    </div>
  );
}

export function ErrorOnImageSubmission() {
  return (
    <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <FormSchemaComponent
          lang="fr"
          res={{ post: '/image-data' }}
          method="post"
          schema={{
            fields: [
              {
                field: 'image',
                fieldType: 'image',
                label: 'Une image',
                info: 'Sauvegarder avec une image ou non',
              },
            ],
          }}
        />
      </div>
    </div>
  );
}
