import React from 'react';
import PropTypes from 'prop-types';

const Radio = ({
  id, content, name, setChoice
}) => {
  const handleChange = e => {
    setChoice(e.target.value, e.target.id);
  };

  return (
    <div className="radio" onChange={handleChange}>
      <label htmlFor={id}>
        <input className="" type="radio" name={name} id={id} value={content} />
        {content}
      </label>
    </div>
  );
};

export default Radio;

Radio.propTypes = {
  id: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  setChoice: PropTypes.func.isRequired,
};

Radio.defaultProps = {
};
