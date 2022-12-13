import { useState } from 'react';
import ih from 'immutability-helper';
import '@openagenda/bs-templates/compiled/main.css';

import {
  BrowserRouter as Router,
  Switch,
  Link,
  Route,
} from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import { locales } from '@openagenda/react-shared';

import { schema as simplest } from '../dev/schemas/simplest';
import FormSchemaComponent from '../client/src/index';
import SimplePageDecorator from './decorators/SimpleTransparentPage';

export default {
  title: 'Getting started',
  decorators: [SimplePageDecorator],
};

export function BlankFormWithOneTextField() {
  return (
    <div className="row">
      <div className="col-sm-offset-4 col-sm-4 wsq padding-all-sm">
        <FormSchemaComponent
          lang="fr"
          schema={simplest}
        />
      </div>
    </div>
  );
}

export function OneRequiredField() {
  const schema = {
    fields: [{
      field: 'anything',
      fieldType: 'text',
      optional: false,
      label: 'Pas tout à fait n\'importe quoi',
      min: 3,
      max: 10,
    }],
  };
  return (
    <div className="row">
      <div className="col-sm-offset-4 col-sm-4 wsq padding-all-sm">
        <FormSchemaComponent
          lang="fr"
          schema={schema}
        />
      </div>
    </div>
  );
}

export function OneFieldWithDefaultValue() {
  const schema = {
    fields: [{
      field: 'anything',
      fieldType: 'text',
      label: 'Si rien, alors quelque chose',
      default: 'Quelque chose!',
    }],
  };
  return (
    <div className="row">
      <div className="col-sm-offset-4 col-sm-4 wsq padding-all-sm">
        <FormSchemaComponent
          lang="fr"
          schema={schema}
        />
      </div>
    </div>
  );
}

export function OneDisabledFieldWithValue() {
  const [values, setUpdatedValues] = useState({
    disabledfield: 'This value is not editable',
  });

  const schema = {
    fields: [{
      field: 'disabledfield',
      fieldType: 'text',
      label: 'This field should be disabled',
      enable: false,
    }],
  };
  return (
    <div className="row">
      <div className="col-sm-offset-2 col-sm-4">
        <p>
          <strong>Value of disabled field is in update and submitted payload.</strong>
          &nbsp;(value should be visible on the right)
        </p>
        <div className="wsq padding-all-sm">
          <FormSchemaComponent
            lang="fr"
            schema={schema}
            values={{
              disabledfield: 'This value is not editable',
            }}
            onUpdate={v => setUpdatedValues(v)}
            onSubmit={({ clean }) => setUpdatedValues(clean)}
          />
        </div>
      </div>
      <div className="col-sm-4 padding-all-sm">
        <pre className="wsq padding-all-sm">
          <code>
            {JSON.stringify(values, null, 2)}
          </code>
        </pre>
      </div>
    </div>
  );
}

export function OneFieldWithInfoText() {
  const schema = {
    fields: [{
      field: 'one',
      fieldType: 'text',
      label: 'Un premier champ',
      info: 'Un texte d\'information',
    }, {
      field: 'two',
      fieldType: 'text',
      label: 'Un deuxième champ',
      info: 'Un texte d\'information\nSur plusieurs lignes',
    }],
  };
  return (
    <div className="row">
      <div className="col-sm-offset-4 col-sm-4 wsq padding-all-sm">
        <FormSchemaComponent
          lang="fr"
          schema={schema}
        />
      </div>
    </div>
  );
}

export function OneFieldWithHelpLink() {
  const schema = {
    fields: [{
      field: 'anything',
      fieldType: 'text',
      label: 'The label',
      help: 'This is the help message.',
      helpLink: 'https://openagenda.com',
    }, {
      field: 'anythingelse',
      fieldType: 'text',
      label: 'The other label',
      help: 'The link is an email',
      helpLink: 'mailto:support@openagenda.com',
    }, {
      field: 'randomthings',
      fieldType: 'text',
      label: 'A hover on help',
      helpContent: 'Explain the things [here](https://openagenda.com)',
    }],
  };
  return (
    <div className="row">
      <div className="col-sm-offset-4 col-sm-4 wsq padding-all-sm">
        <FormSchemaComponent
          lang="fr"
          schema={schema}
        />
      </div>
    </div>
  );
}

