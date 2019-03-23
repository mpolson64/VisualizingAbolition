import * as d3 from 'd3';
import Tabulator from 'tabulator-tables';
import noUiSlider from 'nouislider';
import wNumb from 'wnumb';

import * as histogramOverTime from './viz/histogramOverTime';
import * as pie from './viz/pie';

import 'tabulator-tables/dist/css/tabulator.min.css';
import 'nouislider/distribute/nouislider.min.css';

// initialize helper values
const checkIds = [
  'idCheck',
  'registreeCheck',
  'statusCheck',
  'sexCheck',
  'originCheck',
  'ageCheck',
  'occupationCheck',
  'masterCheck',
  'masterResidenceCheck',
  'registrationDateCheck',
  'registrationDistrictCheck',
  'sourcesCheck',
];
const datalistIds = [
  'registreeDatalist',
  'originDatalist',
  'occupationDatalist',
  'masterDatalist',
  'masterResidenceDatalist',
  'registrationDistrictDatalist',
  'sourcesDatalist',
];

/* eslint-disable */
const predicates = {
  id: x => true,
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
let activeViz = 'histogramOverTime';

// initialize table
const table = new Tabulator(
  '#table',
  {
    height: '200px',
    layout: 'fitColumns',
    pagination: 'local',
    paginationSize: 20,
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
  console.log(activeViz);
  
  if (activeViz === 'histogramOverTime') {
    histogramOverTime.update(data, filteredData);
  }
  else if (activeViz === 'pie') {
    pie.update(data, filteredData);
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

// update cols of table when the show? checkboxes are changed
const showChanged = () => {
  const newColumns = [];

  checkIds.forEach((checkId) => {
    const checkbox = document.getElementById(checkId);

    if (checkbox.checked) {
      newColumns.push({
        title: checkbox.value,
        field: checkbox.value,
        bottomCalc: checkId === 'idCheck' ? 'count' : null,
      });
    }
  });

  table.setColumns(newColumns);
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

  updateActiveChart();
};

// initialize onclicks for checkboxes
checkIds.forEach((checkId) => {
  const checkbox = document.getElementById(checkId);
  checkbox.onclick = showChanged;
});

// initialize onchange for id filtering
const idFilter = document.getElementById('idFilter');
idFilter.onchange = () => {
  filtersChanged('id', obj => (idFilter.value === '' ? true : obj.ID === idFilter.value));
};

// initialize onchange for all string matching filtering
const registreeFilter = document.getElementById('registreeFilter');
registreeFilter.onchange = () => {
  filtersChanged('registree', obj => (registreeFilter.value === '' ? true : obj.Registree === registreeFilter.value));
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

// initialize onchange for radio button filtering
const freedRadio = document.getElementById('freedRadio');
freedRadio.onclick = () => {
  filtersChanged('status', obj => obj.Status === 'Freed');
};
const slaveRadio = document.getElementById('slaveRadio');
slaveRadio.onclick = () => {
  filtersChanged('status', obj => obj.Status === 'Slave');
};
const anyStatusRadio = document.getElementById('anyStatusRadio');
anyStatusRadio.onclick = () => {
  filtersChanged('status', obj => true); // eslint-disable-line no-unused-vars
};

const maleRadio = document.getElementById('maleRadio');
maleRadio.onclick = () => {
  filtersChanged('sex', obj => obj.Sex === 'Male');
};
const femaleRadio = document.getElementById('femaleRadio');
femaleRadio.onclick = () => {
  filtersChanged('sex', obj => obj.Sex === 'Female');
};
const unspecifiedRadio = document.getElementById('unspecifiedRadio');
unspecifiedRadio.onclick = () => {
  filtersChanged('sex', obj => obj.Sex === 'Unspecified');
};
const anySexRadio = document.getElementById('anySexRadio');
anySexRadio.onclick = () => {
  filtersChanged('sex', obj => true); // eslint-disable-line no-unused-vars
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

// load data
d3.csv('boc.csv').then((rawData) => {
  data = rawData.slice(0);
  filteredData = rawData.slice(0);

  table.setData(rawData);

  fillDatalists();
  showChanged();

  histogramOverTime.init(data, filteredData);
  pie.init(data, filteredData);
});
