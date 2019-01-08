import React from 'react';
import { storiesOf, forceReRender } from '@storybook/react';
import update from 'immutability-helper';
import Translation from '../components/Translation';
import MarkdownComponent from '../components/MarkdownComponent';
import HTMLComponent from '../components/HTMLComponent';
import SearchField from '../components/SearchField';
import InputField from '../components/InputField';
import LanguageBar from '../components/LanguageBar';
import MultilingualInputField from '../components/MultilingualInputField';
import GroupTagSelector from '../components/GroupTagSelector';
import MultiInputField from '../components/MultiInputField';
import Spinner from '../components/Spinner';
import onTranslationCheck from '../lib/onTranslationCheck';
import makeLabelGetter from '../lib/makeLabelGetter';
import labels from '../labels';
import validators from '../validators';
import PageDecorator from './decorators/PageDecorator';

import '@openagenda/bs-templates/compiled/main.css';

const getLabel = makeLabelGetter( labels );

let state = {
  translation: {
    source: 'fr',
    sets: [ {
      source: 'fr',
      target: [ 'de', 'en', 'es', 'it' ],
      checked: [ 'en', 'es' ]
    }, {
      source: 'en',
      target: [ 'de', 'fr', 'es', 'it' ],
      checked: [ 'de', 'fr' ]
    } ]
  },
  multiMd: [ {
    lang: 'fr',
    label: 'eh ouais',
    placeholder: 'gros',
    markdown: 'Le truc pas évident est de pouvoir manipuler plusieurs éditeurs sur une même page.'
  }, {
    lang: 'en',
    label: 'ou non',
    placeholder: 'meh',
    markdown: 'En particulier pour la suppression.'
  } ],
  values: {
    name: 'Poney Vert',
    phone: +3365034302,
    email: 'billy@poneyland.com',
    contacts: [ 'jony@nointernet.com', '0981189550', 'fdqfdq' ],
    link: 'poneyland.com',
    html: null,
    tags: [ {
      id: 1,
      label: 'Musée de France'
    }, {
      id: 4,
      label: 'Edifice religieux'
    } ]
  },
  groupSet: {
    groups: [ {
      name: 'Label',
      info: null,
      tags: [ {
        id: 1,
        label: 'Musée de France'
      }, {
        id: 2,
        label: 'Jardin Remarquable'
      } ]
    }, {
      name: 'Types de lieu',
      info: null,
      tags: [ {
        id: 3,
        label: 'Edifice commémoratif'
      }, {
        id: 4,
        label: 'Edifice religieux'
      }, {
        id: 5,
        label: 'Chateaux, hôtels'
      } ]
    }, {
      required: true,
      name: 'Particularité',
      info: null,
      tags: [ {
        id: 6,
        label: 'Première participation'
      }, {
        id: 7,
        label: 'Ouverture exceptionnelle'
      } ]
    } ]
  }
};

function translationSourceChange( value ) {
  state.translation.source = value;
  forceReRender();
}

function translationCheck( check, sourceCode, langCode ) {
  state.translation = onTranslationCheck( state.translation, check, langCode );
  forceReRender();
}

function removeFirstMarkdownComponent() {
  state = update( state, { multiMd: { $splice: [ [ 0, 1 ] ] } } );
  forceReRender();
}

function addMarkdownComponent() {
  state = update( state, {
    multiMd: {
      $push: [ {
        lang: 'it',
        label: 'one more time',
        placeholder: 'nippingsnout',
        markdown: 'Nippinipppiniinp pinnipinini'
      } ]
    }
  } );
  forceReRender();
}

function onChange( name, value ) {
  const change = { values: {} };

  change.values[ name ] = { $set: value };

  state = update( state, change );
  forceReRender();
}

function onMultiMarkdownChange( i, value ) {
  const updated = { multiMd: {} };

  updated.multiMd[ i ] = {};

  updated.multiMd[ i ].markdown = { $set: value };

  state = update( state, updated );
  forceReRender();
}


storiesOf( 'Translation', module )
  .addDecorator( PageDecorator )
  .add( 'simple', opts => (
    <Translation
      source={state.translation.source}
      sets={state.translation.sets}
      sourceChange={translationSourceChange}
      labels={{
        translationTitle: 'Traduction',
        sourceLanguage: 'Langue source',
        targetLanguages: 'Traduction automatique',
        translationHelp: 'En savoir plus',
        sourceChange: 'Changer',
        info: 'Un texte informatif'
      }}
      check={translationCheck.bind( null, true )}
      uncheck={translationCheck.bind( null, false )}
    />
  ) );

