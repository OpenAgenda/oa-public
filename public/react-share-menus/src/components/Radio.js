import React from 'react';
import PropTypes from 'prop-types';

const Radio = ({ id, content, name, span, setChoice }) => {
  const handleChange = e => {
    setChoice(e.target.value, e.target.id);
  };

  return (
    <div className="radio" onChange={handleChange}>
      <label htmlFor={id}>
        <input
          className="radio__input"
          type="radio"
          name={name}
          id={id}
          value={content}
        />
        {content}
      </label>
      {span && (
        <span className="side-note">
          (une documentation détaillée de l'export JSON est
          <a
            href="https://openagenda.zendesk.com/hc/fr/articles/203034982-L-export-JSON-d-un-agenda"
            target="_blank"
            rel="noopener noreferrer"
          >
            {' '}
            disponible ici
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
  span: PropTypes.bool.isRequired,
  setChoice: PropTypes.func.isRequired,
};
