"use strict";

require( '../../components/build/verifiedLocationsCounter' );

var React = require( 'react' ),

ReactDom = require( 'react-dom' ),

createReactClass = require( 'create-react-class' ),

AdminApp = require( '../../components/build/AgendaAdminLocations' ),

SelectorApp = require( '../../components/build/LocationSelector' ),

TermApp = require( '../../components/build/TermSelector' ),

TermPickerApp = require( '../../components/build/TermSelectorPicker' ),

agendaTestSettings = require( '../fixtures/agendaTestSettings.js' ),

Wrapper;

window.addEventListener( 'load', function() {

  ReactDom.render( <Wrapper />, document.getElementsByClassName( 'js_locations_canvas' )[ 0 ] );

} );

Wrapper = createReactClass( {

  getInitialState: function() {

    return {
      display: 'admin', // suggestion, admin, selector
      location: undefined,
      initSelectorMode: 'create',
      mode: 'show',
      term: '',
      pickedTerm: {
        region: 'Champagne-Ardenne',
        department: 'Aube'
      },
      allowCreate: true
    }

  },

  getDefaultProps: function() {

    return {
      res: { 
        index: '/', 
        geocode: '/geocode', 
        reverseGeocode: '/geocode/reverse',
        insee: '/insee',
        get: '/:locationUid',
        set: '/',
        getStakeholder: '/stakeholders/:stakeholderId',
        remove: '/remove',
        merge: '/merge',
        csv: '#csv',
        removeSuggestion: '/:locationUid/suggestion/remove',
        image: {
          upload: '/:locationUid/image',
          remove: '/:locationUid/image/remove',
          newUpload: '/image',
          newRemove: '/image/remove'
        },
        seeEvents: '/:agendaSlug/admin?locationUid=:locationUid'
      }
    }

  },

  onChangeTerm: function( t ) {

    this.setState( { term: t } );

  },

  onChangePickedTerm: function( t ) {

    this.setState( {
      pickedTerm: t
    } );

  },

  tabChange: function( newDisplay ) {

    this.setState( {
      display: newDisplay
    } );

  },

  onLocationChange: function( l, newMode ) {

    this.setState( {
      location: l,
      mode: newMode
    } );

  },

  onChangeLocationMode: function( newMode, initLocation ) {

    this.setState( {
      mode: newMode,
      location: initLocation
    } );

  },

  renderSelector: function() {

    return <SelectorApp
      settings={agendaTestSettings}
      location={this.state.location}
      requestChangeMode={this.onRequestChangeMode}
      mode={this.state.mode}
      lang="fr"
      allowCreate={this.state.allowCreate}
      res={this.props.res}
      onChange={this.onLocationChange}
      onChangeMode={this.onChangeLocationMode}
      disableChange={false} />

  },

  renderTermSelector: function() {

    return <div>

      <TermApp
        lang="fr"
        field="region,country"
        res="/terms"
        value={this.state.term}
        onChange={this.onChangeTerm} />
      
      <div className="separator" style={{marginTop: '1em', marginBottom: '1em'}}></div>

      <TermPickerApp
        lang="fr"
        fields={{
          region: 'region,country',
          department: 'department,region',
          city: 'city,region'
        }}
        res="/terms"
        value={this.state.pickedTerm}
        labels={{
          region: { fr: 'région', en: 'region' },
          department: { fr: 'département', en: 'department' },
          city: { fr: 'ville', en: 'city' }
        }}
        onChange={this.onChangePickedTerm}
      />

    </div>

  },

  renderAdmin: function() {

    return <div className="top-margined col-sm-8 col-sm-offset-2 wsq content">
      <AdminApp
        agenda={{
          slug: 'theagendaslug'
        }}
        detailedInfo={true}
        settings= {agendaTestSettings}
        lang="fr"
        res={this.props.res} />
      </div>

  },

  render: function() {

    var self = this;

    return <div style={{marginTop:'2em'}}>
      <ul className="nav nav-pills" style={{marginBottom:'2em'}}>
        <li key="a" role="presentation" onClick={this.tabChange.bind( null, 'admin' )} className={this.state.display=='admin'?'active':''}>
          <a>Admin Menu</a>
        </li>
        <li key="s" role="presentation" onClick={this.tabChange.bind( null, 'selector' )} className={this.state.display=='selector'?'active':''}>
          <a>Selector</a>
        </li>
        <li key="t" role="presentation" onClick={this.tabChange.bind( null, 'term' )} className={this.state.display=='term'?'active':''}>
          <a>Term Selector</a>
        </li>
      </ul>

      {function() {

        switch ( self.state.display ) {

          case 'admin': return self.renderAdmin();

          case 'selector': return self.renderSelector();

          case 'term': return self.renderTermSelector();

        }

      }()}

    </div>

  }

} );
