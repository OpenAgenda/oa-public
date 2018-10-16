"use strict";

import _ from 'lodash';
import ih from 'immutability-helper';

import labels from '@openagenda/labels/event/references';
import flatten from '@openagenda/labels/flatten';

import SearchField from '@openagenda/react-form-components/build/SearchField';

import React, { Component } from 'react';

module.exports = class References extends Component {

  constructor( props ) {

    super( props );

    this.state = {
      labels: flatten( labels, props.lang ),
      search: {
        show: false,
        loading: false,
        query: null
      }
    }

  }

  showSearch() {

    this.setState( {
      search: ih( this.state.search, { show: { $set: true } } )
    } );

  }

  renderActions() {

    const { labels } = this.state;

    const { suggest } = this.props.field;

    return <div>
      <a className="btn btn-primary margin-right-sm" onClick={this.showSearch.bind( this )}>{labels.addEvent}</a>
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

    return <div className="search dropdown">
      <SearchField
        loading={ search.loading }
        threshold={ 3 }
        value={ search.query }
        name="search"
        label={ labels.search }
        placeholder={ labels.search }
        onFocus={ ()=>{} }
        onChange={ () => {} }
      />
    </div>

  }

  render() {

    const { labels, search } = this.state;

    const { suggest } = this.props.field;

    return <div className="event-references">
      <div className="configure">
        <ul className="list-unstyled references">
          <li><span className="empty">{labels.emptyReferences}</span></li>
        </ul>
        { search.show ? this.renderSearch() : this.renderActions() }
      </div>
    </div>

  }

}
