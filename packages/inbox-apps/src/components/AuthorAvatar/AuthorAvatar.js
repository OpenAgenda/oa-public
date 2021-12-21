import React, { Component, Fragment } from 'react';
import cn from 'classnames';
import { Image } from '@openagenda/react-shared';

export default class AuthorAvatar extends Component {
  render() {
    const { author: { inboxUser, inbox }, inline } = this.props;

    const imgClasses = cn( 'img-circle', 'author-avatar', {
      'author-avatar-inline': inline,
      'media-object': !inline
    } );

    if ( inboxUser ) {
      return <Fragment>
        <Image
          src={inboxUser.avatar}
          fallbackSrc={__DEVELOPMENT__ ? inboxUser.avatar.replace( 'cibuldev', 'cibul' ) : null}
          className={imgClasses}
          title={inboxUser.name}
        />

        {!inline && inbox && inbox.avatar && inbox.type !== 'user'
          ? <Image
            src={inbox.avatar}
            fallbackSrc={__DEVELOPMENT__ ? inbox.avatar.replace( 'cibuldev', 'cibul' ) : null}
            className={cn( imgClasses, 'belongs' )}
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
        title={inbox.name}
      />
    );
  }
}
