import { defineMessages } from 'react-intl';

const messages = defineMessages({
  shareEmail: {
    id: 'share-email',
    defaultMessage: 'Send by email',
  },
  emailPlaceholder: {
    id: 'email-placeholder',
    defaultMessage: 'Type in the email you want to send the event to',
  },
  emailSuccess: {
    id: 'email-success',
    defaultMessage:
      'The event was sent to {count, plural, =0 {no email address} one {# email address} other {# email addresses}}.',
  },
  send: {
    id: 'send',
    defaultMessage: 'Send',
  },
});

export function EmailShareMenu(props) {
  const {
    email: emailValue,
    onSubmit,
    onChange,
    intl,
  } = props;

  return (
    <form onSubmit={onSubmit}>
      <h2 className="export-title">{intl.formatMessage(messages.shareEmail)}</h2>
      <div className="form-group">
        <div className="input-group input-textarea">
          <textarea
            className="form-control export-textarea"
            cols="60"
            rows="4"
            id="textarea"
            placeholder={intl.formatMessage(messages.emailPlaceholder)}
            value={emailValue}
            onChange={e => onChange(e.target.value)}
          />
        </div>
      </div>
      <button type="submit" className="btn btn-primary">
        {intl.formatMessage(messages.send)}
      </button>
    </form>
  );
}

export function EmailSentMessage(props) {
  const {
    onClose,
    intl,
    title,
    count,
  } = props;

  return (
    <div className="export-form">
      <button className="export-close" type="button" onClick={onClose}>
        <i className="fa fa-times fa-lg" />
      </button>
      <h2 className="export-title">{title}</h2>
      <p className="confirmation-message">{intl.formatMessage(messages.emailSuccess, { count })}</p>
      <button className="btn btn-primary export-button" type="button" onClick={onClose}>
        OK
      </button>
    </div>
  );
}
