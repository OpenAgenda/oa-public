export default getLabel => [
  {
    position: 'bottom',
    Component: ({ onSubmit }) => (
      <div className="text-center">
        <button
          type="submit"
          className="btn btn-primary"
          onClick={() => onSubmit()}
        >
          {getLabel('inviteMembers')}
        </button>
      </div>
    ),
  },
];
