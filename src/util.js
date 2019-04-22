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
    const coord = [obj[`${extractor} Latitude`], obj[`${extractor} Longitude`]].map(transform);

    temp[coord] = {};
    temp[coord].count = 0;
    temp[coord].tags = new Set();
  });

  filteredData.forEach((obj) => {
    const coord = [obj[`${extractor} Latitude`], obj[`${extractor} Longitude`]].map(transform);

    temp[coord].count += 1;
    temp[coord].tags.add(obj[extractor]);
  });

  Object.keys(temp).forEach((key) => {
    res.push({
      key,
      value: temp[key].count,
      tags: temp[key].tags,
    });
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

const tooltip = (key, value) => `${key}: ${value} ${value === 1 ? 'registree' : 'registrees'}`;

const getFiltersState = () => ({
  Registree: document.getElementById('registreeFilter').value,
  Status: document.getElementById('statusFilter').value,
  Sex: document.getElementById('sexFilter').value,
  Origin: document.getElementById('originFilter').value,
  Age: document.getElementById('ageSlider').noUiSlider.get(),
  Occupation: document.getElementById('occupationFilter').value,
  Master: document.getElementById('masterFilter').value,
  'Master Residence': document.getElementById('masterResidenceFilter').value,
  'Registration Date': document.getElementById('dateSlider').noUiSlider.get(),
  'Registration District': document.getElementById('registrationDistrictFilter').value,
  Sources: document.getElementById('sourcesFilter').value,
});

export {
  histogram, histogramNumberic, histogramLocation, coalesceHistogram, tooltip, getFiltersState,
};
