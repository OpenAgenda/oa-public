const AccordionHead = ({ Trigger, active, head }) => (
  <Trigger>
    <div className="accordion-head">
      <div className="head-item">{head}</div>
      <i
        className={`control ${
          active ? 'fa fa-chevron-up up' : 'fa fa-chevron-down down'
        }`}
      />
    </div>
  </Trigger>
);

export default AccordionHead;
