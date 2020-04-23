import React from 'react';

export default storyFn => (
  <div className="container margin-top-lg">
    <div className="row">
      <div className="wsq col-sm-offset-3 col-sm-6 padding-v-sm">
        {storyFn()}
      </div>
    </div>
  </div>
);
