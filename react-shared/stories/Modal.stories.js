import React, { useState } from 'react';
import Modal from '../src/components/Modal';
import AdminCanvas from './decorators/AdminCanvas';

import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'Modal',
  component: Modal,
  decorators: [AdminCanvas],
};

export const Simple = () => {
  const [display, setDisplay] = useState(false);
  const closeModal = () => {
    setDisplay(false);
  };
  return (
    <>
      <button className="js_export_button btn btn-default btn-primary" type="button" onClick={() => setDisplay(true)}>
        <i className="fa fa-external-link" />
        <span>&nbsp; Open</span>
      </button>
      {display ? (
        <Modal title="Modal" onClose={closeModal} classNames={{ overlay: 'popup-overlay' }} disableBodyScroll>
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
      <button className="js_export_button btn btn-default btn-primary" type="button" onClick={() => setDisplay(true)}>
        <i className="fa fa-external-link" />
        <span>&nbsp; Open</span>
      </button>
      {display ? (
        <Modal onClose={closeModal} classNames={{ overlay: 'popup-overlay big' }} disableBodyScroll>
          <form className="export__form">
            <button className="export__close" type="button" onClick={() => setDisplay(false)}>
              <i className="fa fa-times fa-lg" />
            </button>
            <h1 className="export__title--big">I am a Big Modal</h1>
            <h2 className="export__title--md">Without a header.</h2>
            <div className="mg-bottom-sm form-group">
              <ul>
                <li>
                  Morbi in sem quis dui placerat ornare. Pellentesque odio nisi, euismod in, pharetra a, ultricies in,
                  diam. Sed arcu. Cras consequat.
                </li>
                <li>
                  Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu
                  erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus.
                </li>
                <li>
                  Phasellus ultrices nulla quis nibh. Quisque a lectus. Donec consectetuer ligula vulputate sem
                  tristique cursus. Nam nulla quam, gravida non, commodo a, sodales sit amet, nisi.
                </li>
                <li>
                  Pellentesque fermentum dolor. Aliquam quam lectus, facilisis auctor, ultrices ut, elementum vulputate,
                  nunc.
                </li>
              </ul>
            </div>
            <button type="button" className="btn btn-primary" onClick={() => setDisplay(false)}>
              Ok
            </button>
          </form>
        </Modal>
      ) : null}
    </>
  );
};
