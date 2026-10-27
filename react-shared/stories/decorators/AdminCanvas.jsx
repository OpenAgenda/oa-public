// A body card of the administration frame, for a component on its own.
export default (Story) => (
  <div className="agenda-admin">
    <div className="oa-admin-container oa-admin-columns">
      <div className="oa-admin-card oa-admin-main">
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
);
