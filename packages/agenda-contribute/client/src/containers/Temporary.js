import React from 'react';
import { useSelector } from 'react-redux';

export default function Temporary({ agenda }) {
  const message = useSelector(state => state.message ?? 'Bif bof');

  return (
    <div>{message} {agenda.title}</div>
  );
}
