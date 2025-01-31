import React, { useRef } from 'react';

export default function UserSearch({ onSearchSubmit }) {
  const searchRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const searchValue = searchRef.current.value;
    onSearchSubmit(searchValue);
  };

  return (
    <form className="form-inline" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="search"></label>
        <input type="text" placeholder="search" ref={searchRef} name="search" className="form-control" />
      </div>
      <button type="submit" className="btn btn-default">Ok</button>
    </form>
  );
}
