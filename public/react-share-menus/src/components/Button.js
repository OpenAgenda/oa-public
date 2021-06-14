import React from 'react';

const Button = ({ content, children }) => (
  <button type="submit" className="btn btn-default export__btn">
    {content || children}
  </button>
);

export default Button;
