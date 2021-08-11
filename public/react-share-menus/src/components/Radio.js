import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';

const Radio = ({
  id, content, name, span, setChoice
}) => {
  const handleChange = e => {
    setChoice(e.target.value, e.target.id);
  };

  const intl = useIntl();

  const messages = defineMessages({
    jsonDoc1: {
      id: 'json-doc1',
      defaultMessage: 'Detailed documentation on the JSON export is ',
    },
    jsonDoc2: {
      id: 'json-doc2',
      defaultMessage: 'available here',
    },
  });

  return (
    <div className="radio" onChange={handleChange}>
      <label htmlFor={id}>
        <input className="radio__input" type="radio" name={name} id={id} value={content} />
        {content}
      </label>
      {span && (
        <span className="side-note">
          ({intl.formatMessage(messages.jsonDoc1)}
          <a
            href="https://developers.openagenda.com/export-json-dun-agenda/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {intl.formatMessage(messages.jsonDoc2)}
          </a>
          )
        </span>
      )}
    </div>
  );
};

export default Radio;

Radio.propTypes = {
  id: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  span: PropTypes.bool,
  setChoice: PropTypes.func.isRequired,
};

Radio.defaultProps = {
  span: false,
};
