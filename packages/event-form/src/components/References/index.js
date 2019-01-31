import _ from 'lodash';
import ih from 'immutability-helper';
import sa from 'superagent';
import React, { Component } from 'react';
import ClickOutside from 'react-click-outside';

import labels from '@openagenda/labels/event/references';
import flatten from '@openagenda/labels/flatten';

import SearchField from '@openagenda/react-form-components/build/SearchField';
import Spinner from '@openagenda/react-components/build/Spinner';
import Modal from '@openagenda/react-components/build/Modal';

import EventItem from './EventItem';

export default class References extends Component {

  constructor( props ) {

    super( props );

    this.state = {
      labels: flatten( labels, props.lang ),
      loading: false,
      events: [],
      modal: null,
      search: {
        show: false,
        loading: false,
        query: null,
        events: [],
        error: false,
        suggested: false // true if suggestions were loaded rather than search results
      },
      suggestions: []
    }

  }

  componentDidMount() {

    if ( !this.props.value || !this.props.value.length ) return;

    this.setState( { loading: true } );

    this.get( { uid: this.props.value } ).then( events => {

      this.setState( {
        loading: false,
        events
      } );

    } );

  }

  search( query, suggested = false ) {

    const update = {
      loading: { $set: true },
      query: { $set: query.search }
    };

    this.setState( {
      search: ih( this.state.search, update )
    } );

    this.get( query, suggested ).then( events => {

      this.setState( {
        search: ih( this.state.search, {
          loading: { $set: false },
          events: { $set: events },
          error: { $set: false },
          dropdown: { $set: true },
          suggested: { $set: suggested }
        } )
      } );

    }, err => {

      this.setState( { search: ih( this.state.search, {
        loading: { $set: false },
        error: { $set: true }
      } ) } );

    } );

  }

  get( query, suggestion = false ) {

    return sa.get( this.props.field.res[ suggestion ? 'suggestions' : 'references' ], ih( query, {
      exclude: { $set: this.state.events.map( e => e.uid ) }
    } ) ).then( res => _.get( res, 'body' ).events )

  }

  onSearchFocus( input ) {

    if ( ( input || '' ).length > 2 ) return;

    if ( !this.hasRelatedValues() ) return;

    this.search( this.getSuggestQuery(), true );

  }

  onSearchChange( name, input ) {

    this.search( { search: input } );

  }

  onAddEvent() {

    this.setState( {
      search: ih( this.state.search, { show: { $set: true } } )
    } );

  }

  hasRelatedValues() {

    return !!_.keys( this.props.relatedValues ).filter( field => !!this.props.relatedValues[ field ] ).length;

  }

  getSuggestQuery() {

    const q = {
      sample: this.assignExtraToKey( this.props.relatedValues, [ 'title', 'description', 'location' ], 'custom' ),
      limit: _.get( this.props, 'field.limit', 3 )
    }

    if ( this.props.field.boost ) {

      q.boost = this.props.field.boost;

    }

    return q;

  }

  assignExtraToKey( values, baseFields, extraKey ) {

    return _.keys( values ).reduce( ( obj, key ) => {

      if ( baseFields.includes( key ) ) {

        obj[ key ] = values[ key ];

      } else {

        obj[ extraKey ] = _.set( obj[ extraKey ] || {}, key, values[ key ] );

      }

      return obj;

    }, {} );

  }

  onSuggestEvents() {

    if ( !this.hasRelatedValues() ) {

      return this.setState( {
        modal: 'nothingToSuggest'
      } );

    }

    this.setState( { loading: true } );

    this.get( this.getSuggestQuery(), true ).then( additionalEvents => {

      if ( !additionalEvents.length && this.state.events.length ) {

        this.setState( {
          loading: false,
          modal: 'noOtherSuggestions'
        } );

      } else if ( !additionalEvents.length ) {

        this.setState( {
          loading: false,
          modal: 'noSuggestions'
        } );

      } else {

        const events = this.state.events.concat( additionalEvents );

        this.setState( { loading: false, events } );

        this.props.onChange( events.map( e => e.uid ) );

      }

    } );

  }

