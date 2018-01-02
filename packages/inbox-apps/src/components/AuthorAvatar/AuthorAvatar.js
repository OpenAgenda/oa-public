import React, { Component, Fragment } from 'react';
import cn from 'classnames';
import { Image } from '../index';

export default class AuthorAvatar extends Component {
  render() {
    const { author: { inboxUser, inbox }, inline } = this.props;

    const imgClasses = cn( 'img-circle', {
      'media-object': !inline
    } );

    const principalStyle = {
      width: inline ? '24px' : '60px',
      verticalAlign: 'bottom'
    };

    if ( inboxUser ) {
      return <Fragment>
        <Image
          src={inboxUser.avatar}
          fallbackSrc={__DEVELOPMENT__ ? inboxUser.avatar.replace( 'cibuldev', 'cibul' ) : null}
          className={imgClasses}
          style={principalStyle}
          title={inboxUser.name}
        />

        {!inline && inbox && inbox.avatar && inbox.type !== 'user'
          ? <Image
            src={inbox.avatar}
            fallbackSrc={__DEVELOPMENT__ ? inbox.avatar.replace( 'cibuldev', 'cibul' ) : null}
            className={cn( imgClasses, 'belongs' )}
            style={{ width: inline ? '10px' : '25px' }}
            title={inbox.name}
          />
          : null}
      </Fragment>;
    }

    return (
      <Image
        src={inbox.avatar}
        fallbackSrc={__DEVELOPMENT__ ? inbox.avatar.replace( 'cibuldev', 'cibul' ) : null}
        className={imgClasses}
        style={principalStyle}
        title={inbox.name}
      />
    );
  }
}
