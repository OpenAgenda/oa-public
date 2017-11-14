"use strict";

import React from 'react'
import PropTypes from 'prop-types'
import createReactClass from 'create-react-class'
import EventItem from '../components/EventItem'
import Spinner from '@openagenda/react-form-components/build/Spinner'
import SearchField from '@openagenda/react-form-components/build/SearchField'
import clickTracker from '../clickTracker'

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

  render() {

    let { onShow, onSearch, onEventRemove, onEventAdd, search, events, loading, getLabel, info } = this.props;

    return <div className="event-references">

      <div className="configure">
        
        <h2>{getLabel( 'editorTitle' )}</h2>

        { info ? <span>{ info }</span> : null }

        <ul className="list-unstyled references">
          { loading ? <Spinner/> : ( 
            events.length ? events.map( e => <li key={e.uid}><EventItem event={e} onRemove={onEventRemove} /></li> )
            : <li><span className="empty">{getLabel( 'emptyReferences' )}</span></li> )
          }
        </ul>

        { search.display ? 

            <div className={ search.events ? 'search dropdown open' : 'search dropdown' }>

              <SearchField
                loading={ search.searching }
                threshold={ 3 }
                value={ search.query }
                name="search"
                label={ getLabel( 'search' ) }
                placeholder={ getLabel( 'search' ) }
                onChange={ onSearch }
              />

              { search.events ? <ul className="dropdown-menu">
              { search.events.length ?
                search.events.map( event => <li key={event.uid}><EventItem event={event} onClick={onEventAdd} /></li> )
              : <li className="empty">
                  <p>{getLabel( 'emptySearch' )}</p>
                </li>
              }
              </ul> : null }

            </div>

        : <a onClick={onShow}>{getLabel( 'addEvent' )}</a> }

      </div>

    </div>

  }

} );

export default Editor;