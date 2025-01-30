import React from 'react';

export default function UserPagination({ total, perPage, page, onPageSelect }) {
  const pageCount = Math.ceil(total / perPage);
  const firstPage = Math.max(1, page - 5);
  const maxPage = Math.min(page + 5, pageCount);

  const pages = Array.from({ length: maxPage - firstPage + 1 }, (_, i) => firstPage + i);

  return (
    <nav>
      <ul className="pagination">
        {pages.map((item) => (
          <li key={item} onClick={() => onPageSelect(item)}>
            <a href="#">{item}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
