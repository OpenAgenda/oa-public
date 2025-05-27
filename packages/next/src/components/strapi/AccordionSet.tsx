import { Box, Heading } from '@openagenda/uikit';
import { AccordionRoot } from '@openagenda/uikit/snippets';
import { color } from 'utils/strapi';
import SegmentContainer from './SegmentContainer';
import AccordionItem from './Accordion';
import type { Color } from './types';

interface AccordionSetProps {
  title?: string;
  boxAlign?: React.CSSProperties['justifyContent'];
  maxWidth?: { name: string };
  width?: { name: string };
  borderRadius?: string;
  variant?: string;
  Components: Array<any>;
  backgroundColor?: Color;
  gradient?: boolean;
  contentColor?: Color;
  useAccordion?: boolean;
}

export default function AccordionSet({
  title,
  boxAlign = 'center',
  maxWidth = { name: 'sm' },
  width = { name: 'sm' },
  borderRadius = '2xl',
  Components,
  backgroundColor,
  gradient = true,
  contentColor,
  useAccordion,
}: AccordionSetProps) {
  const gradientBackground =
    gradient && backgroundColor
      ? `linear-gradient(175deg, ${backgroundColor.name}.200 15%, ${backgroundColor.name}.100 40%, #fff 100%);`
      : undefined;

  if (!useAccordion) return null;
  return (
    <SegmentContainer backgroundColor={color(backgroundColor)}>
      <Heading as="h2" size="xl" textAlign="center">
        {title}
      </Heading>
      <Box display="flex" justifyContent={boxAlign} p={8}>
        <AccordionRoot
          collapsible
          maxWidth={maxWidth?.name}
          width={width?.name}
          bg={!gradient && backgroundColor ? color(backgroundColor) : 'white'}
          backgroundImage={gradientBackground ? gradientBackground : undefined}
          borderRadius={borderRadius}
        >
          {Components.map((Component) => (
            <AccordionItem
              key={Component.id}
              value={String(Component.id)}
              {...Component}
              contentColor={color(contentColor) || 'black'}
            />
          ))}
        </AccordionRoot>
      </Box>
    </SegmentContainer>
  );
}
