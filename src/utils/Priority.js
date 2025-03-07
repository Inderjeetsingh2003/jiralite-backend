 export const PriorityMap = {
  High: 1,
  Medium: 2,
  Low: 3,
};



export const valueToPriority = (value) => {
  const reversedMap = Object.fromEntries(
    Object.entries(PriorityMap).map(([key, value]) => {
      return [value, key];
    })
  );
  return reversedMap[value] || null;
};
