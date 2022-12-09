import React from 'react';
import AccordionHead from './AccordionHead';
import AccordionContent from './AccordionContent';

const Accordion = ({
  active, onToggle, head, content
}) => (
  <div className="accordion">
    <div className={`accordion-item ${active ? 'active' : ''}`}>
      <AccordionHead
        Trigger={({ children }) => (
          <button type="button" className="button" onClick={onToggle}>
            {children}
          </button>
        )}
        active={active}
        head={head}
      />
      <AccordionContent content={content} />
    </div>
  </div>
);

export default Accordion;
