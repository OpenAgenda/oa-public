import {
  AccordionItem as ChakraAccordionItem,
  AccordionItemTrigger,
  AccordionItemContent,
} from '@openagenda/uikit/snippets';
import { chakra } from '@openagenda/uikit';
import defaultSize from 'utils/defaultSize';

interface AccordionItemProps {
  value: string;
  title: React.ReactNode;
  children: React.ReactNode;
}

export default function AccordionItem({
  value,
  title,
  children,
}: AccordionItemProps) {
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