storiesOf( 'Wysiwyg', module )
  .addDecorator( PageDecorator )
  .add( 'markdown', () => (
    <>
      <button onClick={removeFirstMarkdownComponent}>supprimer le premier</button>

      {state.multiMd.map( ( c, i ) => (
        <MarkdownComponent
          key={i}
          lang={c.lang}
          label={c.label}
          placeholder={c.placeholder}
          onChange={onMultiMarkdownChange.bind( null, i )}
          value={c.markdown}
        />
      ) )}

      <button onClick={addMarkdownComponent}>ajouter</button>
    </>
  ) )
  .add( 'html', () => (
    <HTMLComponent
      lang="fr"
      label="Ce champ enregistre du html"
      placeholder="Cet HTML sera sauvegardé en base"
      onChange={onChange.bind( null, 'html' )}
      value={state.values.html}
    />
  ) );

storiesOf( 'Search', module )
  .addDecorator( PageDecorator )
  .add( 'threshold 2 - loading', () => (
    <SearchField
      name="search"
      value={state.values.search}
      label="a hidden label"
      placeholder="do your search"
      threshold={2}
      onChange={onChange}
      loading={true}
    />
  ) )
  .add( 'threshold 5', () => (
    <SearchField
      name="search"
      value={state.values.search}
      label="a hidden label"
      placeholder="do your search"
      threshold={5}
      onChange={onChange}
      loading={false}
    />
  ) );

storiesOf( 'Input', module )
  .addDecorator( PageDecorator )
  .add( 'simple', () => (
    <>
      <InputField
        name="name"
        lang="fr"
        value={state.values.name}
        onChange={onChange}
        validator={validators.text( { min: 3, max: 20 } )}
        getLabel={getLabel}
        autoFocus={true}
      />

      <InputField
        name="email"
        value={state.values.email}
        onChange={onChange}
        validator={validators.email( { field: 'email' } )}
        getLabel={getLabel}
      />
    </>
  ) )
  .add( 'with custom placeholder & info', () => (
    <InputField
      name="phone"
      value={state.values.phone}
      onChange={onChange}
      getLabel={getLabel}
      placeholder="phonePlaceholder"
      info="phoneInfo"
      validator={validators.phone( { field: 'phone' } )}
    />
  ) )
  .add( 'disabled', () => (
    <InputField
      name="email"
      value={state.values.email}
      onChange={onChange}
      validator={validators.email( { field: 'email' } )}
      getLabel={getLabel}
      enabled={false}
    />
  ) );

storiesOf( 'Language bar', module )
  .addDecorator( PageDecorator )
  .add( 'simple', () => (
    <LanguageBar
      enabled={[ 'fr' ]}
      languages={[ 'fr', 'en', 'es' ]}
      onChange={function () {
        console.log( arguments );
      }}
    />
  ) );

storiesOf( 'Multilingual input', module )
  .addDecorator( PageDecorator )
  .add( 'simple', () => (
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
  ) );

storiesOf( 'Group tag selector', module )
  .addDecorator( PageDecorator )
  .add( 'simple', () => (
    <GroupTagSelector
      name='tags'
      lang='fr'
      value={state.values.tags}
      onChange={onChange}
      set={state.groupSet}
    />
  ) )
  .add( 'with disabled tags', () => (
    <GroupTagSelector
      name='tags'
      lang='fr'
      value={state.values.tags}
      onChange={onChange}
      set={state.groupSet}
      disabledTagIds={[ 1, 3, 4, 5, 6 ]}
    />
  ) );

storiesOf( 'Multi input', module )
  .addDecorator( PageDecorator )
  .add( 'simple', () => (
    <MultiInputField
      name="contacts"
      lang='fr'
      info='Faut taper des truc'
      value={state.values.contacts}
      validator={ validators.list( [
        validators.email(),
        validators.phone(),
        validators.link()
      ] ) }
      onChange={onChange}
    />
  ) )
  .add( 'disabled', () => (
    <MultiInputField
      enabled={false}
      name="contacts"
      lang='fr'
      info='Faut taper des truc'
      value={state.values.contacts}
      validator={ validators.list( [
        validators.email(),
        validators.phone(),
        validators.link()
      ] ) }
      onChange={onChange}
    />
  ) );

storiesOf( 'Spinner', module )
  .addDecorator( PageDecorator )
  .add( 'relative', () => (
    <span>
      <p>Use this spinner to show that stuff is loading. Spreads to the first parent in position: relative.</p>

      <div style={{ height: '300px', position: 'relative', border: '1px solid #ccc' }}>
        <Spinner />
      </div>
    </span>
  ) );
