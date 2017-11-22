import React, { Component } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { compose, mapProps } from 'recompose';
import { Link as RouterLink } from 'react-router';
import removeTrailingSlash from '../../utils/removeTrailingSlash';

const Link = compose(
  connect( state => ({
    prefix: state.settings.prefix
  }) ),
  mapProps( props => ({
    ..._.omit( props, 'prefix' ),
    dispatch: undefined,
    to: removeTrailingSlash( props.prefix ) + props.to
  }) )
)( RouterLink );

export default Link;
