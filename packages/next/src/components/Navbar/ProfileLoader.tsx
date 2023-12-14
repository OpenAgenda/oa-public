import { useToken } from '@openagenda/uikit';
import ContentLoader from 'react-content-loader';

export default function ProfileLoader(props) {
  const [oaGray100, oaGray200] = useToken('colors', ['oaGray.100', 'oaGray.200']);

  return (
    <ContentLoader
      uniqueKey="profile"
      speed={2}
      width={140}
      height={40}
      viewBox="0 0 140 40"
      backgroundColor={oaGray100}
      foregroundColor={oaGray200}
      {...props}
    >
      <circle cx="20" cy="20" r="14" />
      <circle cx="70" cy="20" r="14" />
      <circle cx="120" cy="20" r="14" />
    </ContentLoader>
  );
}
