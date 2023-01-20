import { useState, useCallback } from 'react';
import makeLabelGetter from '@openagenda/labels/makeLabelGetter';
import { Modal } from '@openagenda/react-shared';

import ChooseFieldType from './ChooseFieldType';
import FieldForm from './FieldForm';
import labels from './lib/labels';

const getLabel = makeLabelGetter(labels);

const Canvas = ({ children, modal, onClose, title }) => (modal ? (
  <Modal
    classNames={{ overlay: 'popup-overlay big' }}
    onClose={() => onClose()}
    title={title}
  >
    {children}
  </Modal>
) : (
  <>
    <h3 className="margin-v-sm">{title}</h3>
    {children}
  </>
));

const isDuplicateLabel = (schema, field) => {
  if (field.type === 'section') {
    return false;
  }
  const fieldLabels = typeof field.label === 'string' ? [field.label] : Object.values(field.label);
  return !!schema.fields.reduce(
    (existingLabels, schemaField) => existingLabels.concat(typeof schemaField.label === 'string' ? [schemaField.label] : Object.values(schemaField.label)),
    [],
  ).filter(label => fieldLabels.includes(label)).length;
};

const ErrorSummary = ({
  errors,
}) => (
  <div className="error-summary boxed margin-top-sm padding-h-sm padding-v-xs">
    {errors.map(e => e.label).join(', ')}
  </div>
);

const DisabledFieldForm = ({ lang }) => (
  <FieldForm
    enable={false}
    initFieldType="text"
    onSubmit={() => {}}
    lang={lang}
    labelLanguages={[]}
    actionComponent={() => null}
  />
);

export default function FieldAdd({
  onAdd: propsOnAdd,
  schema,
  onClose,
  lang,
  modal = true,
  labelLanguages,
}) {
  const [fieldType, setFieldType] = useState(null);
  const [errors, setErrors] = useState([]);

  const onAdd = useCallback(field => {
    // slug is not defined here: it cannot be used as a basis for duplicate detection
    if (isDuplicateLabel(schema, field)) {
      setErrors([{
        label: getLabel('isLabelDuplicateError', lang),
      }]);
      return;
    }
    setErrors([]);
    propsOnAdd(field);
  }, [schema, propsOnAdd, setErrors, lang]);

  return (
    <Canvas
      modal={modal}
      onClose={onClose}
      title={getLabel('addField', lang)}
    >
      <ChooseFieldType
        lang={lang}
        value={fieldType}
        onChange={setFieldType}
        onCancel={onClose}
      />
      {fieldType ? (
        <>
          {errors.length ? <ErrorSummary errors={errors} lang={lang} /> : null}
          <FieldForm
            initFieldType={fieldType}
            onSubmit={onAdd}
            lang={lang}
            labelLanguages={labelLanguages}
            actionComponent={({ onSubmit }) => (
              <>
                {errors.length ? (
                  <div className="margin-bottom-md">
                    <ErrorSummary errors={errors} lang={lang} />
                  </div>
                ) : null}
                <div>
                  <button
                    type="button"
                    className="btn btn-default"
                    onClick={() => onClose()}
                  >
                    {getLabel('cancelFieldEdit', lang)}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary pull-right"
                    onClick={onSubmit}
                  >
                    {getLabel('confirmFieldCreate', lang)}
                  </button>
                </div>
              </>
            )}
          />
        </>
      ) : (
        <DisabledFieldForm lang={lang} />
      )}
    </Canvas>
  );
}
