import * as d3 from 'd3';
import Tabulator from 'tabulator-tables';
import noUiSlider from 'nouislider';
import wNumb from 'wnumb';
import * as jsyaml from 'js-yaml';

import * as map from './viz/map';
import * as donut from './viz/donut';
import * as histogramOverTime from './viz/histogramOverTime';
import * as split from './viz/split';
import { getFiltersState } from './util';

import 'tabulator-tables/dist/css/tabulator.min.css';
import 'nouislider/distribute/nouislider.min.css';

// initialize helper values
const datalistIds = [
  'registreeDatalist',
  'statusDatalist',
  'sexDatalist',
  'originDatalist',
  'occupationDatalist',
  'masterDatalist',
  'masterResidenceDatalist',
  'registrationDistrictDatalist',
  'sourcesDatalist',
];

/* eslint-disable */
let predicates = {
  registree: x => true,
  status: x => true,
  sex: x => true,
  origin: x => true,
  age: x => true,
  occupation: x => true,
  master: x => true,
  masterResidence: x => true,
  registrationDate: x => true,
  registrationDistrict: x => true,
  sources: x => true,
};
/* eslint-enable */

// initialize datastores
let data = [];
let filteredData = [];

// initialize viz state
let activeViz = 'map';

// initialize table
const table = new Tabulator(
  '#tableChart',
  {
    height: '500px',
    layout: 'fitColumns',
    pagination: 'local',
    paginationSize: 100,
    columns: [
      // { title: 'ID', field: 'ID' },
      { title: 'Registree', field: 'Registree' },
      { title: 'Status', field: 'Status' },
      { title: 'Sex', field: 'Sex' },
      { title: 'Origin', field: 'Origin' },
      { title: 'Age', field: 'Age' },
      { title: 'Occupation', field: 'Occupation' },
      { title: 'Master', field: 'Master' },
      { title: 'Master Residence', field: 'Master Residence' },
      { title: 'Registration Date', field: 'Registration Date' },
      { title: 'Registration District', field: 'Registration District' },
      { title: 'Sources', field: 'Sources' },
    ],
  },
);

// initialize sliders
const ageSlider = document.getElementById('ageSlider');

noUiSlider.create(ageSlider, {
  start: [0, 100],
  connect: true,
  range: {
    min: 0,
    max: 100,
  },
  tooltips: true,
  format: wNumb({
    decimals: 0,
  }),
  step: 1,
});

const dateSlider = document.getElementById('dateSlider');

noUiSlider.create(dateSlider, {
  start: [1856, 1875],
  connect: true,
  range: {
    min: 1856,
    max: 1875,
  },
  tooltips: true,
  format: wNumb({
    decimals: 0,
  }),
  step: 1,
});

/*
 * HELPER FUNCTIONS
 */
const updateActiveChart = () => {
  console.log(activeViz);
  if (activeViz === 'histogramOverTime') {
    histogramOverTime.update(data, filteredData);
  } else if (activeViz === 'donut') {
    donut.update(data, filteredData);
  } else if (activeViz === 'map') {
    map.update(data, filteredData);
  } else if (activeViz === 'split') {
    split.update(data, filteredData);
  }

  const elem = document.getElementById('vizualizers');
  setTimeout(() => Array.from(document.getElementsByClassName('d3-tip')).forEach(tip => elem.appendChild(tip)), 250);
};

// Fill datalists for dropdowns on control panel
const fillDatalists = () => {
  datalistIds.forEach((datalistId) => {
    const list = document.getElementById(datalistId);
    list.innerHTML = '';

    Array.from([...new Set(filteredData.map(row => row[list.attributes['data-key'].value]))])
      .sort()
      .forEach((val) => {
        const option = document.createElement('option');
        option.value = val;
        list.appendChild(option);
      });
  });
};

const filtersChanged = () => {
  // filter data
  const reducedPredicate = Object
    .values(predicates)
    .reduce((composed, predicate) => item => composed(item) && predicate(item));
  filteredData = data.filter(item => reducedPredicate(item));

  // update affected items
  table.setData(filteredData);
  fillDatalists(filteredData);

  if (filteredData.length === data.length) {
    document.getElementById('filtersHeader').innerHTML = 'Filters';
  } else if (filteredData.length === 1) {
    document.getElementById('filtersHeader').innerHTML = 'Filtered: 1 registree';
  } else {
    document.getElementById('filtersHeader').innerHTML = `Filtered: ${filteredData.length} registrees`;
  }

  updateActiveChart();

  document.getElementById('downloadFilterStateBtn').setAttribute('href', `data:text/plain;charset=utf-8,${jsyaml.dump(getFiltersState())}`);
};

// initialize onchange for all string matching filtering
const registreeFilter = document.getElementById('registreeFilter');
registreeFilter.onchange = () => {
  predicates.registree = obj => (registreeFilter.value === '' ? true : obj.Registree === registreeFilter.value);
  filtersChanged();
};

