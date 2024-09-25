export default (Story) => (
  <div className="container-fluid top-margined agenda-admin agenda-admin-filters-layout">
    <div className="row">
      <div className="col-md-offset-2 col-md-7 wsq">
        <div className="row wsq header">
          <div className="col col-sm-2">
            <a className="agenda-logo" href="/">
              <img
                src="https://s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png"
                alt="Logo OpenAgenda"
              />
            </a>
          </div>
          <div className="col col-sm-10">
            <h1>OpenAgenda</h1>
            <p>Composants React</p>
          </div>
        </div>
      </div>
    </div>
    <div className="row body">
      <div className="col-md-offset-2 col-md-7 wsq">
        <div className="padding-all-md wsq padding-bottom-sm">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Story />
          </div>
        </div>
      </div>
    </div>
  </div>
);
