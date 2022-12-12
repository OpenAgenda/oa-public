import _ from 'lodash';
import { useState } from 'react';
import '@openagenda/bs-templates/compiled/main.css';

import FormSchemaComponent from '../client/src/index';
import SimpleRowDecorator from './decorators/SimpleRow';

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}

export default {
  title: 'Field types',
  decorators: [SimpleRowDecorator],
};

export function TextArea() {
  const props = {
    res: {
      post: '',
      redirect: '/',
    },
    lang: 'fr',
    schema: {
      fields: [{
        field: 'singlelangfield',
        fieldType: 'textarea',
        label: {
          fr: 'C\'est un champ avec une langue',
        },
        info: {
          fr: 'Le texte info',
        },
        sub: {
          fr: 'Le texte dessous',
        },
        max: 10000,
      }, {
        field: 'multilangfield',
        fieldType: 'textarea',
        languages: ['fr', 'en'],
        optional: false,
        label: {
          fr: 'Un champ multilingue',
        },
        info: {
          fr: 'Le texte info',
        },
        placeholder: {
          fr: 'Une courte description de votre événement',
        },
        sub: {
          fr: 'Le texte dessous',
        },
        max: 400,
      }],
    },
  };

  return (
    <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <p>Here we have two textarea fields. One simple, one multilingual</p>
        <FormSchemaComponent {...props} />
      </div>
    </div>
  );
}

export function SlateField() {
  const [state, setState] = useState('');

  const props = {
    res: {
      post: '',
      redirect: '/',
    },
    lang: 'fr',
    values: {
      // this is what a slate value looks like.
      singlelangfield: JSON.stringify({
        document: {
          nodes: [
            {
              object: 'block',
              type: 'paragraph',
              nodes: [
                {
                  object: 'text',
                  leaves: [
                    {
                      text: 'A line of text in a paragraph.',
                    },
                  ],
                },
              ],
            },
          ],
        },
      }),
    },
    schema: {
      fields: [{
        field: 'singlelangfield',
        fieldType: 'slate',
        label: {
          fr: 'C\'est un champ qui pond un doc slate',
        },
        info: {
          fr: 'Le texte info',
        },
        sub: {
          fr: 'Le texte dessous',
        },
      }, {
        field: 'emptyfieldwithlongplaceholder',
        fieldType: 'slate',
        optional: false,
        label: {
          fr: 'C\'est un champ avec un gros placeholder',
        },
        info: 'Le placeholder s\'étale sur plusieurs lignes',
        placeholder: {
          fr: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.\nSed non risus.\nSuspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor.\nCras elementum ultrices diam.\nMaecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie',
        },
      }],
    },
  };

  return (
    <div className="container top-margined">
      <div className="row">
        <div className="wsq col-lg-5 col-lg-offset-1">
          <div className="margin-v-md margin-h-sm">
            <p>An Slate field.</p>
            <FormSchemaComponent {...props} onChange={v => setState(v)} />
          </div>
        </div>
        <div className="wsq col-lg-5 col-lg-offset-1">
          <div className="margin-v-md margin-h-sm">
            {state?.values?.singlelangfield ? (
              <pre style={{ minHeight: 400 }}>
                {JSON.stringify(state?.values?.singlelangfield, null, 2)}
              </pre>
            ) : null }
          </div>
        </div>
      </div>
    </div>
  );
}

