import { Stack, Heading, Image, Link, Box } from '@openagenda/uikit';
import { color } from 'utils/strapi';
import StrapiMarkdown from './StrapiMarkdown';

interface RichTextParagraph {
  type: string;
  children: Array<{
    type: string;
    text: string;
  }>;
}

interface HighlightCardProps {
  title?: string;
  description?: string | RichTextParagraph[];
  image?: {
    url: string;
    alternativeText?: string;
  };
  smallImage?: boolean;
  link?: string;
  cardSize?: string;
  backgroundColor?: any;
}

export default function HighlightCard({
  title,
  description,
  image,
  smallImage,
  link,
  cardSize = 'medium',
  backgroundColor,
}: HighlightCardProps) {
  // Helper function to format description for markdown
  const content = (
    <Stack
      gap={cardSize === 'large' ? 6 : 4}
      padding={cardSize === 'large' ? 6 : 4}
      maxW={cardSize === 'large' ? '340px' : '280px'}
      align="center"
      textAlign="center"
      backgroundColor={
        backgroundColor?.name === 'white'
          ? backgroundColor.name
          : backgroundColor
            ? [color(`${backgroundColor?.name}`), 'subtle'].join('.')
            : null
      }
    >
      {image && (
        <Box
          height={smallImage ? '100px' : '120px'}
          width="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mb={2}
        >
          <Image
            src={image.url}
            alt={image.alternativeText}
            maxW={smallImage ? '100px' : '200px'}
            maxH={smallImage ? '100px' : '120px'}
            objectFit="contain"
          />
        </Box>
      )}
      {title && (
        <Heading size="md" fontWeight={600}>
          {title}
        </Heading>
      )}
      {description && (
        <Box color="gray.600">
          <StrapiMarkdown flex="none" textAlign="left">
            {String(description)}
          </StrapiMarkdown>
        </Box>
      )}
    </Stack>
  );

  if (link) {
    return (
      <Link
        href={link}
        textDecoration="none"
        _hover={{ textDecoration: 'none', transform: 'translateY(-2px)' }}
        transition="all 0.2s"
      >
        {content}
      </Link>
    );
  }

  return content;
}
