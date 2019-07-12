import React, { Component } from 'react';
import { injectIntl, defineMessages } from 'react-intl';

const messages = defineMessages( {
  openModal: {
    id: 'rtp.recurrencer.openModal',
    defaultMessage: 'Define a recurring timing'
  }
} );

class RecurrencerButton extends Component {
  render() {
    const { intl, classNamePrefix, openRecurrencerModal } = this.props;

    return (
      <span className={`${classNamePrefix}recurrencer-button`} role="button" onClick={openRecurrencerModal}>
        {intl.formatMessage( messages.openModal )}
      </span>
    );
  }
}

export default injectIntl( RecurrencerButton );
