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
    return <Link {...rest} />;
  },
};

interface StrapiMarkdownProps {
  children: string;
  flex?: string;
}

export default function StrapiMarkdown({
  children,
  flex = '1',
}: StrapiMarkdownProps) {
  return (
    <chakra.div flex={flex} css={mdStyle}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={reactMdComponents}
      >
        {children}
      </ReactMarkdown>
    </chakra.div>
  );
}
