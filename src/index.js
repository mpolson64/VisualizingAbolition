import * as d3 from 'd3';
import Tabulator from 'tabulator-tables';
import noUiSlider from 'nouislider';
import wNumb from 'wnumb';
import * as jsyaml from 'js-yaml';

import * as map from './viz/map';
import * as donut from './viz/donut';
import * as histogramOverTime from './viz/histogramOverTime';
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
const predicates = {
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
/* eslint-enable */

// initialize datastores
let data = [];
let filteredData = [];

// initialize viz state
let activeViz = 'map';

// initialize table
const table = new Tabulator(
  '#table',
  {
    height: '500px',
    layout: 'fitColumns',
    pagination: 'local',
    paginationSize: 20,
    columns: [
      // { title: 'ID', field: 'ID' },
      { title: 'Registree', field: 'Registree' },
      { title: 'Status', field: 'Status' },
      { title: 'Sex', field: 'Sex' },
      { title: 'Origin', field: 'Origin' },
      { title: 'Age', field: 'Age' },
      { title: 'Occupation', field: 'Occupation' },
      { title: 'Master', field: 'Master' },
      { title: 'Master Residence', field: 'Registree' },
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
// Fill datalists for dropdowns on control panel
const updateActiveChart = () => {
  if (activeViz === 'histogramOverTime') {
    histogramOverTime.update(data, filteredData);
  } else if (activeViz === 'donut') {
    donut.update(data, filteredData);
  } else if (activeViz === 'map') {
    map.update(data, filteredData);
  }
};

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

// update everything when the filters change
const filtersChanged = (key, newPredicate) => {
  // set predicates and filter data
  predicates[key] = newPredicate;
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

  document.getElementById('downloadFilteredBtn').setAttribute('href', `data:text/plain;charset=utf-8,${d3.csvFormat(filteredData)}`);
  document.getElementById('downloadFilterStateBtn').setAttribute('href', `data:text/plain;charset=utf-8,${jsyaml.dump(getFiltersState())}`);
};

// initialize onchange for all string matching filtering
const registreeFilter = document.getElementById('registreeFilter');
registreeFilter.onchange = () => {
  filtersChanged('registree', obj => (registreeFilter.value === '' ? true : obj.Registree === registreeFilter.value));
};

const statusFilter = document.getElementById('statusFilter');
statusFilter.onchange = () => {
  filtersChanged('status', obj => (statusFilter.value === '' ? true : obj.Status === statusFilter.value));
};

const sexFilter = document.getElementById('sexFilter');
sexFilter.onchange = () => {
  filtersChanged('sex', obj => (sexFilter.value === '' ? true : obj.Sex === sexFilter.value));
};

const originFilter = document.getElementById('originFilter');
originFilter.onchange = () => {
  filtersChanged('origin', obj => (originFilter.value === '' ? true : obj.Origin === originFilter.value));
};

const occupationFilter = document.getElementById('occupationFilter');
occupationFilter.onchange = () => {
  filtersChanged('occupation', obj => (occupationFilter.value === '' ? true : obj.Occupation === occupationFilter.value));
};

const masterFilter = document.getElementById('masterFilter');
masterFilter.onchange = () => {
  filtersChanged('master', obj => (masterFilter.value === '' ? true : obj.Master === masterFilter.value));
};

const masterResidenceFilter = document.getElementById('masterResidenceFilter');
masterResidenceFilter.onchange = () => {
  filtersChanged('masterResidence', obj => (masterResidenceFilter.value === '' ? true : obj['Master Residence'] === masterResidenceFilter.value));
};

const registrationDistrictFilter = document.getElementById('registrationDistrictFilter');
registrationDistrictFilter.onchange = () => {
  filtersChanged('registrationDistrict', obj => (registrationDistrictFilter.value === '' ? true : obj['Registration District'] === registrationDistrictFilter.value));
};

const sourcesFilter = document.getElementById('sourcesFilter');
sourcesFilter.onchange = () => {
  filtersChanged('sources', obj => (sourcesFilter.value === '' ? true : obj.Sources === sourcesFilter.value));
};

// initialize onchange for slider filtering
ageSlider.noUiSlider.on('set', (values) => {
  const res = values.map(x => parseFloat(x));
  filtersChanged('age', obj => parseFloat(obj.Age) >= res[0] && parseFloat(obj.Age) <= res[1]);
});

dateSlider.noUiSlider.on('set', (values) => {
  const res = values.map(x => parseFloat(x));

  filtersChanged('registrationDate',
    (obj) => {
      const year = obj['Registration Date'].substr(0, 4);
      return year >= res[0] && year <= res[1];
    });
});

// initialize onclick for viz tabs
/* eslint-disable */
Array.from(document.getElementsByClassName('w3-bar-item')).forEach((button) => {
  button.onclick = () => {
    Array.from(document.getElementsByClassName('viz')).forEach((elem) => {
      elem.style.display = 'none';
    });
    Array.from(document.getElementsByClassName('w3-bar-item')).forEach((elem) => {
      elem.className = 'w3-bar-item w3-button w3-light-gray';
    });

    document.getElementById(button.id.substring(0, button.id.length - 6)).style.display = 'block';
    button.className = 'w3-bar-item w3-button w3-dark-gray';

    activeViz = button.id.substring(0, button.id.length - 6);
    updateActiveChart();
  };
});
/* eslint-enable */

// initialize onchange for internal viz selectors
document.getElementById('donutSelect').onchange = updateActiveChart;
document.getElementById('mapSelect').onchange = updateActiveChart;

// load data
// d3.csv('boc.csv').then((rawData) => {
d3.csv('../wp-content/uploads/2019/05/boc.csv').then((rawData) => {
  data = rawData.slice(0);
  filteredData = rawData.slice(0);

  table.setData(rawData);

  fillDatalists();

  map.init(data, filteredData);
  donut.init(data, filteredData);
  histogramOverTime.init(data, filteredData);

  document.getElementById('downloadFilteredBtn').setAttribute('href', `data:text/plain;charset=utf-8,${d3.csvFormat(filteredData)}`);
  document.getElementById('downloadFilterStateBtn').setAttribute('href', `data:text/plain;charset=utf-8,${jsyaml.dump(getFiltersState())}`);
});
