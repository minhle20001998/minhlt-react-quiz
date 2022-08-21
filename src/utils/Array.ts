export const createArrayFromRange = (start: number, end: number) => {
  return Array.from(Array(end - start + 1).keys()).map(x => x + start);
}