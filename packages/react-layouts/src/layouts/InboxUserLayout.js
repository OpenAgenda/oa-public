import React from 'react';
import ChildLayouts from '../components/ChildLayouts';

function InboxUserLayout({
  childLayouts,
  children,
  extraProps,
  fallback,
}) {
  return (
    <div className="container top-margined">
      <div className="row">
        <div className="col-sm-offset-2 col-sm-8">
          <div className="wsq">
            <div className="inbox inbox-user padding-all-sm">
              <ChildLayouts
                layouts={childLayouts}
                extraProps={extraProps}
                fallback={fallback}
              >
                {children}
              </ChildLayouts>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

InboxUserLayout.layoutName = 'InboxUserLayout';

export default InboxUserLayout;
