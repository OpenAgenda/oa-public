import React from 'react';
import PropTypes from 'prop-types';
import { compose, getContext, defaultProps } from 'recompose';

const Title = ( { Component, tab, getLabel, className } ) => {
  return (
    <Component key="title" className={className}>
      {getLabel( 'inbox' )}
      {tab === 'conversation' && <small className="margin-left-sm">{getLabel( 'conversation' )}</small>}
      {tab === 'createConversation' && <small className="margin-left-sm">{getLabel( 'newConversation' )}</small>}
    </Component>
  );
}

const enhance = compose(
  defaultProps( {
    Component: 'h2'
  } ),
  getContext( {
    getLabel: PropTypes.func
  } )
);

export default enhance( Title );
