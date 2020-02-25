const histogram = (data, filteredData, extractor, transform) => {
  const res = [];
  const temp = {};

  data.forEach((obj) => {
    temp[transform(obj[extractor])] = 0;
  });

  filteredData.forEach((obj) => {
    temp[transform(obj[extractor])] += 1;
  });

  Object.keys(temp).forEach((key) => {
    res.push({
      key,
      value: temp[key],
    });
  });

  return res;
};

const histogramNumberic = (data, filteredData, extractor, transform) => {
  const res = [];
  const temp = {};

  data.forEach((obj) => {
    temp[transform(obj[extractor])] = 0;
  });

  filteredData.forEach((obj) => {
    temp[transform(obj[extractor])] += 1;
  });

  Object.keys(temp).forEach((key) => {
    res.push({
      x: parseFloat(key),
      y: temp[key],
    });
  });

  return res;
};

const histogramLocation = (data, filteredData, extractor, transform) => {
  const res = [];
  const temp = {};

  data.forEach((obj) => {
    const coord = [obj[`${extractor} Latitude`], obj[`${extractor} Longitude`]];

    temp[coord] = {};
    temp[coord].count = 0;
    temp[coord].tags = new Set();
  });

  filteredData.forEach((obj) => {
    const coord = [obj[`${extractor} Latitude`], obj[`${extractor} Longitude`]];

    temp[coord].count += 1;
    temp[coord].tags.add(transform(obj[extractor]));
  });

  Object.keys(temp).forEach((key) => {
    if (!temp[key].tags.has('Unspecified')) {
      res.push({
        key,
        value: temp[key].count,
        tags: temp[key].tags,
      });
    }
  });

  return res;
};

const coalesceHistogram = (hist) => {
  const temp = {};
  const res = [];

  hist.forEach((elem) => {
    if (elem.value !== 0) {
      temp[elem.key] = elem.value;
    }
  });

  Object.keys(temp).forEach((key) => {
    res.push({
      key,
      value: temp[key],
    });
  });

  return res;
};

const updateMouseover = (key, value) => {
  const label = document.getElementById('mouseover');
  label.innerHTML = `${key}: ${value} ${value !== 1 ? 'registrees' : 'registree'}`;
};

const resetMousover = () => {
  const label = document.getElementById('mouseover');
  label.innerHTML = 'Hover over an element for details...';
};

const getFiltersState = () => ({
  sender: document.getElementById('sourceFilter').value,
  receiver: document.getElementById('receiverFilter').value,
  imputed_origin: document.getElementById('imputedOriginFilter').value,
  source: document.getElementById('sourceFilter').value,
});

export {
  histogram,
  histogramNumberic,
  histogramLocation,
  coalesceHistogram,
  updateMouseover,
  resetMousover,
  getFiltersState,
};
