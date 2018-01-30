"use strict";

import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';

import SearchField from '@openagenda/react-form-components/build/SearchField';
import Spinner from '@openagenda/react-components/build/Spinner';

import clickTracker from '../clickTracker';
import EventItem from '../components/EventItem';

const _ = {
  get: require( 'lodash/get' )
}

const Editor = props => ( 

  <EditorComponent {...props} /> 

)

Editor.propTypes = {
  search: PropTypes.object,
  onSearchType: PropTypes.func,
  onShow: PropTypes.func
}

const EditorComponent = createReactClass( {

  componentDidMount() {

    clickTracker.switchOn( 'search' );

  },

  componentDidUpdate() {

    clickTracker.switchOn( 'search' );

  },

  renderDropdownItem( event ) {

    const { onEventAdd } = this.props;

    return <li key={event.uid}>
      <EventItem event={event} onClick={onEventAdd} />
    </li>

  },

  renderDropdown( search ) {

    const { getLabel } = this.props;

    // the drop down renders when

    if ( search.searching ) {

      return <ul className="dropdown-menu">
        <li><div className="padding-all-lg"><Spinner /></div></li>
      </ul>

    }

    if ( search.events !== null && search.events.length ) {

      return <ul className="dropdown-menu">
        <li key="event-section-item">
          <div className="media section-item">
            <strong className="text-muted">{getLabel( 'searchResultTitle' )}</strong>
          </div>
        </li>
        { search.events.map( event => this.renderDropdownItem( event ) ) }
      </ul>

    }

    if ( search.suggestions !== null && search.suggestions.length ) {

      return <ul className="dropdown-menu">
        <li key="suggestion-section-item">
          <div className="media section-item">
            <strong className="text-muted">{getLabel( 'suggestionResultTitle' )}</strong>
          </div>
        </li>
        { search.suggestions.map( event => this.renderDropdownItem( event ) ) }
      </ul>

    }

    return <ul className="dropdown-menu">
      <li className="empty">
        <p>{getLabel( 'emptySearch' )}</p>
      </li>
    </ul>

  },

  render() {

    const { 
      onShow, 
      onSearch, 
      onSearchFocus,
      onEventRemove, 
      onEventAdd, 
      onSuggestionsAdd,
      search, 
      events, 
      loading, 
      getLabel, 
      info,
      suggest,
      loadingSuggestions
    } = this.props;

    const disabledAddSuggestions = loadingSuggestions || ( search.suggestions && !search.suggestions.length );

    const displayDropdown = search.query && search.query.length || ( suggest &&  search.suggestions !== null && search.suggestions.length );

    return <div className="event-references">

      <div className="configure">
        
        <label>{getLabel( 'editorTitle' )}</label>

        { info ? <div className="margin-bottom-sm">{ info }</div> : null }

        <ul className="list-unstyled references">
          { loading ? <Spinner/> : ( 
            events.length ? events.map( e => <li key={e.uid}><EventItem event={e} onRemove={onEventRemove} /></li> )
            : <li><span className="empty">{getLabel( 'emptyReferences' )}</span></li> )
          }
        </ul>

        { search.display ? 

            <div className={ displayDropdown ? 'search dropdown open' : 'search dropdown' }>

              <SearchField
                loading={ search.searching }
                threshold={ 3 }
                value={ search.query }
                name="search"
                label={ getLabel( 'search' ) }
                placeholder={ getLabel( 'search' ) }
                onFocus={ onSearchFocus }
                onChange={ onSearch }
              />

              { displayDropdown ? this.renderDropdown( search ) : null }

            </div>

        : <div>
          <a className="btn btn-primary margin-right-sm" onClick={onShow}>{getLabel( 'addEvent' )}</a>
          { suggest ? <span>
            <span className="margin-h-sm">{getLabel( 'addEventOr' )}</span>
            <a 
              disabled={ disabledAddSuggestions }
              className={ disabledAddSuggestions ? 'btn margin-right-sm text-muted' : 'btn margin-right-sm' }
              onClick={onSuggestionsAdd}>{getLabel( 'addEventSuggest' )}</a>
          </span> : null }
          { loadingSuggestions ? <Spinner mode="inline" /> : null }
        </div> }

      </div>

    </div>

  }

} );

export default Editor;