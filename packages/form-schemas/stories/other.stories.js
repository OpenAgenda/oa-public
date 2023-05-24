import { useState } from 'react';

import FormSchemaComponent from '../client/src/index';

import WigglyPoofComponent from './custom/WigglyPoofComponent';
import wigglypoofValidator from './custom/wigglypoof.validator';
import SimplePageDecorator from './decorators/SimpleTransparentPage';

import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'Other',
  decorators: [SimplePageDecorator],
};

export function MultilingualFieldsWithOneLanguage() {
  const props = {
    lang: 'fr',
    values: {
      amultilingualfield: { fr: 'Quelque chose' },
      amultilingualfieldwithatextininput: 'Un texte pas multilingue',
    },
    schema: {
      fields: [{
        field: 'amultilingualfield',
        fieldType: 'text',
        optional: false,
        languages: ['fr'],
        label: 'N\'importe quoi en français',
      }, {
        field: 'amultilfieldwithdefault',
        fieldType: 'text',
        optional: false,
        languages: ['fr', 'en'],
        default: 'William',
        label: 'La même valeur par défaut pour toutes les langues',
      }, {
        field: 'amultilfieldwithmultidefault',
        fieldType: 'text',
        optional: false,
        languages: ['fr', 'en', 'it'],
        default: {
          en: 'William',
          fr: 'Guillaume',
        },
        label: 'Une valeur par défaut par langue',
      }, {
        field: 'amultilingualfieldwithatextininput',
        fieldType: 'text',
        optional: true,
        languages: ['fr', 'en'],
        label: 'La valeur n\'est toujours pas multilingue',
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

export function RequiredMultilingualField() {
  const onSubmit = ({ values }) => {
    alert(JSON.stringify(values, null, 2));
  };

  const props = {
    lang: 'fr',
    onSubmit: v => onSubmit(v),
    schema: {
      fields: [{
        field: 'amultilingualfield',
        fieldType: 'text',
        optional: false,
        languages: ['fr'],
        label: 'N\'importe quoi en français',
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

export function FormWithACustomField() {
  const props = {
    res: {
      post: '',
      redirect: '/',
    },
    lang: 'fr',
    components: {
      wigglypoof: WigglyPoofComponent,
    },
    values: {
      title: {
        fr: 'Le titre',
        en: 'A title',
      },
    },
    schema: {
      custom: {
        wigglypoof: wigglypoofValidator,
      },
      fields: [{
        field: 'Title',
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
        field: 'customfield',
        fieldType: 'wigglypoof',
        label: {
          fr: 'Saisissez Wigglypoof',
          en: 'Type Wigglypoof',
        },
        sub: {
          fr: 'Et uniquement wigglypoof',
          en: 'And only wigglypoof',
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

export function FormWithAGivenButtonSection() {
  const props = {
    lang: 'fr',
    values: {
      staff: 129313,
      registered: new Date('2010-08-12'),
    },
    schema: {
      fields: [{
        field: 'staff',
        fieldType: 'integer',
        optional: false,
        label: {
          fr: 'Matricule',
          en: 'Staff number',
        },
      }, {
        field: 'registered',
        fieldType: 'date',
        optional: false,
        label: {
          fr: 'Date d\'enregistrement',
          en: 'Registration date',
        },
      }],
    },
    actionComponents: [{
      position: 'bottom',
      Component: ({ onSubmit }) => (
        <div style={{ padding: 20, border: '1px solid #ccc', textAlign: 'center' }}>
          <button type="button" onClick={onSubmit} className="btn btn-primary">Submit</button>
          <div>this is a custom section</div>
        </div>
      ),
    }],
  };

  return (
    <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <FormSchemaComponent {...props} />
      </div>
    </div>
  );
}

export function OnSubmitSuccess() {
  const [state, setState] = useState('');

  const props = {
    lang: 'fr',
    values: {
      something: 'Quelque chose',
    },
    schema: {
      fields: [{
        field: 'something',
        fieldType: 'text',
        label: {
          fr: 'Il faut écrire quelque chose',
        },
      }],
    },
  };

  return (
    <div className="container top-margined">
      <div className="row">
        <div className="wsq col-lg-5 col-lg-offset-1">
          <div className="margin-v-md margin-h-sm">
            <p>The onSubmitSuccess prop is called when the data has been sent and the response received successfully. It gives the values, and the response</p>
            <FormSchemaComponent
              {...props}
              onSubmitSuccess={(values, response) => {
                setState({
                  values,
                  responseBody: response.body,
                });
                console.log(values);
              }}
            />
          </div>
        </div>
        <div className="wsq col-lg-5 col-lg-offset-1">
          <div className="margin-v-md margin-h-sm">
            {state ? (
              <pre style={{ minHeight: 400 }}>
                {JSON.stringify(state, null, 2)}
              </pre>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Stateless() {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState([]);

  const props = {
    values,
    errors,
    stateless: true,
    onChange: ({ values: updatedValues, errors: updatedErrors }) => {
      setValues(updatedValues);
      setErrors(updatedErrors);
    },
    res: {
      post: '',
      redirect: '/',
    },
    lang: 'fr',
    schema: {
      fields: [{
        field: 'saying',
        fieldType: 'text',
        languages: ['fr', 'en'],
        optional: false,
        label: {
          fr: 'Titre',
          en: 'Title',
        },
        max: 140,
        placeholder: {
          fr: 'Un dicton',
          en: 'A saying',
        },
        sub: {
          fr: 'Ce champ est requis.',
          en: 'This field is required',
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

export function Conditional() {
  const props = {
    lang: 'fr',
    schema: {
      fields: [{
        field: 'anything',
        fieldType: 'text',
        optional: false,
        label: 'A word',
      }, {
        field: 'conditioned',
        fieldType: 'text',
        label: 'This is only enabled if first field is typed',
        enableWith: 'anything',
      }, {
        field: 'alsoConditioned',
        fieldType: 'checkbox',
        label: 'This also.',
        options: [{
          id: 1,
          value: 'one',
          label: 'One',
        }],
        enableWith: 'anything',
      }, {
        field: 'andThisAsWell',
        fieldType: 'boolean',
        label: 'And this as well',
        enableWith: 'anything',
      }, {
        field: 'thisToo',
        fieldType: 'radio',
        label: 'This too',
        options: [{
          id: 2,
          value: 'two',
          label: 'Two',
        }],
        enableWith: 'anything',
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

export function RequiredConditional() {
  const props = {
    lang: 'fr',
    withErrors: true,
    schema: {
      fields: [{
        field: 'anything',
        fieldType: 'text',
        label: 'A word',
      }, {
        field: 'conditioned',
        fieldType: 'text',
        optional: false,
        label: 'This is only enabled if first field is typed',
        enableWith: 'anything',
      }, {
        field: 'radios',
        fieldType: 'radio',
        label: 'Radio',
        default: 1,
        options: [{
          id: 1,
          label: 'Betelgeuse',
          value: 'betelgeuse',
        }, {
          id: 2,
          label: 'Chausson',
          value: 'chausson',
        }, {
          id: 3,
          label: 'Hydroxychloroquine',
          value: 'hydroxychloroquine',
        }],
      }, {
        field: 'moreconditioned',
        fieldType: 'text',
        optional: false,
        label: 'This is only enabled if previous radio has a value',
        enableWith: 'radios',
      }, {
        field: 'numberfield',
        fieldType: 'number',
        optional: false,
        label: 'This number field only enabled if previous radio has a value',
        enableWith: 'radios',
      }, {
        field: 'textfield',
        fieldType: 'text',
        optional: false,
        label: 'Write in that',
        info: 'Activated if Betelgeuse or Hydroxychloroquine',
        enableWith: {
          field: 'radios',
          value: [1, 3],
        },
      }, {
        field: 'thisorthat',
        fieldType: 'text',
        label: 'This or that',
        info: 'Optional only if Chausson or Hydroxychloroquine',
        optionalWith: {
          field: 'radios',
          value: [2, 3],
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

export function WithLinkedFields() {
  const props = {
    lang: 'fr',
    values: {
      image: '🦤',
    },
    schema: {
      fields: [{
        field: 'attendance',
        fieldType: 'radio',
        label: 'Attendance Mode',
        default: 1,
        options: [{
          id: 1,
          label: 'Offline',
          value: 'offline',
          info: 'No fields are conditioned to this value.',
        }, {
          id: 2,
          label: 'Online',
          value: 'online',
          info: 'When selected, Online access link is enabled, location is optional',
        }, {
          id: 3,
          label: 'Mixed',
          value: 'mixed',
          info: 'When selected, online access link is enabled',
        }],
      }, {
        field: 'location',
        fieldType: 'text',
        label: 'Location',
        info: 'Optional only if online',
        optionalWith: {
          field: 'attendance',
          value: 2,
        },
      }, {
        field: 'onlineaccesslink',
        fieldType: 'link',
        optional: false,
        label: 'Online access link',
        info: 'enabled if online or mixed',
        enableWith: {
          field: 'attendance',
          value: [2, 3],
        },
      }, {
        field: 'image',
        fieldType: 'text',
        optional: true,
        label: 'Pretend this is an image',
        info: 'This field is not enabled, it cannot be edited',
        enable: false,
      }, {
        field: 'alt',
        fieldType: 'text',
        label: 'Image alt',
        info: 'This field is linked to the disabled field image. It should be enabled as the disabled image field has a value.',
        enableWith: 'image',
      },
      {
        field: 'action-de-mediation',
        label: {
          fr: 'Action de médiation',
        },
        fieldType: 'boolean',
        optionalWith: null,
        optional: true,
      },
      {
        field: 'description-de-la-mediation',
        label: {
          fr: 'Description de la médiation',
        },
        optional: false,
        optionalWith: null,
        display: true,
        enable: true,
        origin: 'custom',
        enableWith: 'action-de-mediation',
        min: null,
        max: 400,
        fieldType: 'text',
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

export function Hidden() {
  const props = {
    schema: {
      fields: [{
        field: 'first',
        fieldType: 'text',
        optional: false,
        label: 'Field one',
        info: 'There is a field below this one named "two"',
      }, {
        field: 'second',
        fieldType: 'text',
        display: false,
        label: 'This will not be displayed',
        default: 'Default text',
      }, {
        field: 'third',
        fieldType: 'text',
        label: 'Field three',
      }, {
        field: 'four',
        fieldType: 'text',
        label: 'Field four',
        display: false,
        languages: ['it', 'fr'],
      }],
    },
    lang: 'fr',
  };

  return (
    <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <FormSchemaComponent {...props} />
      </div>
    </div>
  );
}

export function MissingLanguage() {
  const props = {
    lang: 'de',
    schema: {
      fields: [{
        field: 'first',
        fieldType: 'radio',
        optional: false,
        label: {
          fr: 'Un champ',
          en: 'A field',
        },
        options: [{
          id: 1,
          value: 'thing',
          label: {
            fr: 'Un truc',
            en: 'A thing',
          },
        }],
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
