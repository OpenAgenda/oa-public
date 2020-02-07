import React, { Component } from 'react';
import { ConversationItem } from '../';

export default class ConversationList extends Component {
  render() {
    const { conversations, user, agenda } = this.props;

    return conversations.map( conversation =>
      <ConversationItem conversation={conversation} user={user} agenda={agenda} key={conversation.id}/>
    );
  }
}
