import React from 'react';
import update from 'immutability-helper';
import MultilingualInputField from '../components/MultilingualInputField';
import PageDecorator from './decorators/PageDecorator';

import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'MultilingualInput',
  decorators: [
    PageDecorator,
  ],
};

export function Simple() {
  return (
    <>
      <MultilingualInputField
        name='description'
        value={{ fr: 'Ouaich', en: 'Yep', es: 'Si' }}
        languages={[ 'fr', 'en', 'es' ]}
        onChange={( name, value ) => {
        }}
        label="display multilingual input components"
        info="Yeepeekayyay"
        type="text"
      />

      <MultilingualInputField
        name='description'
        enabled={[ 'fr', 'es' ]}
        value={{ fr: 'Ouaich', en: 'Yep', es: 'Si' }}
        languages={[ 'fr', 'en', 'es' ]}
        onChange={( name, value ) => {
        }}
        label="the same, disabled"
        info="Yeepeekayyay"
        type="text"
      />

      <MultilingualInputField
        name='description'
        enabled={[]}
        value={{ fr: 'Ouaich', en: 'Yep', es: 'Si' }}
        languages={[ 'fr', 'en', 'es' ]}
        onChange={( name, value ) => {
        }}
        label="the same, entirely disabled"
        info="Yeepeekayyay"
        type="text"
      />

      <MultilingualInputField
        name='description'
        value={{ fr: 'Ouaich', en: 'Yep', es: 'Si' }}
        languages={[ 'fr', 'en', 'es' ]}
        onChange={( name, value ) => {
        }}
        label="display bottom bit for each field of multilingual input"
        info="Yeepeekayyay"
        type="text"
        bottom={lang => <span>a bottom text: {lang}</span>}
      />

      <MultilingualInputField
        name='description'
        value={{}}
        languages={[ 'fr', 'en', 'es' ]}
        onChange={( name, value ) => {
        }}
        label="display empty fields when input is empty"
        info="descriptionInfo"
        placeholder="descriptionPlaceholder"
        type="text"
      />
    </>
  );
}