export function HTMLField() {
  const [values, setFormValues] = useState({
    singlelangfield: '<p>Et boum</p>',
  });

  const [loaded, setLoaded] = useState(true);

  const props = {
    res: {
      post: '',
      redirect: '/',
    },
    lang: 'fr',
    values,
    schema: {
      fields: [{
        field: 'singlelangfield',
        fieldType: 'html',
        label: {
          fr: 'C\'est un champ qui pond du html',
        },
        info: {
          fr: 'Le texte info',
        },
        sub: {
          fr: 'Le texte dessous',
        },
        max: 10000,
      }, {
        field: 'withdefault',
        fieldType: 'html',
        label: {
          fr: 'Un champ avec une valeur par défaut',
        },
        default: '<p>Valeur par défaut</p>',
      }],
    },
  };

  if (!loaded) {
    return <p>Not loaded</p>;
  }

  return (
    <div className="container top-margined">
      <div className="row">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setLoaded(false);

            setFormValues({
              singlelangfield: '<p></p>',
            });
            setTimeout(() => {
              setLoaded(true);
            }, 100);
          }}
        >
          Load empty p tag
        </button>
        <div className="wsq col-lg-5 col-lg-offset-1">
          <div className="margin-v-md margin-h-sm">
            <p>An HTML field.</p>
            <FormSchemaComponent
              {...props}
              onChange={v => setFormValues(v.values)}
            />
          </div>
        </div>
        <div className="wsq col-lg-5 col-lg-offset-1">
          <div className="margin-v-md margin-h-sm">
            {values?.singlelangfield ? (
              <pre style={{ minHeight: 400 }}>
                {values.singlelangfield}
              </pre>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function IntegerFields() {
  const onSubmit = ({ values }) => {
    alert(JSON.stringify(values, null, 2));
  };

  const props = {
    lang: 'fr',
    onSubmit: v => onSubmit(v),
    schema: {
      fields: [{
        field: 'anintegerfield',
        fieldType: 'integer',
        label: 'Type an integer',
        max: 100,
        min: 50,
      }, {
        field: 'arequiredintegerfield',
        fieldType: 'integer',
        label: 'A required integer',
        max: 10,
        optional: false,
      }],
    },
  };

  return (
    <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <p>A number and an integer</p>
        <FormSchemaComponent {...props} />
      </div>
    </div>
  );
}

export function NumbersFields() {
  const props = {
    res: {
      post: '',
      redirect: '/',
    },
    lang: 'fr',
    values: {
      afieldwithavalue: 0,
    },
    schema: {
      fields: [{
        field: 'anumberfield',
        fieldType: 'number',
        label: 'Type a number',
        max: 100,
        min: 50,
      }, {
        field: 'afieldwithavalue',
        fieldType: 'number',
        label: 'Should load with a 0',
      }],
    },
  };

  return (
    <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <p>A number and an integer</p>
        <FormSchemaComponent {...props} />
      </div>
    </div>
  );
}

export function TextFields() {
  const onSubmit = ({ values }) => {
    console.log(values);
  };

  const props = {
    res: {
      post: '',
      redirect: '/',
    },
    lang: 'fr',
    onSubmit: v => onSubmit(v),
    schema: {
      fields: [{
        field: 'atextfield',
        fieldType: 'text',
        label: 'Type a bunch of text',
      }, {
        field: 'requiredtextfield',
        fieldType: 'text',
        optional: false,
        label: 'Here too.',
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

export function LinkFields() {
  const props = {
    lang: 'fr',
    schema: {
      fields: [{
        field: 'anintegerfield',
        fieldType: 'link',
        label: 'Type a link',
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

export function DateFields() {
  const props = {
    res: {
      post: '',
      redirect: '/',
    },
    lang: 'fr',
    schema: {
      fields: [{
        field: 'adatefield',
        fieldType: 'date',
        label: 'Pick a date',
      }, {
        field: 'adisableddatefield',
        fieldType: 'date',
        label: {
          fr: 'Une date désactivée',
          en: 'A disabled date',
        },
        enableWith: 'adatefield',
      }, {
        field: 'afieldwithavalue',
        fieldType: 'date',
        label: 'Une date avec une valeur',
      }],
    },
    values: {
      afieldwithavalue: '2021-11-04T23:00:00.000Z',
    },
  };

  return (
    <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <p>A single required choice field</p>
        <FormSchemaComponent {...props} />
      </div>
    </div>
  );
}

export function SelectFields() {
  const [values, setValues] = useState(null);
  const props = {
    res: {
      post: '',
      redirect: '/',
    },
    lang: 'fr',
    schema: {
      fields: [{
        field: 'amultiselectfield',
        fieldType: 'multiselect',
        label: 'Make some choices',
        optional: false,
        default: 2,
        options: [{
          id: 1,
          value: 'option-one',
          label: 'Option one',
        }, {
          id: 2,
          value: 'option-two',
          label: 'Option two',
        }, {
          id: 3,
          value: 'option-three',
          label: 'Option three',
        }, {
          id: 4,
          value: 'option-four',
          label: 'Option Four',
          display: false,
        }],
      }, {
        field: 'anoptionalreadiofieldwithinfo',
        fieldType: 'select',
        label: 'Make an informed choice, or not',
        optional: true,
        options: [{
          id: 5,
          value: 'elephant',
          label: 'Elephant',
          info: 'Big and gray, not very hairy.',
        }, {
          id: 6,
          value: 'spider',
          label: 'Spider',
          info: 'Never small enough, with 8 feet and 8 eyes',
        }, {
          id: 7,
          value: 'fork',
          label: 'Fork',
          info: {
            en: 'Why is this even here?',
            fr: 'Pourquoi?',
          },
        }],
      }, {
        field: 'animplicitelyoptionalradiofield',
        fieldType: 'select',
        label: 'Unspecified optional means optional',
        options: [{
          id: 8,
          value: 'tbag',
          label: 'Tea bag',
        }],
      }, {
        field: 'requiredwithoutvalueatloadisrequired',
        fieldType: 'select',
        label: 'Required without value at load is required',
        info: 'Do not select anything and submit to see error message',
        optional: false,
        options: [{
          id: 9,
          value: 'scorbut',
          label: 'Scorbut',
        }, {
          id: 10,
          value: 'wall',
          label: 'Wall',
        }],
      }],
    },
    onChange: setValues,
  };

  return (
    <div className="row">
      <div className="col-lg-6 wsq">
        <p>A single required choice field</p>
        <FormSchemaComponent {...props} />
      </div>
      <div className="col-lg-6">
        <pre>
          <code>
            {JSON.stringify(values, null, 2)}
          </code>
        </pre>
      </div>
    </div>
  );
}

export function RadioFields() {
  const props = {
    res: {
      post: '',
      redirect: '/',
    },
    lang: 'fr',
    schema: {
      fields: [{
        field: 'aradiofield',
        fieldType: 'radio',
        label: 'Make a choice',
        optional: false,
        default: 2,
        options: [{
          id: 1,
          value: 'option-one',
          label: 'Option one',
        }, {
          id: 2,
          value: 'option-two',
          label: 'Option two',
        }, {
          id: 3,
          value: 'option-three',
          label: 'Option three',
        }, {
          id: 4,
          value: 'option-four',
          label: 'Option Four',
          display: false,
        }],
      }, {
        field: 'anoptionalreadiofieldwithinfo',
        fieldType: 'radio',
        label: 'Make an informed choice, or not',
        optional: true,
        options: [{
          id: 5,
          value: 'elephant',
          label: 'Elephant',
          info: 'Big and gray, not very hairy.',
        }, {
          id: 6,
          value: 'spider',
          label: 'Spider',
          info: 'Never small enough, with 8 feet and 8 eyes',
        }, {
          id: 7,
          value: 'fork',
          label: 'Fork',
          info: { en: 'Why is this even here?', fr: 'Pourquoi?' },
        }],
      }, {
        field: 'animplicitelyoptionalradiofield',
        fieldType: 'radio',
        label: 'Unspecified optional means optional',
        options: [{
          id: 8,
          value: 'tbag',
          label: 'Tea bag',
        }],
      }, {
        field: 'requiredwithoutvalueatloadisrequired',
        fieldType: 'radio',
        label: 'Required without value at load is required',
        info: 'Do not select anything and submit to see error message',
        optional: false,
        options: [{
          id: 9,
          value: 'scorbut',
          label: 'Scorbut',
        }, {
          id: 10,
          value: 'wall',
          label: 'Wall',
        }],
      }],
    },
  };

  return (
    <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <p>A single required choice field</p>
        <FormSchemaComponent {...props} />
      </div>
    </div>
  );
}

export function Checkboxes() {
  const alertOnSubmit = ({ values, clean }) => {
    alert(JSON.stringify({ values, clean }, null, 2));
  };

  const props = {
    onSubmit: alertOnSubmit,
    lang: 'fr',
    schema: {
      fields: [{
        field: 'acheckboxfield',
        fieldType: 'checkbox',
        label: 'Make a choice with default',
        optional: false,
        default: [2, 3],
        options: [{
          id: 1,
          value: 'option-one',
          label: 'Option one',
        }, {
          id: 2,
          value: 'option-two',
          label: 'Option two',
        }, {
          id: 3,
          value: 'option-three',
          label: 'Option three',
        }, {
          id: 4,
          value: 'option-four',
          label: 'Option four',
          display: false,
        }],
      }, {
        field: 'acheckboxfieldwithmax',
        fieldType: 'checkbox',
        label: 'Make a choice with max number of possible selection',
        max: 2,
        default: [6, 7],
        options: [{
          id: 6,
          value: 'option-six',
          label: 'Option six',
        }, {
          id: 7,
          value: 'option-seven',
          label: 'Option seven',
        }, {
          id: 8,
          value: 'option-eight',
          label: 'Option eight',
        }],
      }, {
        field: 'arequiredcheckboxfieldwithoutdefaults',
        fieldType: 'checkbox',
        label: 'Make a choice without default',
        optional: false,
        options: [{
          id: 5,
          value: 'option-five',
          label: 'Option Five',
        }],
      }],
    },
  };

  return (
    <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <p>A multiple choice field</p>
        <FormSchemaComponent {...props} />
      </div>
    </div>
  );
}

export function Boolean() {
  const onChange = ({ values }) => {
    console.log(values);
  };

  const props = {
    res: {
      post: '',
      redirect: '/',
    },
    lang: 'fr',
    onChange: v => onChange(v),
    schema: {
      fields: [{
        field: 'ayesorno',
        fieldType: 'boolean',
        label: 'Well ok',
        optional: false,
      }, {
        field: 'longlabelwithinfoandhelp',
        fieldType: 'boolean',
        label: 'This is an extremely long label that will take up more than one line in the form. The first line of the label should still appear on the line of the checkbox itself',
        info: 'An info text displayed under the label',
        help: 'Click here for more info',
        helpLink: 'https://openagenda.com',
      }, {
        field: 'checkedbydefault',
        fieldType: 'boolean',
        label: 'This should be checked by default',
        default: true,
      }],
    },
  };

  return (
    <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <p>A single required choice field</p>
        <FormSchemaComponent {...props} />
      </div>
    </div>
  );
}

export function MarkdownField() {
  const [state, setState] = useState('');

  const props = {
    res: {
      post: '',
      redirect: '/',
    },
    lang: 'fr',
    values: {
      singlelangfield: 'Avant\n\nhttp://le\\_monde.com\n\net après',
      multilangfield: { fr: '*Et boum*' },
    },
    schema: {
      fields: [{
        field: 'simpletextfield',
        fieldType: 'text',
        label: {
          fr: 'C\'est un champ basique',
        },
      }, {
        field: 'singlelangfield',
        fieldType: 'markdown',
        optional: false,
        label: {
          fr: 'C\'est un champ qui pond du markdown',
        },
        info: {
          fr: 'Le texte info',
        },
        sub: {
          fr: 'Le texte dessous',
        },
        max: 10000,
      }, {
        field: 'multilangfield',
        fieldType: 'markdown',
        optional: false,
        languages: ['en', 'fr'],
        label: {
          fr: 'C\'est pareil, mais multilingue',
        },
        info: {
          fr: 'Le texte info',
        },
        placeholder: {
          fr: 'S\'affiche dans le champ',
        },
        sub: {
          fr: 'Le texte dessous',
        },
        max: 4000,
      }, {
        field: 'monolingualmarkdown',
        optional: false,
        fieldType: 'markdown',
        info: 'With some ',
        placeholder: 'Type in stuff\n on multiple lines\nAs placeholder',
        label: 'Monolingual markdown field',
        default: '**Some default text**',
      }],
    },
  };

  return (
    <div className="container top-margined">
      <div className="row">
        <div className="wsq col-lg-5 col-lg-offset-1">
          <div className="margin-v-md margin-h-sm">
            <p>Some markdown fields.</p>
            <FormSchemaComponent {...props} onChange={v => setState(v)} />
          </div>
        </div>
        <div className="wsq col-lg-5 col-lg-offset-1">
          <div className="margin-v-md margin-h-sm">
            {_.get(state, 'values.singlelangfield') ? (
              <pre style={{ minHeight: 400 }}>
                {_.get(state, 'values.singlelangfield')}
              </pre>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FileUploadField() {
  const props = {
    res: {
      post: '',
      redirect: '/',
    },
    lang: 'fr',
    fileKey: 'uniquefilekey123',
    values: {
      somefile: {
        originalName: 'alorsalors.jpg',
        extension: 'jpg',
        filename: 'uniquefilekey123.somefile.jpg',
      },
    },
    schema: {
      fields: [{
        field: 'somefile',
        fieldType: 'file',
        extensions: ['jpg', 'pdf'],
        store: {
          type: 's3',
          bucket: 'oadev',
        },
        label: {
          fr: 'C\'est un champ qui permet de charger un fichier',
        },
        info: {
          fr: 'Le texte info',
        },
        sub: {
          fr: 'Le texte dessous',
        },
      }, {
        field: 'someotherfield',
        fieldType: 'text',
        label: {
          fr: 'Libre',
          en: 'Free',
        },
      }],
    },
  };

  return (
    <div className="container top-margined">
      <div className="row">
        <div className="wsq col-lg-5 col-lg-offset-1">
          <div className="margin-v-md margin-h-sm">
            <p>A file upload field.</p>
            <FormSchemaComponent {...props} onChange={() => {}} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ImageUploadField() {
  const props = {
    res: {
      post: '',
      redirect: '/',
    },
    maxFileSize: 20,
    lang: 'fr',
    fileKey: 'uniquefilekey',
    values: {
      someimage: {
        originalName: 'large_monkey-shoulder-thumb.jpg',
        extension: 'jpg',
        filename: 'uniquefilekey.someimage.jpg',
      },
    },
    schema: {
      fields: [{
        field: 'someimage',
        fieldType: 'image',
        extensions: ['jpg', 'bmp', 'png'],
        store: {
          type: 's3',
          bucket: 'oadev',
        },
        label: {
          fr: 'C\'est un champ qui permet de charger une image',
        },
        info: {
          fr: 'Le texte info',
        },
        sub: {
          fr: 'Le texte dessous',
        },
      }, {
        field: 'somerequiredimage',
        fieldType: 'image',
        extensions: ['jpg'],
        optional: false,
        label: 'A required image',
      }, {
        label: 'Les crédits',
        field: 'imageCredits',
        fieldType: 'text',
        enableWith: 'somerequiredimage',
      }, {
        field: 'somedisabledimage',
        fieldType: 'image',
        extensions: ['jpg'],
        enable: false,
        label: 'A disabled image field',
      }],
    },
  };

  return (
    <div className="container top-margined">
      <div className="row">
        <div className="wsq col-lg-5 col-lg-offset-1">
          <div className="margin-v-md margin-h-sm">
            <p>An image upload field.</p>
            <FormSchemaComponent {...props} onChange={() => {}} />
          </div>
        </div>
      </div>
    </div>
  );
}
