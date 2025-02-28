import AccordionHead from './AccordionHead.js';
import AccordionContent from './AccordionContent.js';

const Accordion = ({ active, onToggle, head, content }) => (
  <div className="accordion">
    <div className={`accordion-item ${active ? 'active' : ''}`}>
      <AccordionHead
        Trigger={({ children }) => (
          <button
            type="button"
            className="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {children}
          </button>
        )}
        active={active}
        head={head}
      />
      {active ? <AccordionContent content={content} /> : null}
    </div>
  </div>
);

export default Accordion;
