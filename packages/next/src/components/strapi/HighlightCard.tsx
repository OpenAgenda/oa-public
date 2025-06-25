import { Stack, Heading, Image, Link, Box } from '@openagenda/uikit';
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
  Illustration?: {
    image: {
      url: string;
    };
    borderRadius?: string;
  };
  smallIllustration?: boolean;
  link?: string;
}

export default function HighlightCard({
  title,
  description,
  Illustration,
  smallIllustration,
  link,
}: HighlightCardProps) {
  // Helper function to format description for markdown

  const content = (
    <Stack gap="3" maxW="280px" align="center" textAlign="center">
      {Illustration && (
        <Box
          height={smallIllustration ? '100px' : '120px'}
          width="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mb={2}
        >
          <Image
            src={Illustration.image.url}
            alt={title || ''}
            maxW={smallIllustration ? '100px' : '200px'}
            maxH={smallIllustration ? '100px' : '120px'}
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
          <StrapiMarkdown flex="none">{String(description)}</StrapiMarkdown>
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