  onCloseModal() {

    this.setState( {
      modal: null
    } );

  }

  onSelectEvent( event ) {

    const events = this.state.events.concat( event );

    this.setState( {
      search: ih( this.state.search, {
        query: { $set: null },
        show: { $set: false },
        events: { $set: []},
        dropdown: { $set: false }
      } ),
      events
    } );

    this.props.onChange( events.map( e => e.uid ) );

  }

  onRemoveEvent( event ) {

    const events = ih( this.state.events, { $splice: [ [ this.state.events.map( e => e.uid ).indexOf( event.uid ), 1 ] ] } );

    this.setState( { events } );

    this.props.onChange( events.map( e => e.uid ) );

  }

  onCloseDropdown() {

    this.setState( {
      search: ih( this.state.search, {
        query: { $set: null },
        show: { $set: false },
        events: { $set: [] },
        loading: { $set: false },
        dropdown: { $set: false }
      } )
    } );

  }

  renderActions() {

    const { labels } = this.state;

    const { suggest } = this.props.field;

    return <div>
      <a className="btn btn-primary margin-right-sm" onClick={this.onAddEvent.bind( this )}>{labels.addEvent}</a>
      { suggest ? <span>
        <span className="margin-h-sm">{labels.addEventOr}</span>
        <a
          disabled={false}
          className="btn margin-right-sm" onClick={this.onSuggestEvents.bind( this )}>{labels.addEventSuggest}</a>
      </span> : null }
    </div>

  }

  renderSearch() {

    const { labels, search } = this.state;

    return <ClickOutside onClickOutside={this.onCloseDropdown.bind( this )} className="search dropdown open">
      <SearchField
        loading={ search.loading }
        threshold={ 3 }
        value={ search.query }
        name="search"
        label={ labels.search }
        placeholder={ labels.search }
        onFocus={this.onSearchFocus.bind( this )}
        onChange={ this.onSearchChange.bind( this ) }
      />
      { search.dropdown ? <div className="dropdown-menu">
        { search.loading ? <ul className="list-unstyled">
          <li><div className="padding-all-lg"><Spinner /></div></li>
        </ul> : null }
        { search.dropdown && !search.loading && !search.events.length ? <ul className="list-unstyled">
          <li className="empty">
            <p>{labels.emptySearch}</p>
          </li>
        </ul> : null }
        { search.dropdown && !search.loading && search.events.length ? <ul className="list-unstyled">
          <li key="suggestion-section-item">
            <div className="media section-item">
              <strong className="text-muted">{labels[ search.suggested ? 'suggestionResultTitle' : 'searchResultTitle' ] }</strong>
            </div>
          </li>
          { search.events.map( event => <li key={'event-item-' + event.uid}>
            <EventItem event={event} onClick={this.onSelectEvent.bind( this )} lang={this.props.lang}/>
          </li> ) }
        </ul> : null }
      </div> : null }
    </ClickOutside>

  }

  renderModal() {

    return <Modal
      title={_.get( this.state.labels, this.state.modal + 'Title' )}
      onClose={this.onCloseModal.bind( this )}
      disableBodyScroll >
      <p>{_.get( this.state.labels, this.state.modal )}</p>
    </Modal>

  }

  render() {

    const { labels, search, events, loading } = this.state;

    const { suggest } = this.props.field;

    return <div className="event-references">
      {this.state.modal ? this.renderModal() : null }
      <div className="configure">
        { loading ? <Spinner/> : null }
        <div className="references">
          { events.length ? <ul className="list-unstyled">
            { events.map( e => <li key={'event-reference-' + e.uid}>
              <EventItem event={e} onRemove={this.onRemoveEvent.bind(this)} />
            </li> ) }
          </ul> : <ul className="list-unstyled">
            <li><span className="empty">{labels.emptyReferences}</span></li>
          </ul> }
        </div>
        { search.show ? this.renderSearch() : this.renderActions() }
      </div>
    </div>

  }

}
