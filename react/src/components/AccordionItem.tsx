import {
  AccordionItem as ChakraAccordionItem,
  AccordionItemTrigger,
  AccordionItemContent,
  Tooltip,
} from '@openagenda/uikit/snippets';
import { chakra } from '@openagenda/uikit';

interface AccordionItemProps {
  value: string;
  title: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
  disabledTooltip?: string;
}

export default function AccordionItem({
  value,
  title,
  children,
  disabled = false,
  disabledTooltip,
}: AccordionItemProps) {
  const trigger = (
    <AccordionItemTrigger
      px="6"
      opacity={disabled ? 0.5 : 1}
      cursor={disabled ? 'not-allowed' : 'pointer'}
    >
      <chakra.div display="flex" alignItems="center">
        {title}
      </chakra.div>
    </AccordionItemTrigger>
  );

  return (
    <ChakraAccordionItem value={value} disabled={disabled}>
      {disabled && disabledTooltip ? (
        <Tooltip
          content={disabledTooltip}
          positioning={{ placement: 'top' }}
          showArrow
          contentProps={{
            css: { '--tooltip-bg': 'white' },
            color: 'black',
          }}
          openDelay={0}
          closeDelay={0}
        >
          {trigger}
        </Tooltip>
      )
        : trigger}
      <AccordionItemContent px="6">{children}</AccordionItemContent>
    </ChakraAccordionItem>
  );
}
