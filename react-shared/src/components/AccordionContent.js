import React from 'react';

const AccordionContent = ({ content }) => (
  <div className="accordion_content">
    <div className="wrapper">
      <div className="wrapper_item">{content}</div>
    </div>
  </div>
);

export default AccordionContent;
