import {
  AccordionItem as ChakraAccordionItem,
  AccordionItemTrigger,
  AccordionItemContent,
} from '@openagenda/uikit/snippets';
import { chakra } from '@openagenda/uikit';
import defaultSize from 'utils/defaultSize';

export default function AccordionItem({ value, title, children }) {
  return (
    <ChakraAccordionItem value={value}>
      <AccordionItemTrigger px="6">
        <chakra.div fontSize={defaultSize} display="flex" alignItems="center">
          {title}
        </chakra.div>
      </AccordionItemTrigger>
      <AccordionItemContent px="6">{children}</AccordionItemContent>
    </ChakraAccordionItem>
  );
}
