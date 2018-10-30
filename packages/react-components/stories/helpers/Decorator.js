import React from 'react';

export default story => (
  <div className="container">
    <div className="row">
      <div className="wsq col-sm-offset-3 col-sm-6 margin-top-lg padding-all-md">
        {story()}
      </div>
    </div>
  </div>
)
