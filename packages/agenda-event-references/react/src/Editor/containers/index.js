"use strict";

import { connect } from 'react-redux'
import EditorComponent from '../Component'
import actions from '../actions'
import labels from 'labels/event/references'
import makeLabelsGetter from 'labels'

export default connect(

  // map state to props
  ( state, props ) => ( {

    search: state.search,
    events: state.events,
    loading: state.loading,
    info: state.info,
    getLabel: makeLabelsGetter( labels, props.lang || 'fr' )

  } ),

  // map dispatch to props
  ( dispatch, props ) => ( {

    onShow: () => dispatch( actions.searchShow() ),

    onSearch: ( name, value ) => dispatch( actions.search( value ) ),

    onEventRemove: eventUid => dispatch( actions.eventRemove( eventUid ) ),

    onEventAdd: event => dispatch( actions.eventAdd( event ) ),

  } )

)( EditorComponent );