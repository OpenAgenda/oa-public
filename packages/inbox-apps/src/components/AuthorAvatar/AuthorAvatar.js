import React, { Component, Fragment } from 'react';

export default class AuthorAvatar extends Component {
  render() {
    const { author: { inboxUser, inbox } } = this.props;

    if ( inboxUser ) {
      return <Fragment>
        <img
          src={inboxUser.avatar}
          className="media-object img-circle"
          style={{ width: '60px' }}
        />

        {inbox && inbox.avatar && inbox.type !== 'user'
          ? <img
            src={inbox.avatar}
            className="media-object img-circle belongs"
            style={{ width: '25px' }}
          />
          : null}
      </Fragment>;
    }

    return (
      <img
        src={inbox.avatar}
        className="media-object img-circle"
        style={{ width: '60px' }}
      />
    );
  }
}
