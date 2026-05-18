import loadableEsm from '@openagenda/react-shared/utils/loadableEsm';

// eslint-disable-next-line camelcase
const contextRequire = typeof __webpack_require__ !== 'undefined'
  ? import.meta.webpackContext
      && import.meta.webpackContext('.', {
        recursive: true,
        regExp: /\.js$/,
        mode: 'weak',
      })
  : null;

const Attachments = loadableEsm(
  {
    chunkName: 'inboxes-Attachments',
    importAsync: () =>
      import(
        /* webpackChunkName: "inboxes-Attachments" */
        './Attachments.js'
      ),
    // importSync:
    //   // eslint-disable-next-line camelcase
    //   typeof __webpack_require__ === 'undefined'
    //     ? await import('./Attachments.js')
    //     : null,
    resolve: () => {
      if (contextRequire) {
        return contextRequire.resolve('./Attachments.js');
      }
      const { resolve } = import.meta;
      if (typeof resolve === 'function') {
        return resolve('./Attachments.js');
      }
    },
  },
  { ssr: false },
);

export default function LoadableAttachments({ ...props }) {
  return <Attachments {...props} />;
}
