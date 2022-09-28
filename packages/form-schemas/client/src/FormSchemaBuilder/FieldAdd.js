import React, { useState } from 'react';
import makeLabelGetter from '@openagenda/labels/makeLabelGetter';
import { Modal } from '@openagenda/react-shared';

import ChooseFieldType from './ChooseFieldType';
import FieldForm from './FieldForm';
import labels from './lib/labels';

const getLabel = makeLabelGetter(labels);

const Canvas = ({ children, modal, onClose }) => (modal ? (
  <Modal
    classNames={{ overlay: 'popup-overlay big' }}
    onClose={() => onClose()}
  >
    {children}
  </Modal>
) : <>{children}</>);

const DisabledFieldForm = ({ lang }) => (
  <FieldForm
    enable={false}
    initFieldType="text"
    onSubmit={() => {}}
    lang={lang}
    labelLanguages={[]}
    actionComponent={() => (<></>)}
  />
);

export default function FieldAdd({
  onAdd,
  onClose,
  lang,
  modal = true,
  labelLanguages
}) {
  const [fieldType, setFieldType] = useState(null);

  return (
    <Canvas
      modal={modal}
      onClose={onClose}
    >
      <h3 className="margin-v-sm">{getLabel('addField', lang)}</h3>
      <ChooseFieldType
        lang={lang}
        value={fieldType}
        onChange={setFieldType}
        onCancel={onClose}
      />
      {fieldType ? (
        <FieldForm
          initFieldType={fieldType}
          onSubmit={onAdd}
          lang={lang}
          labelLanguages={labelLanguages}
          actionComponent={({ onSubmit }) => (
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
          )}
        />
      ) : (
        <DisabledFieldForm lang={lang} />
      )}
    </Canvas>
  );
}
