import { useCallback, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import breaks from 'remark-breaks';
import rehypeExternalLinks from 'rehype-external-links';
import { chakra, CloseButton, Container, Link } from '@openagenda/uikit';
import defaultSize from 'utils/defaultSize';
import useUser from 'hooks/useUser';

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

const STORAGE_ANNOUNCEMENT_KEY = 'oa:announcement';

const colorMap = {
  primary: {
    text: 'primary.500',
    bg: '#eef8fc',
    border: 'primary.500',
    link: 'primary.500',
    linkHover: 'primary.600',
  },
  info: {
    text: 'primary.500',
    bg: 'white',
    border: 'primary.500',
    link: 'primary.500',
    linkHover: 'primary.600',
  },
  // success: {
  //   text: 'success.500',
  //   bg: 'success.200',
  //   border: 'success.500',
  // },
  warning: {
    text: 'warning.500',
    bg: 'white',
    border: 'warning.500',
    link: 'warning.500',
    linkHover: 'warning.600',
  },
  danger: {
    text: 'danger.500',
    bg: '#fdf7f7',
    border: 'danger.500',
    link: 'danger.500',
    linkHover: 'danger.600',
  },
};

export default function Announcement() {
  const { user } = useUser();

  const [displayAnnouncement, setDisplayAnnouncement] = useState(false);

  useEffect(() => {
    setDisplayAnnouncement(
      user?.announcement &&
        window.localStorage.getItem(STORAGE_ANNOUNCEMENT_KEY) !==
          user.announcement.id,
    );
  }, [user]);

  const hideAnnouncement = useCallback(() => {
    window.localStorage.setItem(STORAGE_ANNOUNCEMENT_KEY, user.announcement.id);
    setDisplayAnnouncement(false);
  }, [user]);

  if (!user?.announcement || !displayAnnouncement) {
    return null;
  }

  const colors = colorMap[user.announcement.kind || 'info'];

  return (
    <chakra.div
      color={colors.text}
      bg={colors.bg}
      borderY="1px solid"
      borderColor={colors.border}
    >
      <Container
        maxW="7xl"
        py="2"
        css={{
          '& p:not(:last-child)': {
            pb: '2',
          },
          '& a': {
            color: colors.link,
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
            _hover: {
              color: colors.linkHover,
            },
          },
        }}
        fontSize={defaultSize}
        display="flex"
        justifyContent="space-between"
      >
        <chakra.div alignSelf="center">
          <ReactMarkdown
            remarkPlugins={remarkPlugins}
            rehypePlugins={rehypePlugins}
            components={reactMdComponents}
          >
            {user.announcement.content}
          </ReactMarkdown>
        </chakra.div>
        <CloseButton onClick={hideAnnouncement} />
      </Container>
    </chakra.div>
  );
}
