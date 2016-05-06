"use strict";

window.onload = function() {

  ReactDom.render( <Wrapper />, document.getElementsByClassName( 'js_canvas' )[ 0 ] );

}

var React = require( 'react' ),

getLabel = require( '../../lib/makeLabelGetter' )( require( '../../labels' ) ),

ReactDom = require( 'react-dom' ),

LanguageBar = require( '../../components/LanguageBar.jsx' ),

MultilingualInputField = require( '../../components/MultilingualInputField.jsx' ),

GroupTagSelector = require( '../../components/GroupTagSelector.jsx' ),

// needs to be babelified first
SearchField = require( '../../build/SearchField' ),

InputField = require( '../../components/InputField.jsx' ),

MultiInputField = require( '../../components/MultiInputField.jsx' ),

update = require( 'react-addons-update' ),

validators = require( '../../validators' ),

Wrapper = React.createClass( {

  getInitialState: function() {

    return {
      values: {
        name: 'Poney Vert',
        phone: +3365034302,
        email: 'billy@poneyland.com',
        contacts: [ 'jony@nointernet.com', '0981189550', 'fdqfdq' ],
        link: 'poneyland.com',
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

  getTestGroupSet: function() {

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
    }

  },

  onChange: function( name, value ) {

    var change = { values: {} };

    change.values[ name ] = { $set: value };

    this.setState( update( this.state, change ) );

  },

  render: function() {

    return <div>

      <div className="separator"></div>

      <SearchField
        name="search"
        value={ this.state.values.search }
        label="a hidden label"
        placeholder="do your search"
        onChange={ this.onChange }
      />

      <div className="separator"></div>

      <InputField
        name="name"
        lang="fr"
        value={ this.state.values.name }
        onChange={ this.onChange }
        validator={validators.text( { min: 3, max: 20 } )}
        getLabel={getLabel}
        autoFocus="true" />

      <InputField
        name="email"
        value={ this.state.values.email }
        onChange={ this.onChange }
        validator={validators.email( { field: 'email' } ) }
        getLabel={getLabel} />

      <div className="separator"></div>

      <LanguageBar
        languages= {[ 'fr', 'en', 'es' ]}
        onChange={function(){}} />

      <div className="separator"></div>
      <h2>Multilingual input field</h2>

      <p>display multilingual input component</p>

      <MultilingualInputField
        name='description'
        value={{fr: 'Ouaich', en: 'Yep', es: 'Si'}}
        languages={[ 'fr', 'en', 'es' ]}
        onChange={function( name, value ){}}
        info="Yeepeekayyay"
        type="text" />

      <div className="separator"></div>

      <p>display bottom bit for each field of multilingual input</p>

      <MultilingualInputField
        name='description'
        value={{fr: 'Ouaich', en: 'Yep', es: 'Si'}}
        languages={[ 'fr', 'en', 'es' ]}
        onChange={function( name, value ){}}
        info="Yeepeekayyay"
        type="text"
        bottom={function( lang ) {

          return <span>{lang}</span>;

        }} />

      <div className="separator"></div>

      <p>display empty fields when input is empty</p>

      <MultilingualInputField
        name='description'
        value={{}}
        languages={[ 'fr', 'en', 'es' ]}
        onChange={function( name, value ){}}
        info="Yeepeekayyay"
        type="text"
        bottom={function( lang ) {

          return <span>{lang}</span>;

        }} />      

      <div className="separator"></div>

      <GroupTagSelector
        name='tags'
        lang='fr'
        value={this.state.values.tags}
        onChange={this.onChange}
        set={this.getTestGroupSet()} />

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
        onChange={this.onChange} />

      <div className="separator"></div>

    </div>

  } 

} )