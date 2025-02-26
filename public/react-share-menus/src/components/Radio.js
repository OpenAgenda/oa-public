const Radio = ({ id, content, name, setChoice, defaultChecked = false }) => {
  const handleChange = (e) => {
    setChoice(e.target.value, e.target.id);
  };

  return (
    <div className="radio" onChange={handleChange}>
      <label htmlFor={id}>
        <input
          className=""
          type="radio"
          name={name}
          id={id}
          value={content}
          defaultChecked={defaultChecked}
        />
        {content}
      </label>
    </div>
  );
};

export default Radio;
