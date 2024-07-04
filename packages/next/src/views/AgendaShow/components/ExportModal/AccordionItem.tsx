import {
  AccordionButton,
  AccordionIcon,
  AccordionItem as ChakraAccordionItem,
  AccordionPanel,
  Box,
} from '@openagenda/uikit';

export default function AccordionItem({ title, children }) {
  return (
    <ChakraAccordionItem>
      <AccordionButton>
        <Box as="span" flex="1" textAlign="left">
          {title}
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel ml="2">{children}</AccordionPanel>
    </ChakraAccordionItem>
  );
}
