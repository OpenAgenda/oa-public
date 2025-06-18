import { Accordion, Box, HStack, Text } from '@openagenda/uikit';
import {
  AccordionItem as ChakraAccordionItem,
  AccordionItemContent,
} from '@openagenda/uikit/snippets';
import ReactMarkdown from 'react-markdown';
import { color } from 'utils/strapi';
import CTAButton from './CTAButton';
import IconComponent from './Icon';

export default function AccordionItem({
  value,
  title,
  description,
  Icon,
  CTA,
  contentAlign = null,
  contentColor,
}) {
  return (
    <ChakraAccordionItem value={String(value)} border="none">
      <Accordion.ItemTrigger p="4">
        <HStack as="h2" gap="4" flex="1" textAlign="start" width="full">
          {Icon ? <IconComponent {...Icon} color={contentColor} /> : null}
          <Text textAlign={contentAlign} color={contentColor}>
            {title}
          </Text>
        </HStack>
        <Accordion.ItemIndicator />
      </Accordion.ItemTrigger>
      <AccordionItemContent padding={8}>
        {description ? (
          <Box
            width="full"
            textAlign={contentAlign}
            display="flex"
            flexDirection="column"
            style={{ listStylePosition: 'inside' }}
            color={color(contentColor) || 'black'}
          >
            <ReactMarkdown>{description}</ReactMarkdown>
          </Box>
        ) : null}
        {CTA ? (
          <Box textAlign={contentAlign} pt={2}>
            <CTAButton {...CTA} />
          </Box>
        ) : null}
      </AccordionItemContent>
    </ChakraAccordionItem>
  );
}
