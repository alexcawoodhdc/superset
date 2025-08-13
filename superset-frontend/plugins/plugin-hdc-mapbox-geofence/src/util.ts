
export function findIntersectedObjects(
    arrays: any[],
    fieldName: string,
    minCount: number = 2
) {
  /*
    {
      id(fieldName): [array_idx1, array_idx2, ...],
    }

  */
  const uniqueArraysMatched: { [key: string]: number[] } = {};
  

  arrays.forEach((array, idx) => {
    array.forEach((item: any) => {
      if (!uniqueArraysMatched.hasOwnProperty(item[fieldName])) {
        uniqueArraysMatched[item[fieldName]] = [];
      }

      if (!uniqueArraysMatched[item[fieldName]].includes(idx)) {
        uniqueArraysMatched[item[fieldName]].push(idx);
      }

    })
  })

  // console.log('uniqueArraysMatched', uniqueArraysMatched);
  const ret: { [fieldName]: string; }[] = []

  Object.keys(uniqueArraysMatched).forEach(key => {
    if (uniqueArraysMatched[key].length >= minCount) {
      console.log('found intersected object', key, uniqueArraysMatched[key]);
      ret.push({
        [fieldName]: key,
      });
    }
  });
  return ret;
}