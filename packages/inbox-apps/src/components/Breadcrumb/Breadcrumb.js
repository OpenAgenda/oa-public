import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import cn from 'classnames';
import { LinkContainer } from '../';
import I18nContext from '../../contexts/I18nContext';

@withRouter
export default class Breadcrumb extends Component {
  static contextType = I18nContext;

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
    const { breadParts, disableFirstPartLink, history, agenda } = this.props;
    const { getLabel } = this.context;

    const noParts = !breadParts || !breadParts.length;

    const homePart = disableFirstPartLink || noParts
      ? getLabel( 'inbox' )
      : (
        <LinkContainer to="/" agenda={agenda}>
          {path => (
            <a
              role="button"
              onClick={() => history.push( { pathname: path, state: { showListAllowed: true } } )}
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
