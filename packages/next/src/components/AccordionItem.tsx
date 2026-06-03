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
  // Collapsed-row value/action shown in a second column, left-aligned at a
  // consistent x across rows (mirrors the legacy two-column settings table).
  summary?: React.ReactNode;
  // When set, the visible trigger label gets this id so the expanded form's
  // single control can reference it via `aria-labelledby` — the label stays
  // visible above the field with no duplicate (RGAA 11.1).
  labelId?: string;
  children: React.ReactNode;
}

export default function AccordionItem({
  value,
  title,
  summary,
  labelId,
  children,
}: AccordionItemProps) {
  return (
    <ChakraAccordionItem value={value}>
      <AccordionItemTrigger px="6">
        <chakra.div
          fontSize={defaultSize}
          display="flex"
          alignItems="center"
          flex="1"
          gap="6"
        >
          <chakra.div
            id={labelId}
            flexBasis={{ base: '40%', md: '33%' }}
            flexShrink={0}
          >
            {title}
          </chakra.div>
          {summary != null ? (
            <chakra.div flex="1" textAlign="start">
              {summary}
            </chakra.div>
          ) : null}
        </chakra.div>
      </AccordionItemTrigger>
      <AccordionItemContent px="6">{children}</AccordionItemContent>
    </ChakraAccordionItem>
  );
}
