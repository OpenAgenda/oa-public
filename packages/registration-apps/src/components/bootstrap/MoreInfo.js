import { MoreInfo } from '@openagenda/react-shared';

export default ({ title, content, children }) => (
  <MoreInfo title={title} content={content} placement="right">
    {children}
  </MoreInfo>
);