const statusFilter = document.getElementById('statusFilter');
statusFilter.onchange = () => {
  predicates.status = obj => obj.Status.toLowerCase().includes(statusFilter.value.toLowerCase());
  filtersChanged();
};

const sexFilter = document.getElementById('sexFilter');
sexFilter.onchange = () => {
  predicates.sex = obj => obj.Sex.toLowerCase() === sexFilter.value.toLowerCase();
  filtersChanged();
};

const originFilter = document.getElementById('originFilter');
originFilter.onchange = () => {
  predicates.origin = obj => obj.Origin.toLowerCase().includes(originFilter.value.toLowerCase());
  filtersChanged();
};

const occupationFilter = document.getElementById('occupationFilter');
occupationFilter.onchange = () => {
  predicates.occupation = obj => obj
    .Occupation
    .toLowerCase()
    .includes(occupationFilter.value.toLowerCase());

  filtersChanged();
};

const masterFilter = document.getElementById('masterFilter');
masterFilter.onchange = () => {
  predicates.master = obj => obj.Master.toLowerCase().includes(masterFilter.value.toLowerCase());
  filtersChanged();
};

const masterResidenceFilter = document.getElementById('masterResidenceFilter');
masterResidenceFilter.onchange = () => {
  predicates.masterResidence = obj => obj['Master Residence'].toLowerCase().includes(masterResidenceFilter.value.toLowerCase());
  filtersChanged();
};

const registrationDistrictFilter = document.getElementById('registrationDistrictFilter');
registrationDistrictFilter.onchange = () => {
  predicates.registrationDistrict = obj => obj['Registration District'].toLowerCase().includes(registrationDistrictFilter.value.toLowerCase());
  filtersChanged();
};

const sourcesFilter = document.getElementById('sourcesFilter');
sourcesFilter.onchange = () => {
  predicates.sources = obj => obj.Sources.toLowerCase().includes(sourcesFilter.value.toLowerCase());
  filtersChanged();
};

// initialize onchange for slider filtering
const initOnSetForSliders = () => {
  ageSlider.noUiSlider.on('set', (values) => {
    const res = values.map(x => parseFloat(x));
    predicates.age = obj => parseFloat(obj.Age) >= res[0] && parseFloat(obj.Age) <= res[1];
    filtersChanged();
  });

  dateSlider.noUiSlider.on('set', (values) => {
    const res = values.map(x => parseFloat(x));

    predicates.registrationDate = (obj) => {
      const year = obj['Registration Date'].substr(0, 4);
      return year >= res[0] && year <= res[1];
    };
    filtersChanged();
  });
};
initOnSetForSliders();

// initialize onclick for reset filters button
const resetFiltersButton = document.getElementById('resetFiltersButton');
resetFiltersButton.onclick = () => {
  registreeFilter.value = '';
  statusFilter.value = '';
  sexFilter.value = '';
  originFilter.value = '';
  occupationFilter.value = '';
  masterFilter.value = '';
  masterResidenceFilter.value = '';
  registrationDistrictFilter.value = '';
  sourcesFilter.value = '';

  ageSlider.noUiSlider.set([0, 100]);
  dateSlider.noUiSlider.set([1856, 1875]);

  /* eslint-disable no-unused-vars */
  predicates = {
    registree: x => true,
    status: x => true,
    origin: x => true,
    age: x => true,
    occupation: x => true,
    master: x => true,
    masterResidence: x => true,
    registrationDate: x => true,
    registrationDistrict: x => true,
    sources: x => true,
  };
  /* eslint-enable no-unused-vars */

  filtersChanged();
};

// initialize onclick for viz tabs
/* eslint-disable */
Array.from(document.getElementsByClassName('w3-bar-item'))
.filter((button) => !(button.id === 'toggleFilterButton' || button.id === 'fullscreenButton' || button.id === 'resetFiltersButton'))
.forEach((button) => {
  button.onclick = () => {
    Array.from(document.getElementsByClassName('viz')).forEach((elem) => {
      elem.style.display = 'none';
    });
    Array.from(document.getElementsByClassName('w3-bar-item'))
    .filter((button) => !(button.id === 'toggleFilterButton' || button.id === 'fullscreenButton' || button.id === 'resetFiltersButton'))
    .forEach((elem) => {
      elem.className = 'w3-bar-item w3-button w3-light-gray';
    });

    document.getElementById(button.id.substring(0, button.id.length - 6)).style.display = 'block';
    button.className = 'w3-bar-item w3-button w3-dark-gray';

    activeViz = button.id.substring(0, button.id.length - 6);
    updateActiveChart();
  };
});
/* eslint-enable */

