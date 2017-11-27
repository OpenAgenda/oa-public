import React, { Component } from 'react';

export default class MessageAvatar extends Component {
  render() {
    const { message } = this.props;

    if ( message.inboxUser ) {
      return [
        <img
          src={message.inboxUser.avatar}
          className="media-object img-circle"
          style={{ width: '60px' }}
          key={1}
        />,

        message.inbox && message.inbox.avatar && message.inbox.type !== 'user'
          ? <img
            src={message.inbox.avatar}
            className="media-object img-circle belongs"
            style={{ width: '25px' }}
            key={2}
          />
          : null
      ];
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
