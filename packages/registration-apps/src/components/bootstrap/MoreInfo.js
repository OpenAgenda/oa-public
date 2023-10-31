import { MoreInfo } from '@openagenda/react-shared';

export default ({
  title, content, id, children,
}) => (<MoreInfo
  id={id}
  title={title}
  content={content}
  placement="right"
>{children}</MoreInfo>);