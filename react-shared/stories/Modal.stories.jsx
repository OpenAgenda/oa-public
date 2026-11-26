import { useState } from 'react';
import Modal from '../src/components/Modal.jsx';
import MoreInfo from '../src/components/MoreInfo.jsx';
import AdminCanvas from './decorators/AdminCanvas.jsx';

// eslint-disable-next-line
import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'Modal',
  component: Modal,
  MoreInfo,
  decorators: [AdminCanvas],
};

export const Simple = () => {
  const [display, setDisplay] = useState(false);
  const closeModal = () => {
    setDisplay(false);
  };
  return (
    <>
      <button
        className="js_export_button btn btn-default btn-primary"
        type="button"
        onClick={() => setDisplay(true)}
      >
        <i className="fa fa-external-link" />
        <span>&nbsp; Open</span>
      </button>
      {display ? (
        <Modal
          title="Modal"
          onClose={closeModal}
          classNames={{
            overlay: 'popup-overlay',
            title: 'popup-title padding-bottom-z',
          }}
          disableBodyScroll
        >
          <p>Hey I am a modal</p>
        </Modal>
      ) : null}
    </>
  );
};

export const NoHeader = () => {
  const [display, setDisplay] = useState(false);
  const closeModal = () => {
    setDisplay(false);
  };
  return (
    <>
      <button
        className="js_export_button btn btn-default btn-primary"
        type="button"
        onClick={() => setDisplay(true)}
      >
        <i className="fa fa-external-link" />
        <span>&nbsp; Open</span>
      </button>
      {display ? (
        <Modal
          onClose={closeModal}
          classNames={{
            overlay: 'popup-overlay big',
          }}
          disableBodyScroll
        >
          <form className="export-form">
            <button
              className="close"
              type="button"
              onClick={() => setDisplay(false)}
              aria-label="Close"
            >
              <i className="fa fa-times fa-lg" />
            </button>
            <h1 className="export-title-big">I am a Big Modal</h1>
            <h2 className="export-title-md">Without a header.</h2>
            <div className="mg-bottom-sm form-group">
              <ul>
                <li>
                  Morbi in sem quis dui placerat ornare. Pellentesque odio nisi,
                  euismod in, pharetra a, ultricies in, diam. Sed arcu. Cras
                  consequat.
                </li>
                <li>
                  Praesent dapibus, neque id cursus faucibus, tortor neque
                  egestas augue, eu vulputate magna eros eu erat. Aliquam erat
                  volutpat. Nam dui mi, tincidunt quis, accumsan porttitor,
                  facilisis luctus, metus.
                </li>
                <li>
                  Phasellus ultrices nulla quis nibh. Quisque a lectus. Donec
                  consectetuer ligula vulputate sem tristique cursus. Nam nulla
                  quam, gravida non, commodo a, sodales sit amet, nisi.
                </li>
                <li>
                  Pellentesque fermentum dolor. Aliquam quam lectus, facilisis
                  auctor, ultrices ut, elementum vulputate, nunc.
                </li>
              </ul>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setDisplay(false)}
            >
              Ok
            </button>
          </form>
        </Modal>
      ) : null}
    </>
  );
};

const FirstComponent = ({ onClick }) => (
  <div>
    <p>This is the first component</p>
    <button type="button" className="btn btn-primary" onClick={onClick}>
      Go to the second component
    </button>
  </div>
);

const SecondComponent = ({ onClick }) => (
  <div>
    <p>This is the second component</p>
    <p>
      Modal should not have closed when user clicked on first component button
    </p>
    <button type="button" className="btn btn-primary" onClick={onClick}>
      Close modal
    </button>
  </div>
);

export const WithComponentsWithButtons = () => {
  const [componentIndex, setComponentIndex] = useState(0);
  const [display, setDisplay] = useState(true);
  const closeModal = () => {
    setDisplay(false);
    setComponentIndex(0);
  };

  return (
    <>
      <p>
        Unsollicited modal close should not happend in the middle of content
        lifecycle
      </p>
      <button
        className="btn btn-primary"
        type="button"
        onClick={() => setDisplay(true)}
      >
        <span>&nbsp; Open</span>
      </button>
      {display ? (
        <Modal
          title="Modal"
          onClose={closeModal}
          classNames={{ overlay: 'popup-overlay' }}
          disableBodyScroll
        >
          {componentIndex === 0 ? (
            <FirstComponent onClick={() => setComponentIndex(1)} />
          ) : (
            <SecondComponent onClick={() => closeModal()} />
          )}
        </Modal>
      ) : null}
    </>
  );
};

export const MoreInfoInModal = () => {
  const [display, setDisplay] = useState(false);
  const closeModal = () => {
    setDisplay(false);
  };
  return (
    <>
      <button
        className="js_export_button btn btn-default btn-primary"
        type="button"
        onClick={() => setDisplay(true)}
      >
        <i className="fa fa-external-link" />
        <span>&nbsp; Open</span>
      </button>
      {display ? (
        <Modal
          title="Modal"
          onClose={closeModal}
          classNames={{ overlay: 'popup-overlay' }}
          disableBodyScroll
        >
          <p style={{ flexBasis: '60%' }}>
            Simple icône d&apos;aide auquel on peut attacher un message.
          </p>
          <div style={{ alignSelf: 'center' }}>
            <MoreInfo content="Text" />
          </div>
        </Modal>
      ) : null}
    </>
  );
};

// To check by keyboard: focus moves into the dialog on open, Tab and
// Shift+Tab cycle through its controls without reaching the page behind,
// Escape closes it and gives focus back to the "Open" button.
export const KeyboardAndFocus = () => {
  const [display, setDisplay] = useState(false);
  const closeModal = () => {
    setDisplay(false);
  };
  return (
    <>
      <button
        className="btn btn-default btn-primary"
        type="button"
        onClick={() => setDisplay(true)}
      >
        Open
      </button>
      <p>
        <a href="#behind">A link behind the dialog</a>
      </p>
      {display ? (
        <Modal
          title="Export events"
          onClose={closeModal}
          closeLabel="Close the export dialog"
          disableBodyScroll
        >
          <div className="form-group">
            <label htmlFor="modal-story-format">Format</label>
            <select id="modal-story-format" className="form-control">
              <option>CSV</option>
              <option>JSON</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="modal-story-email">Email</label>
            <input id="modal-story-email" className="form-control" />
          </div>
          <div className="text-right">
            <button
              type="button"
              className="btn btn-default margin-right-sm"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button type="button" className="btn btn-primary">
              Export
            </button>
          </div>
        </Modal>
      ) : null}
    </>
  );
};
