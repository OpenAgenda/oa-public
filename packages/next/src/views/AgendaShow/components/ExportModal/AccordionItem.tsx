import {
  AccordionItem as ChakraAccordionItem,
  AccordionItemTrigger,
  AccordionItemContent,
} from '@openagenda/uikit/snippets';

export default function AccordionItem({ value, title, children }) {
  return (
    <ChakraAccordionItem value={value}>
      <AccordionItemTrigger>{title}</AccordionItemTrigger>
      <AccordionItemContent>{children}</AccordionItemContent>
    </ChakraAccordionItem>
  );
}
