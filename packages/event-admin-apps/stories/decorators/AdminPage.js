export default Story => (
  <div className="container-fluid top-margined agenda-admin agenda-admin-filters-layout">
    <div className="row">
      <div className="col-md-offset-2 col-md-7 wsq">
        <div className="row wsq header">
          <div className="col col-sm-2">
            <a className="agenda-logo" href="/">
              <img
                src="https://cibul.s3.amazonaws.com/agenda89904399.jpg"
                alt="Métropole Européenne de Lille"
              />
            </a>
          </div>
          <div className="col col-sm-10">
            <h1>Métropole Européenne de Lille</h1>
            <p>Administration</p>
            <a className="url" href="/">
              Aller à l&apos;accueil de l&apos;agenda
            </a>
          </div>
        </div>
      </div>
    </div>
    <div className="row body">
      <div className="col-md-offset-2 col-md-2 col-sm-12 nav wsq">
        <ul className="list-unstyled">
          <li className="menu-item js_menu_item js_menu_item_settings_sources selected">
            <a className="active" href="/">
              <span>Événements</span>
            </a>
          </li>
        </ul>
      </div>
      <Story />
    </div>
  </div>
);
