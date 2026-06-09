import {
  AccordionItem as ChakraAccordionItem,
  AccordionItemTrigger,
  AccordionItemContent,
} from '@openagenda/uikit/snippets';
import { Accordion, chakra } from '@openagenda/uikit';
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
            // Two-column layout only when there's a summary; without one (e.g.
            // DeleteAccount, or the long per-agenda titles nested in
            // Notifications) let the title use the full width so it doesn't get
            // squeezed into the first third and wrap.
            {...(summary != null
              ? { flexBasis: { base: '40%', md: '33%' }, flexShrink: 0 }
              : { flex: '1' })}
          >
            {title}
          </chakra.div>
          {summary != null ? (
            <chakra.div
              flex="1"
              textAlign="start"
              // Once the item is open the value is shown in the field below, so
              // hide the collapsed-row summary to avoid the repetition. The
              // trigger carries data-state="open" when expanded.
              css={{ '[data-state="open"] &': { display: 'none' } }}
            >
              {summary}
            </chakra.div>
          ) : null}
        </chakra.div>
      </AccordionItemTrigger>
      <AccordionItemContent px="6">
        {/* Lazy-mount: render the body only while the item is open. With the
            single-open settings accordion this keeps just one (sometimes heavy,
            e.g. Notifications) section mounted — toggling stops re-rendering
            every section, and each section's data fetch fires when it's opened
            rather than all of them on page load. */}
        <Accordion.ItemContext>
          {(item) => (item.expanded ? children : null)}
        </Accordion.ItemContext>
      </AccordionItemContent>
    </ChakraAccordionItem>
  );
}
