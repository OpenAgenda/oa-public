import FormSchemaComponent from '../client/src/index.js';
import SimpleRowDecorator from './decorators/SimpleRow.js';

import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'LinkedFields/optionalWith',
  decorators: [SimpleRowDecorator],
};

export function SimpleCaseWithTextInputs() {
  return (
    <div className="col col-sm-6 wsq">
      <FormSchemaComponent
        lang="fr"
        schema={{
          fields: [
            {
              field: 'anything',
              fieldType: 'text',
              label: 'A word',
            },
            {
              field: 'conditioned',
              fieldType: 'text',
              label: 'This is only optional if first field is typed',
              optionalWith: 'anything',
            },
          ],
        }}
      />
    </div>
  );
}

export function SimpleCaseWithRadios() {
  return (
    <div className="col col-sm-6 wsq padding-v-sm">
      <FormSchemaComponent
        lang="fr"
        schema={{
          fields: [
            {
              field: 'radios',
              fieldType: 'radio',
              label: 'Radios sans valeur par défaut de définie',
              options: [
                {
                  id: 1,
                  label: 'Betelgeuse',
                  value: 'betelgeuse',
                },
                {
                  id: 2,
                  label: 'Chausson',
                  value: 'chausson',
                },
                {
                  id: 3,
                  label: 'Hydroxychloroquine',
                  value: 'hydroxychloroquine',
                },
              ],
            },
            {
              field: 'conditioned',
              fieldType: 'text',
              label:
                'Ce champ est optionnel que quand le champ du dessus à une valeur de définie',
              optionalWith: 'radios',
            },
            {
              field: 'radiosWithDefault',
              fieldType: 'radio',
              label: 'Radios sans valeur par défaut de définie',
              default: 12,
              allowNull: true,
              options: [
                {
                  id: 11,
                  label: 'Lapin',
                  value: 'lapin',
                },
                {
                  id: 12,
                  label: 'Bruine',
                  value: 'bruine',
                },
                {
                  id: 13,
                  label: 'Clavier',
                  value: 'clavier',
                },
              ],
            },
            {
              field: 'otherConditioned',
              fieldType: 'text',
              label:
                'Ce champ est optionnel que quand le champ du dessus a une valeur de définie',
              optionalWith: 'radiosWithDefault',
            },
            {
              field: 'yetAnotherConditioned',
              fieldType: 'text',
              label: 'Ce champ est optionnel que quand Lapin est sélectionné',
              optionalWith: {
                field: 'radiosWithDefault',
                value: 11,
              },
            },
          ],
        }}
      />
    </div>
  );
}
