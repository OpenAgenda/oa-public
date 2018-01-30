"use strict";

import { connect } from 'react-redux';
import EditorComponent from '../Component';
import actions from '../actions';
import labels from '@openagenda/labels/event/references';
import makeLabelsGetter from '@openagenda/labels';

export default connect(

  // map state to props
  ( state, props ) => ( {

    search: state.search,
    events: state.events,
    loading: state.loading,
    info: state.info,
    getLabel: makeLabelsGetter( labels, props.lang || 'fr' ),
    suggest: !!state.sample,
    loadingSuggestions: state.loadingSuggestions

  } ),

  // map dispatch to props
  ( dispatch, props ) => ( {

    onShow: () => dispatch( actions.searchShow() ),

    onSearch: ( name, value ) => dispatch( actions.search( value ) ),

    onSearchFocus: input => {

      return input.length ? () => {}: dispatch( actions.suggest() )

    },

    //onSearchFocus: ( name, value ) => dispatch( actions.suggest( value ) ),

    onEventRemove: eventUid => dispatch( actions.eventRemove( eventUid ) ),

    onEventAdd: event => dispatch( actions.eventAdd( event ) ),

    onSuggestionsAdd: () => dispatch( actions.suggestionsAdd() )

  } )

)( EditorComponent );