import loadable from '@openagenda/react-shared/lib/utils/loadable';

const Attachments = loadable(
  () => import(/* webpackChunkName: "inboxes-Attachments" */ './Attachments'),
  { ssr: false },
);

export default function LoadableAttachments({ ...props }) {
  return <Attachments {...props} />;
}
