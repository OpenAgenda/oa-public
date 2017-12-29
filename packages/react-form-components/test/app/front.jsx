"use strict";

window.onload = function () {

  ReactDom.render( <Wrapper />, document.getElementsByClassName( 'js_canvas' )[ 0 ] );

}

var React = require( 'react' ),

  createReactClass = require( 'create-react-class' ),

  getLabel = require( '../../lib/makeLabelGetter' )( require( '../../labels' ) ),

  ReactDom = require( 'react-dom' ),

  LanguageBar = require( '../../components/LanguageBar.jsx' ),

  MultilingualInputField = require( '../../components/MultilingualInputField.jsx' ),

  GroupTagSelector = require( '../../components/GroupTagSelector.jsx' ),

  MarkdownComponent = require( '../../components/MarkdownComponent.jsx' ),

  HTMLComponent = require( '../../components/HTMLComponent.jsx' ),

  Translation = require( '../../components/Translation' ),

  onTranslationCheck = require( '../../lib/onTranslationCheck' ),

// needs to be babelified first
  SearchField = require( '../../build/SearchField' ),

  InputField = require( '../../components/InputField.jsx' ),

  MultiInputField = require( '../../components/MultiInputField.jsx' ),

  Spinner = require( '../../components/Spinner.jsx' ),

  update = require( 'immutability-helper' ),

  validators = require( '../../validators' ),

  Wrapper = createReactClass( {

    getInitialState: function () {

      return {
        markdown: '',
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
        translation: {
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
        }
      }

    },

    getTestGroupSet: function () {

      return {
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
      };

    },

    removeFirstMarkdownComponent: function() {

      this.setState( update( this.state, { multiMd: { $splice: [[ 0, 1 ]] } } ) );

    },

    addMarkdownComponent: function() {

      this.setState( update( this.state, { multiMd: { $push: [ {
        lang: 'it',
        label: 'one more time',
        placeholder: 'nippingsnout',
        markdown: 'Nippinipppiniinp pinnipinini'
      } ] } } ) );

    },

    onChange: function( name, value ) {

      var change = { values: {} };

      change.values[ name ] = { $set: value };

      this.setState( update( this.state, change ) );

    },

    onMultiMarkdownChange: function( i, value ) {

      let updated = { multiMd: {} };

      updated.multiMd[ i ] = {};

      updated.multiMd[ i ].markdown = { $set: value };

      this.setState( update( this.state, updated ) );

    },

    onMarkdownChange: function ( value ) {

      this.setState( { markdown: value } );

    },

    translationSourceChange: function ( newSource ) {

      this.setState( {
        translation: update( this.state.translation, {
          source: { $set: newSource }
        } )
      } );

    },

    translationCheck: function ( check, sourceCode, langCode ) {

      this.setState( {
        translation: onTranslationCheck( this.state.translation, check, langCode )
      } );

    },

    render: function () {

      return <div>

        <Translation
          source={ this.state.translation.source }
          sets={ this.state.translation.sets }
          sourceChange={this.translationSourceChange}
          labels={{
            translationTitle: 'Traduction',
            sourceLanguage: 'Langue source',
            targetLanguages: 'Traduction automatique',
            translationHelp: 'En savoir plus',
            sourceChange: 'Changer'
          }}
          check={ this.translationCheck.bind( null, true ) }
          uncheck={ this.translationCheck.bind( null, false ) }
        />

        <h2>Wysiwyg component</h2>

        <button onClick={this.removeFirstMarkdownComponent}>supprimer le premier</button>

        { this.state.multiMd.map( ( c, i ) => <MarkdownComponent
          key={i}
          lang={c.lang}
          label={c.label}
          placeholder={c.placeholder}
          onChange={this.onMultiMarkdownChange.bind( null, i )}
          value={c.markdown}
        /> ) }

        <button onClick={this.addMarkdownComponent}>ajouter</button>

        <p>{this.state.markdown}</p>

        <h2>HTML component</h2>

        <HTMLComponent
          lang="fr"
          label="Ce champ enregistre du html"
          placeholder="Cet HTML sera sauvegardé en base"
          onChange={this.onChange.bind( null, 'html')}
          value={this.state.values.html}
        />

        <div className="separator"></div>

        <h2>Search field</h2>

        <SearchField
          name="search"
          value={ this.state.values.search }
          label="a hidden label"
          placeholder="do your search"
          threshold={ 2 }
          onChange={ this.onChange }
          loading={ true }
        />

        <div className="separator"></div>

        <SearchField
          name="search"
          value={ this.state.values.search }
          label="a hidden label"
          placeholder="do your search"
          threshold={ 5 }
          onChange={ this.onChange }
          loading={ false }
        />

        <div className="separator"></div>

        <h2>Input field</h2>

        <InputField
          name="name"
          lang="fr"
          value={ this.state.values.name }
          onChange={ this.onChange }
          validator={validators.text( { min: 3, max: 20 } )}
          getLabel={getLabel}
          autoFocus={true}
        />

        <InputField
          name="email"
          value={ this.state.values.email }
          onChange={ this.onChange }
          validator={validators.email( { field: 'email' } ) }
          getLabel={getLabel}
        />

        <p>input field with custom placeholder & info</p>

        <InputField
          name="phone"
          value={ this.state.values.phone }
          onChange={ this.onChange }
          getLabel={ getLabel }
          placeholder="phonePlaceholder"
          info="phoneInfo"
          validator={validators.phone( { field: 'phone' } ) }
        />

        <div className="separator"></div>

        <p>disabled input field</p>

        <InputField
          name="email"
          value={ this.state.values.email }
          onChange={ this.onChange }
          validator={validators.email( { field: 'email' } ) }
          getLabel={getLabel}
          enabled={false}
        />

        <div className="separator"></div>

        <h3>Language bars</h3>

        <LanguageBar
          enabled={[ 'fr' ]}
          languages={[ 'fr', 'en', 'es' ]}
          onChange={function () {
            console.log( arguments );
          }}
        />


        <p>not editable</p>

        <LanguageBar
          languages={[ 'fr', 'en', 'es' ]}
          onChange={function () {
            console.log( arguments );
          }}
          editable={false}
        />

        <div className="separator"></div>

        <h2>Multilingual input field</h2>

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

        <div className="separator"></div>

        <p>Grouped tags selector</p>

        <GroupTagSelector
          name='tags'
          lang='fr'
          value={this.state.values.tags}
          onChange={this.onChange}
          set={this.getTestGroupSet()}
        />

        <div className="separator"></div>

        <p>Grouped tags selector with disabled tags</p>

        <GroupTagSelector
          name='tags'
          lang='fr'
          value={this.state.values.tags}
          onChange={this.onChange}
          set={this.getTestGroupSet()}
          disabledTagIds={[ 1, 3, 4, 5, 6 ]}
        />

        <div className="separator"></div>

        <MultiInputField
          name="contacts"
          lang='fr'
          info='Faut taper des truc'
          value={this.state.values.contacts}
          validator={ validators.list( [
            validators.email(),
            validators.phone(),
            validators.link()
          ] ) }
          onChange={this.onChange}
        />

        <p>the same, disabled</p>
        <MultiInputField
          enabled={false}
          name="contacts"
          lang='fr'
          info='Faut taper des truc'
          value={this.state.values.contacts}
          validator={ validators.list( [
            validators.email(),
            validators.phone(),
            validators.link()
          ] ) }
          onChange={this.onChange}
        />

        <div className="separator"></div>

        <p>Use this spinner to show that stuff is loading. Spreads to the first parent in position: relative.</p>

        <div style={{ height: '300px', position: 'relative', border: '1px solid #ccc' }}>

          <Spinner />

        </div>

      </div>;

    }

  } )
