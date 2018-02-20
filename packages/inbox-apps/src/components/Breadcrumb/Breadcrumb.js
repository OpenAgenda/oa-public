import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { getContext } from 'recompose';
import cn from 'classnames';
import { LinkContainer } from '../';

class Breadcrumb extends Component {
  renderParts() {
    const { breadParts } = this.props;

    if ( !breadParts || !breadParts.length ) {
      return null;
    }

    return breadParts.map( ( breadPart, i ) => (
      <Fragment key={i}>
        <i className="fa fa-angle-right"></i>
        {typeof breadPart.component === 'string' ? (
          <span
            className={cn( breadPart.className )}
            dangerouslySetInnerHTML={{ __html: breadPart.component }}
          />
        ) : (
          <span className={cn( breadPart.className )}>{breadPart.component}</span>
        )}
      </Fragment>
    ) );
  }

  render() {
    const { getLabel, breadParts, disableFirstPartLink, router } = this.props;

    const noParts = !breadParts || !breadParts.length;

    const homePart = disableFirstPartLink || noParts
      ? getLabel( 'inbox' )
      : (
        <LinkContainer to="/">
          {path => (
            <a
              role="button"
              onClick={() => router.push( { pathname: path, state: { showListAllowed: true } } )}
            >
              {getLabel( 'inbox' )}
            </a>
          )}
        </LinkContainer>
      );

    return (
      <h3 className="inbox-breadcrumbs">
        {homePart}
        {this.renderParts()}
      </h3>
    );
  }
}

export default getContext( {
  getLabel: PropTypes.func,
  router: PropTypes.object
} )( Breadcrumb );
