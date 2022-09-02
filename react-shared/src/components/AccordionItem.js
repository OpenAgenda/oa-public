import React from 'react';

const AccordionItem = ({ faq, active, onToggle }) => {
  const { title, description, infos } = faq;

  return (
    <li className={`accordion_item ${active ? 'active' : ''}`}>
      <button type="button" className="button" onClick={onToggle}>
        <div>
          <span>{title}</span>
          <i
            className={`control ${
              active ? 'fa fa-chevron-up up' : 'fa fa-chevron-down down'
            }`}
          >
            {' '}
          </i>
        </div>
        <p>{description}</p>
      </button>
      <div className="wrapper">
        <div className="wrapper_item">
          <p>{infos}</p>
        </div>
      </div>
    </li>
  );
};

export default AccordionItem;
