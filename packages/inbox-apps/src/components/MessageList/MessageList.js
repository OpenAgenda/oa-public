import React, { Component } from 'react';
import { MessageItem } from '../';

export default class MessageList extends Component {
  render() {
    const { messages } = this.props;

    return messages.map( message =>
      <MessageItem message={message} key={message.id} />
    );
  }
}
