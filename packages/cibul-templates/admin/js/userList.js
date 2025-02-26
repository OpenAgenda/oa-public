import React from 'react';

export default function UserList({ users, onUserClick }) {
  const handleClick = (item, e) => {
    e.preventDefault();
    onUserClick(item.uid);
  };

  return (
    <ul className="list-group">
      {users.map((item) => (
        <li className="list-group-item" key={item.uid} onClick={(e) => handleClick(item, e)}>
          <a href="#">
            <span>{item.fullName}</span> - <span>{item.email}</span>
            {item.isRemoved ? <span style={{ color: 'brown' }}> Account removed</span> : null}
          </a>
        </li>
      ))}
    </ul>
  );
}
