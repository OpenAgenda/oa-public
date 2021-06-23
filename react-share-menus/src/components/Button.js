import React from 'react';

const Button = ({ content, children, onClose }) => (
  <button
    type="submit"
    className="btn btn-primary export__btn"
    onClick={onClose}
  >
    {content() || children}
  </button>
);

export default Button;
