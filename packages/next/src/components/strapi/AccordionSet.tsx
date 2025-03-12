import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Heading,
} from '@openagenda/uikit';
import ReactMarkdown from 'react-markdown';
import CTAButton from './CTAButton';
import SegmentContainer from './SegmentContainer';
import IconComponent from './Icon';

interface AccordionProps {
  title?: string;
  boxAlign?: React.CSSProperties['justifyContent'];
  contentAlign?: React.CSSProperties['textAlign'];
  maxWidth?: { name: string };
  width?: { name: string };
  borderRadius?: string;
  variant?: string;
  Components: Array<any>;
  backgroundColor?: string;
  chevronColor?: string;
  useAccordion?: boolean;
}

export default function AccordionSet({
  title,
  boxAlign = 'center',
  contentAlign = 'left',
  maxWidth = { name: 'sm' },
  width = { name: 'sm' },
  borderRadius = '2xl',
  variant = 'link',
  Components,
  backgroundColor = 'white',
  chevronColor = 'black',
  useAccordion,
}: AccordionProps) {
  if (!useAccordion) return null;
  return (
    <SegmentContainer backgroundColor={backgroundColor}>
      <Heading as="h2" size="xl" textAlign="center">
        {title}
      </Heading>
      <Box display="flex" justifyContent={boxAlign} p={8}>
        <Accordion
          allowMultiple
          maxWidth={maxWidth?.name}
          width={width?.name}
          bg={backgroundColor}
          borderRadius={borderRadius}
        >
          {Components.map((Component) => {
            return (
              <AccordionItem key={Component.id} sx={{ border: 'none' }}>
                <h2>
                  <AccordionButton>
                    <Box
                      flex={1}
                      display="flex"
                      flexDirection="row"
                      alignItems="center"
                      p={4}
                    >
                      {Component.Icon ? (
                        <IconComponent {...Component.Icon} />
                      ) : null}
                      <Heading
                        textAlign={contentAlign}
                        fontSize="140%"
                        ml={Component.Icon ? 4 : 0}
                      >
                        {Component.title}
                      </Heading>
                    </Box>
                    <AccordionIcon color={chevronColor} />
                  </AccordionButton>
                </h2>
                <AccordionPanel padding={8}>
                  {Component.description ? (
                    <Box
                      width="full"
                      textAlign={contentAlign}
                      display="flex"
                      flexDirection="column"
                      style={{ listStylePosition: 'inside' }}
                    >
                      <ReactMarkdown>{Component.description}</ReactMarkdown>
                    </Box>
                  ) : null}
                  {Component.CTA ? (
                    <Box textAlign={contentAlign} pt={2}>
                      <CTAButton {...Component.CTA} variant={variant} />
                    </Box>
                  ) : null}
                </AccordionPanel>
              </AccordionItem>
            );
          })}
        </Accordion>
      </Box>
    </SegmentContainer>
  );
}
