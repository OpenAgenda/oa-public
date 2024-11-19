import FormSchemaComponent from '../client/src/index.js';
import SimpleRowDecorator from './decorators/SimpleRow.js';
import SimpleColumnDecorator from './decorators/SimpleColumn.js';

export default {
  title: 'Fields/Checkboxes',
  decorators: [SimpleColumnDecorator, SimpleRowDecorator],
};

const alertOnSubmit = ({ values, clean }) => {
  alert(JSON.stringify({ values, clean }, null, 2));
};

export const OptionalWithDefaultAndHiddenOption = () => (
  <>
    <p>There is a fourth checkbox</p>
    <FormSchemaComponent
      onSubmit={alertOnSubmit}
      lang="fr"
      schema={{
        fields: [
          {
            field: 'acheckboxfield',
            fieldType: 'checkbox',
            label: 'Make a choice with default',
            optional: false,
            default: [2, 3],
            options: [
              {
                id: 1,
                value: 'option-one',
                label: 'Option one',
              },
              {
                id: 2,
                value: 'option-two',
                label: 'Option two',
              },
              {
                id: 3,
                value: 'option-three',
                label: 'Option three',
              },
              {
                id: 4,
                value: 'option-four',
                label: 'Option four',
                display: false,
              },
            ],
          },
        ],
      }}
    />
  </>
);

export function Checkboxes() {
  const props = {
    onSubmit: alertOnSubmit,
    lang: 'fr',
    schema: {
      fields: [
        {
          field: 'acheckboxfieldwithmax',
          fieldType: 'checkbox',
          label: 'Make a choice with max number of possible selection',
          max: 2,
          default: [6, 7],
          options: [
            {
              id: 6,
              value: 'option-six',
              label: 'Option six',
            },
            {
              id: 7,
              value: 'option-seven',
              label: 'Option seven',
            },
            {
              id: 8,
              value: 'option-eight',
              label: 'Option eight',
            },
          ],
        },
        {
          field: 'arequiredcheckboxfieldwithoutdefaults',
          fieldType: 'checkbox',
          label: 'Make a choice without default',
          optional: false,
          options: [
            {
              id: 5,
              value: 'option-five',
              label: 'Option Five',
            },
          ],
        },
        {
          field: 'acheckboxfieldwithinfo',
          fieldType: 'checkbox',
          label: 'Make an informed choice, or not',
          options: [
            {
              id: 9,
              value: 'option-nine',
              label: 'Option Nine',
              info: 'info one, info two.',
            },
            {
              id: 10,
              value: 'option-ten',
              label: 'Option Ten',
              info: 'an info',
            },
          ],
        },
      ],
    },
  };

  return (
    <>
      <p>A multiple choice field</p>
      <FormSchemaComponent {...props} />
    </>
  );
}