let isFiltersHidden = false;
const toggleHideFilters = () => {
  const filters = document.getElementById('filters');
  const viz = document.getElementById('vizualizers');
  const button = document.getElementById('toggleFilterButton');

  if (isFiltersHidden) {
    isFiltersHidden = false;

    filters.style.width = '50%';
    viz.style.width = '50%';

    // button.innerHTML = '<i class="fas fa-caret-left"></i>';
    button.innerHTML = '<i class="fa fa-caret-left"></i>';

    // we need to do this halving and doubling because the transition makes the width
    // not take effect instantly
    map.init(data, filteredData, 600, viz.offsetWidth / 2 - 10);
    donut.init(data, filteredData, 600, viz.offsetWidth / 2 - 10);
    histogramOverTime.init(data, filteredData, 600, viz.offsetWidth / 2 - 10);
    split.init(data, filteredData, 600, viz.offsetWidth / 2 - 10);
  } else {
    isFiltersHidden = true;

    filters.style.width = '0%';
    viz.style.width = '100%';

    // button.innerHTML = '<i class="fas fa-caret-right"></i>';
    button.innerHTML = '<i class="fa fa-caret-left"></i>';


    map.init(data, filteredData, 600, viz.offsetWidth * 2 - 10);
    donut.init(data, filteredData, 600, viz.offsetWidth * 2 - 10);
    histogramOverTime.init(data, filteredData, 600, viz.offsetWidth * 2 - 10);
    split.init(data, filteredData, 600, viz.offsetWidth * 2 - 10);
  }
};
document.getElementById('toggleFilterButton').onclick = toggleHideFilters;

// fullscreen
const openFullscreen = () => {
  const elem = document.getElementById('vizualizers');

  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) { /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE/Edge */
    elem.msRequestFullscreen();
  }

  const bar = document.getElementById('bar');

  // have to lag for whatever reason
  setTimeout(() => {
    map.init(data, filteredData, elem.offsetHeight - bar.offsetHeight - 100, elem.offsetWidth);
    donut.init(data, filteredData, elem.offsetHeight - bar.offsetHeight - 100, elem.offsetWidth);
    histogramOverTime.init(
      data, filteredData, elem.offsetHeight - bar.offsetHeight - 100, elem.offsetWidth,
    );
    split.init(data, filteredData, elem.offsetHeight - bar.offsetHeight - 100, elem.offsetWidth);
    table.setHeight(elem.offsetHeight - bar.offsetHeight - 100);

    setTimeout(() => Array.from(document.getElementsByClassName('d3-tip')).forEach(tip => elem.appendChild(tip)), 250);
  }, 500);

  // eslint-disable-next-line no-use-before-define
  document.getElementById('fullscreenButton').onclick = closeFullscreen;
  document.getElementById('toggleFilterButton').onclick = () => {};
  // document.getElementById('fullscreenButton').innerHTML = '<i class="fas fa-compress"></i>';
  document.getElementById('fullscreenButton').innerHTML = '<i class="fa fa-compress"></i>';
};

const closeFullscreen = () => {
  const elem = document.getElementById('vizualizers');

  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) { /* Firefox */
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE/Edge */
    document.msExitFullscreen();
  }
  setTimeout(() => {
    map.init(data, filteredData, 600, elem.offsetWidth - 10);
    donut.init(data, filteredData, 600, elem.offsetWidth - 10);
    histogramOverTime.init(data, filteredData, 600, elem.offsetWidth - 10);
    split.init(data, filteredData, 600, elem.offsetWidth - 10);
    table.setHeight(500);
  }, 500);

  document.getElementById('fullscreenButton').onclick = openFullscreen;
  document.getElementById('toggleFilterButton').onclick = toggleHideFilters;
  // document.getElementById('fullscreenButton').innerHTML = '<i class="fas fa-expand"></i>';
  document.getElementById('fullscreenButton').innerHTML = '<i class="fa fa-expand"></i>';
};

document.getElementById('fullscreenButton').onclick = openFullscreen;

// initialize onchange for internal viz selectors
document.getElementById('donutSelect').onchange = updateActiveChart;
document.getElementById('mapSelect').onchange = updateActiveChart;

document.getElementById('splitDonutSelect').onchange = updateActiveChart;
document.getElementById('splitMapSelect').onchange = updateActiveChart;

// load data
d3.csv('boc.csv').then((rawData) => {
// d3.csv('../wp-content/uploads/2019/05/boc.csv').then((rawData) => {
  data = rawData.slice(0);
  filteredData = rawData.slice(0);

  table.setData(rawData);

  fillDatalists();

  const viz = document.getElementById('vizualizers');
  map.init(data, filteredData, 600, viz.offsetWidth - 10);
  donut.init(data, filteredData, 600, viz.offsetWidth - 10);
  histogramOverTime.init(data, filteredData, 600, viz.offsetWidth - 10);
  split.init(data, filteredData, 600, viz.offsetWidth - 10);

  document.getElementById('downloadFilteredBtn').onclick = () => table.download('csv', 'OceansAndContinentsFiltered.csv');
  document.getElementById('downloadFilterStateBtn').setAttribute('href', `data:text/plain;charset=utf-8,${jsyaml.dump(getFiltersState())}`);
});
