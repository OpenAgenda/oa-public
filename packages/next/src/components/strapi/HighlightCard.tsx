import { Stack, Heading, Image, Link, Box } from '@openagenda/uikit';
import ReactMarkdown from 'react-markdown';

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
    <Stack gap="3" maxW="sm" align="center" textAlign="center">
      {Illustration && (
        <Image
          src={Illustration.image.url}
          alt={title || ''}
          maxW={smallIllustration ? '100px' : undefined}
        />
      )}
      {title && <Heading size="md">{title}</Heading>}
      {description && (
        <Box color="gray.600">
          <ReactMarkdown>{description}</ReactMarkdown>
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
