import React from 'react';

const AccordionHead = ({ Trigger, active, head }) => (
  <Trigger>
    <div>
      {head}
      <i
        className={`control ${
          active ? 'fa fa-chevron-up up' : 'fa fa-chevron-down down'
        }`}
      />
    </div>
  </Trigger>
);

export default AccordionHead;
