import { useCallback, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import breaks from 'remark-breaks';
import { chakra, CloseButton, Container } from '@openagenda/uikit';
import useUser from 'hooks/useUser';

const getTarget = uri => (uri.match(/^(https?:|)\/\//) ? '_blank' : undefined);
const remarkPlugins: any[] = [breaks];

const STORAGE_ANNOUNCEMENT_KEY = 'oa:announcement';

const colorMap = {
  primary: {
    text: 'primary.500',
    bg: '#eef8fc',
    border: 'primary.500',
  },
  info: {
    text: 'primary.500',
    bg: 'white',
    border: 'primary.500',
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
  },
  danger: {
    text: 'danger.500',
    bg: '#fdf7f7',
    border: 'danger.500',
  },
};

export default function Announcement() {
  const { user } = useUser();

  const [displayAnnouncement, setDisplayAnnouncement] = useState(false);

  useEffect(() => {
    setDisplayAnnouncement(
      user?.announcement
      && window.localStorage.getItem(STORAGE_ANNOUNCEMENT_KEY) !== user.announcement.id,
    );
  }, [user]);

  const hideAnnouncement = useCallback(() => {
    window.localStorage.setItem(STORAGE_ANNOUNCEMENT_KEY, user.announcement.id);
    setDisplayAnnouncement(false);
  }, [user]);

  console.log({ user, displayAnnouncement });

  if (!user?.announcement || !displayAnnouncement) {
    return null;
  }

  const colors = colorMap[user.announcement.kind || 'info'];

  return (
    <chakra.div
      color={colors.text}
      bg={colors.bg}
      borderY="1px"
      borderColor={colors.border}
    >
      <Container
        maxW="container.xl"
        py="2"
        sx={{
          'p:not(:last-child)': {
            pb: '2',
          },
        }}
        display="flex"
        justifyContent="space-between"
      >
        <chakra.div alignSelf="center">
          <ReactMarkdown linkTarget={getTarget} remarkPlugins={remarkPlugins}>
            {user.announcement.content}
          </ReactMarkdown>
        </chakra.div>
        <CloseButton onClick={hideAnnouncement} />
      </Container>
    </chakra.div>
  );
}
