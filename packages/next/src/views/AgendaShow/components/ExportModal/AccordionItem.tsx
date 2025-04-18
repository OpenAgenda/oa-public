import {
  AccordionItem as ChakraAccordionItem,
  AccordionItemTrigger,
  AccordionItemContent,
} from '@openagenda/uikit/snippets';

export default function AccordionItem({ value, title, children }) {
  return (
    <ChakraAccordionItem value={value}>
      <AccordionItemTrigger px="6">{title}</AccordionItemTrigger>
      <AccordionItemContent px="6">{children}</AccordionItemContent>
    </ChakraAccordionItem>
  );
}
