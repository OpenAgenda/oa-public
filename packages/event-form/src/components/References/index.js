"use strict";

import _ from 'lodash';
import ih from 'immutability-helper';
import sa from 'superagent';
import React, { Component } from 'react';
import ClickOutside from 'react-click-outside';

import labels from '@openagenda/labels/event/references';
import flatten from '@openagenda/labels/flatten';

import SearchField from '@openagenda/react-form-components/build/SearchField';
import Spinner from '@openagenda/react-components/build/Spinner';

import EventItem from './EventItem';

export default class References extends Component {

  constructor( props ) {

    super( props );

    this.state = {
      labels: flatten( labels, props.lang ),
      loading: false,
      events: [],
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

  search( query, suggested = false ) {

    this.setState( { search: _.set( this.state.search, 'loading', true ) } );

    this.get( query ).then( events => {

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

  get( query ) {

    return sa.get( `${this.props.field.res}`, query ).then( res => _.get( res, 'body' ) );

  }

  onSearchFocus( input ) {

    if ( ( input || '' ).length > 2 ) return;

    this.search( { sample: this.props.relatedValues }, true );
  }

  onSearchChange( input ) {

    this.search( { search: input } );

  }

  onAddEvent() {

    this.setState( {
      search: ih( this.state.search, { show: { $set: true } } )
    } );

  }

  onSelectEvent( event ) {

    this.setState( {
      search: ih( this.state.search, {
        show: { $set: false },
        events: { $set: []},
        dropdown: { $set: false }
      } ),
      events: this.state.events.concat( event )
    } );

  }

  onRemoveEvent( event ) {

    this.setState( {
      events: ih( this.state.events, { $splice: [ [ this.state.events.map( e => e.uid ).indexOf( event.uid ), 1 ] ] } )
    } );

  }

  onCloseDropdown() {

    this.setState( {
      search: ih( this.state.search, {
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
          className="btn margin-right-sm">{labels.addEventSuggest}</a>
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
        onChange={ () => {} }
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

  render() {
    
    const { labels, search, events } = this.state;

    const { suggest } = this.props.field;

    return <div className="event-references">
      <div className="configure">
        { events.length ? <ul className="list-unstyled references">
          { events.map( e => <li key={'event-reference-' + e.uid}>
            <EventItem event={e} onRemove={this.onRemoveEvent.bind(this)} />
          </li> ) }
        </ul> : <ul className="list-unstyled references">
          <li><span className="empty">{labels.emptyReferences}</span></li>
        </ul> }
        { search.show ? this.renderSearch() : this.renderActions() }
      </div>
    </div>

  }

}
