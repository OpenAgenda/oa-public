import React, { useState } from 'react';
import AccordionItem from '../src/components/AccordionItem';
import Style from './scss/Accordion.scss';

export default {
  title: 'Accordion',
  component: AccordionItem,
  style: Style,
};

export const Simple = () => {
  const faqs = [
    {
      title: 'Titre',
      description: "Titre de l'évenement",
      infos: 'Autres informations',
    },
    {
      title: 'Description courte',
      description: 'Complément du titre',
      infos: 'Autres informations',
    },
  ];

  const Accordion = () => {
    const [clicked, setClicked] = useState('0');
    const handleToggle = index => {
      if (clicked === index) {
        return setClicked('0');
      }
      setClicked(index);
    };

    return (
      <ul className="accordion">
        {faqs.map((faq, index) => (
          <AccordionItem
            onToggle={() => handleToggle(index)}
            active={clicked === index}
            faq={faq}
          />
        ))}
      </ul>
    );
  };
  return <Accordion />;
};
