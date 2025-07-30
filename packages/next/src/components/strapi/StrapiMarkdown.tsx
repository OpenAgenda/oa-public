import { chakra, Link } from '@openagenda/uikit';
import breaks from 'remark-breaks';
import rehypeExternalLinks from 'rehype-external-links';
import ReactMarkdown from 'react-markdown';
import mdStyle from 'utils/mdStyle';

const remarkPlugins = [breaks];
const rehypePlugins = [
  [
    rehypeExternalLinks,
    {
      target: '_blank',
      rel: ['nofollow', 'noopener'],
    },
  ],
] as any; // import("unified").PluggableList;

const reactMdComponents = {
  a(props) {
    const { node, ...rest } = props;
    return <Link {...rest} color="strapi.flashy.blueViolet.500 !important" />;
  },
};

interface StrapiMarkdownProps {
  children: string;
  flex?: string;
  color?: string;
  mt?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
}

export default function StrapiMarkdown({
  children,
  flex = '1',
  color,
  mt,
  textAlign,
}: StrapiMarkdownProps) {
  // Preprocess content to convert single line breaks to double line breaks
  // This creates proper paragraph spacing instead of just <br> tags
  const processedContent = children.replace(/\n/g, '\n\n');

  return (
    <chakra.div
      flex={flex}
      css={mdStyle}
      color={color}
      mt={mt}
      textAlign={textAlign}
    >
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={reactMdComponents}
      >
        {processedContent}
      </ReactMarkdown>
    </chakra.div>
  );
}
