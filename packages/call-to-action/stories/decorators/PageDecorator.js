import React from 'react';

export default storyFn => (
  <div className="container">
    <div className="row">
      <div className="wsq col-sm-offset-3 col-sm-6 margin-top-lg padding-all-md">
        {storyFn()}
      </div>
    </div>
  </div>
);
