import React from 'react';

export default Story => (
  <div className="container agenda-admin top-margined">
    <div className="row wsq">
      <div className="col col-sm-3 nav">
        <ul className="list-unstyled">
          <li className="menu-item js_menu_item js_menu_item_settings_profile selected">
            <a className="active" href="/profile?_app=edition">
              <span>Paramètres</span>
            </a>
          </li>
          <li className="menu-item js_menu_item js_menu_item_settings_contribution">
            <a href="/contribution?_app=edition">
              <span>Contribution</span>
            </a>
          </li>
          <li className="menu-item js_menu_item js_menu_item_settings_advanced">
            <a href="/advanced?_app=edition">
              <span>Avancé</span>
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
