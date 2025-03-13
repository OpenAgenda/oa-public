import { Accordion, Box, Heading } from '@openagenda/uikit';
import { color } from 'utils/strapi';
import SegmentContainer from './SegmentContainer';
import AccordionItem from './Accordion';

interface Color {
  name: string;
  swatch?: string;
}

interface AccordionSetProps {
  title?: string;
  boxAlign?: React.CSSProperties['justifyContent'];
  maxWidth?: { name: string };
  width?: { name: string };
  borderRadius?: string;
  variant?: string;
  Components: Array<any>;
  backgroundColor?: Color;
  contentColor?: Color;
  useAccordion?: boolean;
}

export default function AccordionSet({
  title,
  boxAlign = 'center',
  maxWidth = { name: 'sm' },
  width = { name: 'sm' },
  borderRadius = '2xl',
  variant = 'link',
  Components,
  backgroundColor,
  contentColor,
  useAccordion,
}: AccordionSetProps) {
  if (!useAccordion) return null;
  console.log('color(backgroundColor)', color(backgroundColor));
  return (
    <SegmentContainer backgroundColor={color(backgroundColor)}>
      <Heading as="h2" size="xl" textAlign="center">
        {title}
      </Heading>
      <Box display="flex" justifyContent={boxAlign} p={8}>
        <Accordion
          allowMultiple
          maxWidth={maxWidth?.name}
          width={width?.name}
          bg={color(backgroundColor) || 'white'}
          borderRadius={borderRadius}
        >
          {Components.map((Component) => (
            <AccordionItem
              key={Component.id}
              {...Component}
              variant={variant}
              contentColor={color(contentColor) || 'black'}
            />
          ))}
        </Accordion>
      </Box>
    </SegmentContainer>
  );
}
