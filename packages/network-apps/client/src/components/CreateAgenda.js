import { Modal } from '@openagenda/react-shared';
import FormSchemaComponent from '@openagenda/form-schemas/client/build/index.js';

export default ({ onClose, onCreate }) => (
  <Modal onClose={onClose}>
    <FormSchemaComponent
      schema={{
        fields: [
          {
            field: 'title',
            fieldType: 'text',
            max: 255,
            label: 'Titre',
            optional: false,
          },
          {
            field: 'description',
            fieldType: 'text',
            max: 140,
            label: 'Description',
            optional: false,
          },
          {
            field: 'official',
            fieldType: 'boolean',
            default: false,
            label: 'Officiel',
          },
        ],
      }}
      onSubmit={({ values }) => onCreate(values)}
    />
  </Modal>
);
