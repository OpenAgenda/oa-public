export default function isInteger(num: unknown): boolean {
  return (
    !Number.isNaN(Number(num)) && Number.isInteger(parseFloat(num as string))
  );
}
