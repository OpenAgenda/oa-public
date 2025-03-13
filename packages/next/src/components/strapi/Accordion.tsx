import {
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Heading,
} from '@openagenda/uikit';
import ReactMarkdown from 'react-markdown';
import { color } from 'utils/strapi';
import CTAButton from './CTAButton';
import IconComponent from './Icon';

export default function Accordion({
  title,
  description,
  Icon,
  CTA,
  contentAlign = null,
  variant = 'link',
  accordionColor,
}) {
  return (
    <AccordionItem sx={{ border: 'none' }}>
      <h2>
        <AccordionButton>
          <Box
            flex={1}
            display="flex"
            flexDirection="row"
            alignItems="center"
            p={4}
          >
            {Icon ? <IconComponent {...Icon} color={accordionColor} /> : null}
            <Heading
              textAlign={contentAlign}
              fontSize="140%"
              ml={Icon ? 4 : 0}
              color={accordionColor}
            >
              {title}
            </Heading>
          </Box>
          <AccordionIcon color={accordionColor} />
        </AccordionButton>
      </h2>
      <AccordionPanel padding={8}>
        {description ? (
          <Box
            width="full"
            textAlign={contentAlign}
            display="flex"
            flexDirection="column"
            style={{ listStylePosition: 'inside' }}
            color={color(accordionColor) || 'black'}
          >
            <ReactMarkdown>{description}</ReactMarkdown>
          </Box>
        ) : null}
        {CTA ? (
          <Box textAlign={contentAlign} pt={2}>
            <CTAButton {...CTA} variant={variant} />
          </Box>
        ) : null}
      </AccordionPanel>
    </AccordionItem>
  );
}
