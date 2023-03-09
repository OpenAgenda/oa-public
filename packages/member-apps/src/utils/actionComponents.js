export default ({ getLabel, label }) => [
  {
    position: 'bottom',
    Component: ({ onSubmit }) => (
      <div className="text-center">
        <button
          type="submit"
          className="btn btn-primary"
          onClick={() => onSubmit()}
        >
          {getLabel(label)}
        </button>
      </div>
    ),
  },
];
