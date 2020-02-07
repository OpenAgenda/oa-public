import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { compose, mapProps, componentFromProp } from 'recompose';
import { Link as RouterLink } from 'react-router-dom';
import removeTrailingSlash from '../../utils/removeTrailingSlash';

const Link = compose(
  connect( state => ({
    prefix: state.settings.prefix
  }) ),
  mapProps( props => ({
    ..._.omit( props, 'prefix', 'external', 'agenda', props.external ? 'to' : undefined ),
    [ props.external ? 'href' : 'to' ]: (props.external
      ? ''
      : removeTrailingSlash( props.prefix.replace(':slug', props.agenda && props.agenda.slug) )) + props.to,
    component: props.external ? 'a' : RouterLink,
    dispatch: undefined
  }) )
)( componentFromProp( 'component' ) );

export default Link;
