import { chakra, Flex, H3, Image, Link } from '@openagenda/uikit';
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

export default function SplitHero({ title, image, text, direction = 'row' }) {
  return (
    <>
      <H3 mb="4" hideBelow="md">
        {title}
      </H3>
      <Flex
        gap="8"
        direction={{ base: 'column', md: direction }}
        align="center"
      >
        {image ? (
          <Image
            src={`${image.url}`}
            alt={image.alternativeText}
            borderRadius="lg"
            maxW={{ base: 'full', md: '33%' }}
            height="auto"
          />
        ) : null}
        <H3 mb="4" hideFrom="md">
          {title}
        </H3>
        <chakra.div flex="1" css={mdStyle}>
          <ReactMarkdown
            remarkPlugins={remarkPlugins}
            rehypePlugins={rehypePlugins}
            components={reactMdComponents}
          >
            {text}
          </ReactMarkdown>
        </chakra.div>
      </Flex>
    </>
  );
}
