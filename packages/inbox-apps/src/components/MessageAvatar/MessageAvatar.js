import React, { Component, Fragment } from 'react';

export default class MessageAvatar extends Component {
  render() {
    const { message } = this.props;

    if ( message.inboxUser ) {
      return <Fragment>
        <img
          src={message.inboxUser.avatar}
          className="media-object img-circle"
          style={{ width: '60px' }}
        />

        {message.inbox && message.inbox.avatar && message.inbox.type !== 'user'
          ? <img
            src={message.inbox.avatar}
            className="media-object img-circle belongs"
            style={{ width: '25px' }}
          />
          : null}
      </Fragment>;
    }

    return (
      <img
        src={message.inbox.avatar}
        className="media-object img-circle"
        style={{ width: '60px' }}
      />
    );
  }
}
