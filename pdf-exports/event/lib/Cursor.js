function move(cursor, direction, value) {
  cursor[direction] += value ?? 0;
}

export default function Cursor(parentCursor = { x: 0, y: 0 }) {
  const cursor = { ...parentCursor };

  return Object.assign(cursor, {
    moveX: move.bind(null, cursor, 'x'),
    moveY: move.bind(null, cursor, 'y'),
    setY: (y) => {
      cursor.y = y;
    },
    reset: () => {
      cursor.y = parentCursor.y;
      cursor.x = parentCursor.x;
    },
    moveBoth: (value) => {
      move(cursor, 'x', value);
      move(cursor, 'y', value);
    },
  });
}
