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
        contacts: 'jony@nointernet.com, 0981189550, fdqfdq',
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

      <InputField
        name="name"
        lang="fr"
        value={ this.state.values.name }
        onChange={ this.onChange }
        validator={validators.text( { min: 3, max: 20 } )}
        getLabel={getLabel} />

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

      <MultilingualInputField
        name='description'
        value={{fr: 'Ouaich', en: 'Yep', es: 'Si'}}
        languages={[ 'fr', 'en', 'es' ]}
        onChange={function( name, value ){}}
        type="text" />

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
        validators={[
          validators.email(),
          validators.phone()
        ]}
        onChange={this.onChange} />

      <div className="separator"></div>

    </div>

  } 

} )