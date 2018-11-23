import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import qs from 'qs';
import mergeLabels from '@openagenda/labels/agenda-locations/merge';
import makeLabelGetter from '@openagenda/labels';
import LocationForm from './LocationForm';

var getLabel = makeLabelGetter( mergeLabels );

module.exports = createReactClass( {

  propTypes: {
    actions: PropTypes.object,
    res: PropTypes.object
  },

  getSetRes() {

    let formState = this.props.actions.getState().form;

    return this.props.res.merge + '?' + qs.stringify( {
      uids: formState.alternatives.map( s => s.location.uid ).concat( formState.location.uid )
    } );

  },

  onSuccess( location, complete ) {

    if ( !complete ) {

      this.props.actions.updateEditedLocation( location );

    } else {

      this.props.actions.closeMerge();

    }

  },

  renderHeader() {

    return <div className="form-head">
      <a onClick={ this.props.actions.closeForm }>{ getLabel( 'back' ) }</a>
      <h2>{ getLabel( 'title' ) }</h2>
      <span className="info">{ getLabel( 'info' ) }</span>
    </div>

  },

  render() {

    let formState = this.props.actions.getState().form;

    log( 'displaying merge form for %s locations', formState.alternatives.length );

    return <LocationForm
      Header={ this.renderHeader() }
      labels={ mergeLabels }
      showToggler={ true }
      res={ this.props.res }
      getSetRes={ this.getSetRes }
      lang={ this.props.lang }
      onCancel={ this.props.actions.closeForm }
      onSuccess={ this.onSuccess }
      detailedInfo={ this.props.detailedInfo }
      settings={ this.props.settings }
      location={ formState.location }
      hideCurrentAlternative={ true }
      alternatives={ formState.alternatives }
    />

  }

} );

function log() {

  console.log.apply( console, arguments );

}
