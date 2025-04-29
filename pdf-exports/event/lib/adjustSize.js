export default function adjustSize(size, childBlockSize) {
  const args = { size, childBlockSize };
  Object.keys(args).forEach((ns) => {
    ['height', 'width'].forEach((s) => {
      if (Number.isNaN(args[ns][s])) {
        throw new Error(
          `provided ${ns}.${s} is not a number: ${args[ns]?.[s]}`,
        );
      }
    });
  });
  size.height += childBlockSize.height;
  size.width = Math.max(childBlockSize.width, size.width);
}
