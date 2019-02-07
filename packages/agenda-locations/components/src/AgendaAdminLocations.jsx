import _ from 'lodash';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import React from 'react';
import xhr from 'xhr';

import countries from '@openagenda/countries';
import get from '@openagenda/utils/get';
import labels from '@openagenda/labels/agenda-locations/list';
import Modal from '@openagenda/react-components/build/Modal';
import MoreInfo from '@openagenda/react-components/build/MoreInfo';
import SearchField from '@openagenda/react-form-components/build/SearchField';
import utils from '@openagenda/utils';

import actions from './actions';
import CreateForm from './CreateForm';
import Filters from './Filters';
import List from './List/List';
import LocationItem from './LocationItem';
import MergeForm from './MergeForm';
import UpdateForm from './UpdateForm';

var loaded = {};

module.exports = createReactClass( {

  propTypes: {

    // general agenda info ( title, slug, )
    agenda: PropTypes.object,

    // optional settings of agenda ( such as tags requirements )
    settings: PropTypes.object,

    // server endpoints
    res: PropTypes.object

  },

  getDefaultProps() {

    return {
      enableGeocode: true,
      settings: {}
    }

  },

  getInitialState() {

    return {

      // merge mode enabled or not.
      // if enabled, shows selection checkboxes on list
      // and merge menu on top
      merge: false,
      loading: false,
      form: false,
      query: {},
      locations: [],
      page: 1,
      total: null,
      modal: false

    }

  },

  componentWillMount() {

    this.actions = actions( {
      getState: () => this.state,
      setState: newState => this.setState( newState ),
    } );

  },

  onSearchChange( field, newSearchValue ) {

    if ( arguments.length == 1 ) {

      newSearchValue = field;

      field = 'search';

    }

    this.actions.queryChange( actions.updateSearchQuery( this.actions.getQuery(), field, newSearchValue ) );

  },


  getCountryLabel( code ) {

    if ( loaded[ code ] === undefined ) {

      loaded[ code ] = countries.getLabel( code );

    }

    return loaded[ code ] !== null ? loaded[ code ][ this.props.lang ] : null;

  },

  getLabel( name, values ) {

    const label = labels[ name ];

    let str = _.get( label, this.props.lang, label[ _.first( _.keys( label ) ) ] );

    let k;

    if ( values ) {

      for ( k in values ) {

        str = str.replace( '%' + k + '%', values[ k ] );

      }

    }

    return str;

  },

  renderItem( item, itemActions, itemIndex ) {

    return <LocationItem
      merge={ this.state.merge }
      key={ item.uid }
      location={ item }
      seeEventsRes={ this.props.res.seeEvents.replace( ':agendaSlug', this.props.agenda.slug ) }
      onSelect={ this.state.merge ? this.actions.toggleMergeItem.bind( null, item ) : this.actions.editLocation.bind( null, item, itemIndex ) }
      onEdit={ this.actions.editLocation.bind( null, item, itemIndex ) }
      onRemove={ this.confirmRemove.bind( null, item, itemIndex ) }
      getLabel={ this.getLabel }
      getCountryLabel={ this.getCountryLabel } />

  },

  confirmRemove( location, index ) {

    get( this.props.res.get.replace( ':locationUid', location.uid ), { detailed: 1 }, ( err, location ) => {

      if ( err ) return console.error( err );

      this.actions.displayRemoveConfirmModal( location );

    } );

  },

  onRemoveLocation( location, index ) {

    xhr( {
      uri: this.props.res.remove,
      method: 'post',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify( { uid: location.uid } )
    }, ( err, result ) => {

      if ( err || result.statusCode !== 200 ) {

        log( 'error', err || result.statusCode );

      } else {

        if ( JSON.parse( result.body ).removed ) {

          this.actions.removedLocation( index );

        }

      }

    } );

  },

  launchMerge() {

    if ( !this.state.merge || !this.state.merge.locationUids.length ) return;

    get( this.props.res.index, {
      uids: this.state.merge.locationUids
    }, ( err, result ) => {

      if ( err ) {

        log( 'error', err );

        return;

      }

      this.actions.launchMerge( result.items );

    } );

  },

  renderHead() {

    return <div className="head">
      { Object.keys( this.actions.getQuery() ).length ? <Filters
        locations={this.state.locations}
        query={this.actions.getQuery()}
        getLabel={this.getLabel}
        onQueryChange={this.actions.queryChange} /> : null }
      { this.state.total ? <p>{this.getLabel( 'total', { count: this.state.total } )}</p> : null }
      { this.state.total === 0 ? <p>{this.getLabel( 'totalzero' ) }</p> : null }
    </div>

  },

  renderRemoveLocationModal() {

    let eventCount = this.state.modal.data.location.eventCount,

      seeEventsLink = this.props.res.seeEvents
        .replace( ':agendaSlug', this.props.agenda.slug )
        .replace( ':locationUid', this.state.modal.data.location.uid ),

      isRemoved = this.state.modal.data.isRemoved,

      modalStates = isRemoved ? 'removed' : ( eventCount ? 'withEvents' : 'noEvents' );

    return <Modal title={this.getLabel( 'removeTitle' )} onClose={this.actions.closeModal}>
      {(() => {
        switch ( modalStates ) {

          case 'removed':

            return <div>
              <p className="text-center">{this.getLabel( 'removeComplete' )}</p>
              <div className="text-center">
                <a className="btn btn-primary" onClick={this.actions.closeModal}>{this.getLabel( 'closeModal' )}</a>
              </div>
            </div>

          case 'noEvents':

            return <div>
              <p className="text-center">{this.getLabel( 'confirmRemoveMessage' )}</p>
              <div className="text-center">
                <a
                  onClick={this.onRemoveLocation.bind( null, this.state.modal.data.location, this.state.modal.data.index )}
                  className="btn btn-danger">{this.getLabel( 'confirmRemove' )}</a>
              </div>
            </div>

          case 'withEvents':

            return <div>
              <p className="text-center">{this.getLabel( 'cannotRemove', { '%eventCount%': eventCount } )}</p>
              <div className="text-center">
                <a className="btn btn-primary" href={seeEventsLink}>{this.getLabel( 'seeEvents' )}</a>
              </div>
            </div>

        }
      })()}

    </Modal>

  },

  renderMergeMenu() {

    return <div className="merge-menu">

      <p>
        {this.getLabel( 'mergedescription' )}
        <button
          onClick={this.launchMerge}
          className="btn btn-primary margin-left-sm">{this.getLabel( 'launchmerge' )}</button>
      </p>

      { this.state.merge.locationUids.length
        ? <span className="info">
          {this.getLabel( 'mergeselection', { count: this.state.merge.locationUids.length } ) }
          <a
            onClick={this.onSearchChange.bind( null, 'uids', this.state.merge.locationUids ) }>{this.getLabel( 'seemergelist' )}</a>
        </span>
        : <span className="info">
          {this.getLabel( 'mergenoselection' )}
        </span>
      }

    </div>

  },

  renderMergeAction() {

    if ( this.state.merge ) {

      return <button className="btn btn-danger" onClick={this.actions.toggleMerge.bind( null, false )}>{this.getLabel( 'cancelmerge' )}</button>

    } else {

      return <button className="btn btn-default" onClick={this.actions.toggleMerge.bind( null, true )}>{this.getLabel( 'merge' )}</button>

    }

  },

  renderCsvAction() {

    if ( this.props.res.csv ) {

      return <a href={this.props.res.csv} className="btn btn-default margin-left-sm">
        <span>csv</span>
        <i className="fa fa-download margin-left-xs"></i>
      </a>

    }

    return null;

  },

  getMode() {

    if ( !this.state.form ) return 'list';

    if ( this.state.form.alternatives && this.state.merge ) return 'merge';

    if ( this.state.form.location ) return 'update';

    return 'create';

  },

  render() {

    switch ( this.getMode() ) {

      case 'merge' :
        return <div className="agenda-admin-locations">
          <MergeForm {...this.props} actions={this.actions} />
        </div>

      case 'create' :
        return <div className="agenda-admin-locations">
          <CreateForm {...this.props} actions={this.actions} />
        </div>

      case 'update' :
        return <div className="agenda-admin-locations">
          <UpdateForm {...this.props} actions={this.actions} />
        </div>

    }

    return <div className="agenda-admin-locations">
      <div>
        <div className="row list-actions">
          <div className="col col-sm-12">
            <div className="form-inline">
              <div className="form-group">
                <button
                  className="btn btn-primary"
                  onClick={this.actions.newLocation.bind( null )}>{this.getLabel( 'create' )}</button>
              </div>
              <div className="form-group">
                {this.renderMergeAction()}
                {this.renderCsvAction()}
              </div>
            </div>
          </div>
        </div>
        <div className="row list-filters">
          <div className="col col-sm-12">

            <div className="form-inline">

              <div className="form-group">

                <SearchField
                  value={ this.actions.getQuery().search }
                  label={this.getLabel( 'search' )}
                  placeholder={this.getLabel( 'search' )}
                  onChange={this.onSearchChange} />

              </div>

              <div className="checkbox">
                <label>
                  <input
                    type="checkbox"
                    onChange={this.onSearchChange.bind( null, 'state', parseInt( this.actions.getQuery().state )===0 ? undefined : 0 )}
                    checked={ parseInt( this.actions.getQuery().state )===0 } /> {this.getLabel( 'toverify' )}
                </label>
                <MoreInfo
                  className="margin-left-sm"
                  id="checkbox-help"
                  content={this.getLabel( 'verifiedInfo' )}
                  placement="top"
                />
              </div>

            </div>

          </div>
        </div>
        <div className="row list">
          <div className="col col-sm-12">
            { this.state.merge ? this.renderMergeMenu() : null }
            <List
              res={this.props.res.index}
              query={this.actions.getQuery()}
              renderItem={this.renderItem}
              renderHead={this.renderHead}
              items={this.state.locations}
              page={this.state.page}
              total={this.state.total}
              onItemsUpdate={this.actions.updateLocationList} />
          </div>
        </div>
        { this.state.modal ? (() => {
          switch ( this.state.modal.type ) {

            case 'removeLocation':
              return this.renderRemoveLocationModal();

          }
        })() : null }
      </div>
    </div>


  }

} );

function log() {

  console.log.apply( console, arguments );

}
