type NumberArray = Array<number>;

const average = (arr: NumberArray) =>
  arr.reduce((memo, val) => memo + val, 0) / arr.length;

// Limit array size by cutting off from the start
const limit = (arr: NumberArray, maxLength = 10) => {
  const deleteCount = Math.max(0, arr.length - maxLength);

  return arr.slice(deleteCount);
};

export { average, limit };
