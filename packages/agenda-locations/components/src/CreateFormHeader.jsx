import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import utils from '@openagenda/utils';
import createLabels from '@openagenda/labels/agenda-locations/create';
import formLabels from '@openagenda/labels/agenda-locations/form';
import makeLabelGetter from '@openagenda/labels';

var getLabel = makeLabelGetter( utils.extend( {}, formLabels, createLabels ) );

module.exports = createReactClass( {

  propTypes: {
    lang: PropTypes.string,
    actions: PropTypes.object,
    settings: PropTypes.object
  },

  getLabel( name ) {

    let str;

    if ( this.props.settings && this.props.settings.labels && this.props.settings.labels.create && this.props.settings.labels.create[ name ] ) {

      str = this.props.settings.labels.create[ name ][ this.props.lang ];

    } else {

      str = getLabel( name, this.props.lang );

    }

    return str;

  },

  render() {

    return <div className="head">
      { this.props.actions && this.props.actions.closeForm ? <a className="btn btn-default" onClick={ this.props.actions.closeForm }>
        <i className="fa fa-angle-left margin-right-sm"></i>
        <span>{ this.getLabel( 'back' ) }</span>
      </a> : null }
      <h2>{ this.getLabel( 'title', this.props.lang ) }</h2>
      <span className="info">{ this.getLabel( 'info', this.props.lang ) }</span>
    </div>

  }

} );
