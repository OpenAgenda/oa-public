import { Accordion } from '@openagenda/uikit';
import {
  AccordionItemTrigger,
  AccordionItemContent,
} from '@openagenda/uikit/snippets';

export default function AccordionItem({ value, title, children }) {
  return (
    <Accordion.Item value={value}>
      <AccordionItemTrigger>{title}</AccordionItemTrigger>
      <AccordionItemContent>{children}</AccordionItemContent>
    </Accordion.Item>
  );
}
