import { Card, CardBody, VStack, Heading, Box } from '@openagenda/uikit';
import ReactMarkdown from 'react-markdown';
import { color } from 'utils/strapi';
import CTAButton from './CTAButton';
import IllustrationComponent from './Illustration';
import IconComponent from './Icon';

const Wrapper = ({
  children,
  card,
  width,
  bg,
  alignHeight,
  borderRadius,
  useCarousel,
}) => {
  if (!card) {
    return (
      <Box
        w={width}
        flex={1}
        bg={useCarousel ? 'transparent' : bg}
        height={alignHeight ? 'full' : 'auto'}
      >
        {children}
      </Box>
    );
  }

  return (
    <Card
      w={width}
      flex={1}
      bg={useCarousel ? 'transparent' : bg}
      height={alignHeight ? 'full' : 'auto'}
      borderRadius={borderRadius}
    >
      <CardBody p={8}>{children}</CardBody>
    </Card>
  );
};

export default function Modular({
  title = null,
  description = null,
  Illustration = null,
  CTA = null,
  Icon = null,
  Tag = null,
  card = false,
  grow = 0,
  width = { name: 'sm' },
  backgroundColor = null,
  tagColor = null,
  fontColor = null,
  titleColor = null,
  descriptionColor = null,
  fontSize = null,
  contentAlign = null,
  alignHeight = false,
  borderRadius = '2xl',
  useCarousel = false,
}) {
  return (
    <Wrapper
      card={useCarousel ? false : card}
      width={grow ? 'auto' : width?.name || '400px'}
      bg={color(backgroundColor)}
      alignHeight={alignHeight}
      borderRadius={borderRadius}
      useCarousel={useCarousel}
    >
      <VStack
        spacing="3"
        align={
          contentAlign === 'left'
            ? 'start'
            : contentAlign === 'right'
              ? 'end'
              : 'center'
        }
        textAlign={contentAlign || 'center'}
        color={color(fontColor)}
        height={alignHeight ? 'full' : 'auto'}
      >
        {Tag ? (
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            bg={tagColor ? `${tagColor.name}.50` : null}
            color={tagColor ? `${tagColor.name}.500` : null}
            px={4}
            py={2}
            borderRadius="full"
            fontSize="xl"
            fontWeight="bold"
          >
            {Icon && (
              <IconComponent
                {...Icon}
                color={tagColor ? `${tagColor.name}.500` : null}
              />
            )}
            {Tag}
          </Box>
        ) : null}
        {Icon && !Tag ? <IconComponent {...Icon} /> : null}
        {Illustration ? <IllustrationComponent {...Illustration} /> : null}
        <Box
          flex={1}
          width="full"
          display="flex"
          alignItems={
            contentAlign === 'left'
              ? 'flex-start'
              : contentAlign === 'right'
                ? 'flex-end'
                : 'center'
          }
          {...(alignHeight && { justifyContent: 'space-around' })}
          flexDirection="column"
          gap={4}
        >
          {title ? (
            <Heading
              textAlign={contentAlign || 'center'}
              color={color(titleColor)}
              fontSize={fontSize?.name || '160%'}
            >
              {title}
            </Heading>
          ) : null}
          {description ? (
            <Box
              color={color(descriptionColor)}
              width="full"
              display="flex"
              flexDirection="column"
              style={{ listStylePosition: 'inside' }}
              fontSize="xl"
              sx={{
                a: {
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                },
              }}
            >
              <ReactMarkdown>{description}</ReactMarkdown>
            </Box>
          ) : null}
          {CTA ? <CTAButton {...CTA} /> : null}
        </Box>
      </VStack>
    </Wrapper>
  );
}