export function FormWithLoadedValues() {
  const props = {
    lang: 'fr',
    values: {
      name: 'Janine',
      age: 122,
    },
    schema: {
      fields: [{
        field: 'name',
        fieldType: 'text',
        optional: false,
        label: {
          fr: 'Votre nom',
          en: 'Your name',
        },
      }, {
        field: 'age',
        fieldType: 'integer',
        optional: false,
        label: {
          fr: 'Votre age',
          en: 'Your age',
        },
        max: 100,
      }, {
        field: 'multimessage',
        fieldType: 'text',
        optional: false,
        languages: ['fr', 'en'],
        label: {
          fr: 'Un court message',
          en: 'A short message',
        },
        sub: {
          fr: 'Vraiment court',
          en: 'Really short',
        },
        max: 50,
      }],
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

export function FormWithSections() {
  return (
    <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <FormSchemaComponent
          lang="fr"
          schema={{
            fields: [{
              type: 'section',
              label: 'Identification',
            }, {
              field: 'firstName',
              fieldType: 'text',
              label: 'First name',
            }, {
              field: 'surname',
              fieldType: 'integer',
              label: 'Surname',
              max: 100,
            }, {
              type: 'section',
              label: 'Your home',
            }, {
              field: 'address',
              fieldType: 'text',
              label: 'Your address',
            }, {
              field: 'city',
              fieldType: 'text',
              label: 'Your city',
            }, {
              type: 'section',
            }, {
              field: 'gdpr',
              fieldType: 'boolean',
              label: 'Do whatever with my data',
            }],
          }}
        />
      </div>
    </div>
  );
}

export function FieldsWithDifferentWriteAccesses() {
  const props = {
    lang: 'fr',
    schema: {
      fields: [{
        field: 'regularfield',
        fieldType: 'text',
        label: 'Un champ sans restriction d\'accès',
      }, {
        field: 'restrictedtoarole',
        fieldType: 'text',
        label: 'Un champ restreint au role fourchette',
        write: ['fourchette'],
      }, {
        field: 'restrictedtoanotherrole',
        fieldType: 'text',
        label: 'Un événement restreint au role couteau',
        write: ['couteau'],
      }, {
        field: 'restrictedtobothroles',
        fieldType: 'text',
        label: 'Un événement restreint aux rôles couteau et fourchette',
        write: ['couteau', 'fourchette'],
      }],
    },
  };
  return (
    <div className="container margin-top-lg">
      <h1 className="text-center">Un même schema chargé avec des rôles différents</h1>
      <div className="row margin-v-md margin-h-sm">
        <div className="col col-sm-4 padding-top-sm">
          <div className="wsq padding-all-sm">
            <p>pas de role de chargé</p>
            <FormSchemaComponent {...props} />
          </div>
        </div>
        <div className="col col-sm-4 padding-top-sm">
          <div className="wsq padding-all-sm">
            <p>role &quot;fourchette&quot; en prop</p>
            <FormSchemaComponent {...ih(props, { role: { $set: 'fourchette' } })} />
          </div>
        </div>
        <div className="col col-sm-4 padding-top-sm">
          <div className="wsq padding-all-sm">
            <p>role &quot;couteau&quot; en prop</p>
            <FormSchemaComponent {...ih(props, { role: { $set: 'couteau' } })} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function LeavePageWarning() {
  const props = {
    lang: 'fr',
    unloadWarning: {
      page: true,
      router: true,
    },
    schema: {
      fields: [{
        field: 'bewarned',
        fieldType: 'text',
        label: 'Soyez avertis',
      }],
    },
  };
  return (
    <IntlProvider locale="fr" key="fr" messages={locales.fr}>
      <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
        <div className="row margin-v-md margin-h-sm">
          <p>Type something then reload page.</p>
          <Router>
            <ul className="list-unstyled">
              <li>
                <Link to="/">Main (start here)</Link>
              </li>
              <li>
                <Link to="/other">Other (leave main)</Link>
              </li>
            </ul>
            <Switch>
              <Route path="/" exact>
                <FormSchemaComponent {...props} />
              </Route>
              <Route path="/other">
                <p>Other</p>
              </Route>
            </Switch>
          </Router>
        </div>
      </div>
    </IntlProvider>
  );
}

export function MemberFormUseCase() {
  const props = {
    lang: 'fr',
    method: 'patch',
    schema: {
      fields: [{
        field: 'organization',
        label: 'Organization',
        fieldType: 'text',
        optional: false,
      },
      {
        field: 'contactNumber',
        label: 'Telephone',
        fieldType: 'phone',
        optional: false,
      },
      {
        field: 'contactName',
        label: 'Name Surname',
        fieldType: 'text',
        optional: false,
      },
      {
        field: 'contactPosition',
        label: 'Position',
        fieldType: 'text',
        optional: false,
      },
      {
        field: 'email',
        label: 'Email',
        fieldType: 'email',
        optional: false,
      }],
    },
    onCancel: () => {
      // eslint-disable-next-line no-console
      console.log('cancelled');
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

export function ProtoEventFormUseCase() {
  const props = {
    res: {
      post: '',
      redirect: '/',
    },
    lang: 'fr',
    schema: {
      fields: [{
        field: 'title',
        fieldType: 'text',
        languages: ['fr', 'en'],
        optional: false,
        label: {
          fr: 'Titre',
          en: 'Title',
        },
        max: 140,
        placeholder: {
          fr: 'Le titre de votre événement',
          en: 'Title of your event',
        },
        sub: {
          fr: 'Ce champ est requis.',
          en: 'This field is required',
        },
      }, {
        field: 'description',
        fieldType: 'text',
        languages: ['fr', 'en'],
        optional: false,
        label: {
          fr: 'Description courte',
          en: 'Short description',
        },
        placeholder: {
          fr: 'Une courte description de votre événement',
          en: 'A short description of your event',
        },
      }, {
        field: 'longDescription',
        fieldType: 'textarea',
        languages: ['fr', 'en'],
        label: {
          fr: 'Description longue',
          en: 'Long description',
        },
        sub: {
          fr: 'Ce champ ne doit pas exceder 10000 caractères',
          en: 'This field should not exceed 10000 characters',
        },
      }, {
        field: 'conditions',
        fieldType: 'text',
        label: {
          fr: 'Conditions de participation, tarifs',
          en: 'Attendence conditions, pricing',
        },
        sub: {
          fr: 'Tel format est accepté',
          en: 'Some specific format is accepted',
        },
      }],
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
