import React from 'react';

const AccordionContent = ({ content }) => (
  <div className="accordion-content">
    <div className="wrapper">
      <div className="wrapper-item">{content}</div>
    </div>
  </div>
);

export default AccordionContent;
