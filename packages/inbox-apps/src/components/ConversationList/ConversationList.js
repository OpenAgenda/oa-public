import React, { Component } from 'react';
import { ConversationItem } from '../';

export default class ConversationList extends Component {
  render() {
    const { conversations, user } = this.props;

    return conversations.map( conversation =>
      <ConversationItem conversation={conversation} user={user} key={conversation.id}/>
    );
  }
}
