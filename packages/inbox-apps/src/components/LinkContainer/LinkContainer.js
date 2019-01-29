import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { compose, mapProps } from 'recompose';
import removeTrailingSlash from '../../utils/removeTrailingSlash';

const LinkContainer = compose(
  connect( state => ({
    prefix: state.settings.prefix
  }) ),
  mapProps( props => ({
    ..._.omit( props, 'prefix', 'external' ),
    to: (props.external ? '' : removeTrailingSlash( props.prefix )) + props.to
  }) )
)( props => props.children( props.to ) );

export default LinkContainer;
