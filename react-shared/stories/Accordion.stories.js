import { useState, useCallback } from 'react';
import Accordion from '../src/components/Accordion.js';

export default {
  title: 'Accordion',
  component: Accordion,
};

export const Simple = () => {
  const [active, setActive] = useState(false);
  const onToggle = useCallback(
    (value) => setActive((prev) => (value === prev ? false : value)),
    [],
  );

  return (
    <div>
      <Accordion
        onToggle={() => onToggle(0)}
        active={active === 0}
        head={<p>Head</p>}
        content={<p>Content</p>}
      />
    </div>
  );
};
