import React from 'react';

export default Story => (
  <div className="container top-margined">
    <div className="row wsq">
      <div className="col col-sm-3 nav">
        <ul className="list-unstyled">
          <li className="menu-item js_menu_item js_menu_item_settings_sources selected">
            <a className="active" href="/">
              <span>Événements</span>
            </a>
          </li>
        </ul>
      </div>
      <div className="col-sm-9 body">
        <div className="js_canvas">
          <Story />
        </div>
      </div>
    </div>
  </div>
);
