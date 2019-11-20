import React from 'react';
import useChildLayouts from '../hooks/useChildLayouts';

function InboxUserLayout({
  childLayouts,
  children,
  onError,
  FallbackComponent
}) {
  const content = useChildLayouts(
    children,
    { onError, FallbackComponent },
    childLayouts
  );

  return (
    <div className="container top-margined">
      <div className="row">
        <div className="col-sm-offset-2 col-sm-8">
          <div className="wsq">
            <div className="inbox inbox-user padding-all-sm">{content}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

InboxUserLayout.layoutName = 'InboxUserLayout';

export default InboxUserLayout;
