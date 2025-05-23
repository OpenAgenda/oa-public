import { Card, VStack, Heading, Box } from '@openagenda/uikit';
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
  verticalAlign,
  borderRadius,
  useCarousel,
}) => {
  if (!card) {
    return (
      <Box
        w={width}
        flex={1}
        bg={useCarousel ? 'transparent' : bg}
        height={verticalAlign ? 'full' : 'auto'}
      >
        {children}
      </Box>
    );
  }

  return (
    <Card.Root
      w={width}
      flex={1}
      bg={useCarousel ? 'transparent' : bg}
      height={verticalAlign ? 'full' : 'auto'}
      borderRadius={borderRadius}
    >
      <Card.Body p={8}>{children}</Card.Body>
    </Card.Root>
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
  verticalAlign = false,
  borderRadius = '2xl',
  useCarousel = false,
}) {
  return (
    <Wrapper
      card={useCarousel ? false : card}
      width={grow ? 'auto' : width?.name || '400px'}
      bg={color(backgroundColor)}
      verticalAlign={verticalAlign}
      borderRadius={borderRadius}
      useCarousel={useCarousel}
    >
      <VStack
        gap="0"
        align={
          contentAlign === 'left'
            ? 'start'
            : contentAlign === 'right'
              ? 'end'
              : 'center'
        }
        textAlign={contentAlign || 'center'}
        color={color(fontColor)}
        height={verticalAlign ? 'full' : 'auto'}
      >
        {Tag ? (
          <Box
            display="flex"
            alignItems="center"
            bg={tagColor ? `${tagColor.name}.50` : null}
            color={tagColor ? `${tagColor.name}.500` : null}
            px={6}
            py={2}
            borderRadius="full"
            fontSize="lg"
            gap="2"
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
          {...(verticalAlign && { justifyContent: 'space-around' })}
          flexDirection="column"
        >
          {title ? (
            <Heading
              textAlign={contentAlign || 'center'}
              color={color(titleColor)}
              size={fontSize?.name}
              mt={Tag || Icon || Illustration ? 7 : 0}
              fontWeight={600}
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
              fontSize="md"
              mt={7}
              css={{
                '& a': {
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
