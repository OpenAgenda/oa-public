import FormSchemaComponent from '../client/src/index.js';
import SimpleRowDecorator from './decorators/SimpleRow.js';

import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'LinkedFields/enableWith',
  decorators: [SimpleRowDecorator],
};

export function SimpleCaseWithTextInputs() {
  return (
    <div className="col col-sm-6 wsq">
      <FormSchemaComponent
        lang="fr"
        withErrors
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
              optional: false,
              label: 'This is only enabled if first field is typed',
              enableWith: 'anything',
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
              info: 'Le champ du dessous devrait être grisé de base, dégrisé quand une valeur est choisie',
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
              optional: false,
              label:
                'Ce champ ne doit être activé que si le premier champ à un choix de défini',
              enableWith: 'radios',
            },
            {
              field: 'radiosWithDefault',
              fieldType: 'radio',
              label: 'Radios sans valeur par défaut de définie',
              info: 'Le champ du dessous devrait être activé de base, grisé quand "aucun choix" est choisi',
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
              optional: false,
              label:
                'Ce champ ne doit être activé que si le premier champ à un choix de défini',
              enableWith: 'radiosWithDefault',
            },
          ],
        }}
      />
    </div>
  );
}

export function EnableWithAndDefaultValue() {
  return (
    <div className="col col-sm-6 wsq padding-v-sm">
      <FormSchemaComponent
        lang="fr"
        withErrors
        values={{ attendanceMode: 2 }}
        onSubmit={({ values, clean }) => {
          console.log('submitted values', values);
          console.log('submitted clean', clean);
        }}
        schema={{
          fields: [
            {
              field: 'attendanceMode',
              fieldType: 'radio',
              label: 'Mode de participation',
              optional: false,
              default: 1,
              options: [
                {
                  id: 1,
                  value: 'offline',
                  label: 'Sur place',
                },
                {
                  id: 2,
                  value: 'online',
                  label: 'En ligne',
                },
                {
                  id: 3,
                  value: 'mixed',
                  label: 'Mixte',
                },
              ],
            },
            {
              field: 'onlineAccessLink',
              fieldType: 'link',
              label: "Lien d'accès en ligne",
              optional: false,
              default: 'https://meet.example.com/room',
              enableWith: {
                field: 'attendanceMode',
                value: [2, 3],
              },
            },
          ],
        }}
      />
    </div>
  );
}
