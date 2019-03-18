const histogram = (data, extractor, transform) => {
  const res = [];
  const temp = {};

  data.forEach((obj) => {
    const transformed = transform(obj[extractor]);

    if (transformed in temp) {
      temp[transformed] += 1;
    } else {
      temp[transformed] = 1;
    }
  });

  Object.keys(temp).forEach((key) => {
    res.push({
      key,
      count: temp[key],
    });
  });

  return res;
};

export { histogram as default };
