import * as d3 from 'd3';
import Tabulator from 'tabulator-tables';
import noUiSlider from 'nouislider';
import wNumb from 'wnumb';
import screenfull from 'screenfull';

import * as map from './viz/map';
import * as donut from './viz/donut';
import * as histogramOverTime from './viz/histogramOverTime';
import * as split from './viz/split';
import { getFiltersState } from './util';

import 'tabulator-tables/dist/css/tabulator.min.css';
import 'nouislider/distribute/nouislider.min.css';

// initialize helper values
const datalistIds = [
  'senderDatalist',
  'receiverDatalist',
  'imputedOriginDatalist',
  'sourceDatalist',
];

/* eslint-disable */
let predicates = {
  sent: x => true,
  received: x => true,
  summary: x => true,
  sender: x => true,
  receiver: x => true,
  imputed_origin: x => true,
  source: x => true,
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
      { title: 'Sender', field: 'sender' },
      { title: 'Receiver', field: 'receiver' },
      { title: 'Origin', field: 'origin' },
      { title: 'Sent', field: 'dateSent' },
      { title: 'Received', field: 'dateReceived' },
      { title: 'Summary', field: 'summary' },
    ],
  },
);

// initialize sliders
const sentSlider = document.getElementById('sentSlider');

noUiSlider.create(sentSlider, {
  start: [1800, 1900],
  connect: true,
  range: {
    min: 1800,
    max: 1900,
  },
  tooltips: true,
  format: wNumb({
    decimals: 0,
  }),
  step: 1,
});

const receivedSlider = document.getElementById('receivedSlider');

noUiSlider.create(receivedSlider, {
  start: [1800, 1900],
  connect: true,
  range: {
    min: 1800,
    max: 1900,
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

  document.getElementById('downloadFilterStateBtn').setAttribute('href', `data:text/plain;charset=utf-8,${JSON.stringify(getFiltersState())}`);
};

// initialize onchange for all string matching filtering
const senderFilter = document.getElementById('senderFilter');
senderFilter.onchange = () => {
  predicates.sender = obj => obj.sender.toLowerCase().includes(senderFilter.value.toLowerCase());
  filtersChanged();
};

const receiverFilter = document.getElementById('receiverFilter');
receiverFilter.onchange = () => {
  predicates.receiver = obj => (obj.receiver !== undefined ? obj.receiver.toLowerCase().includes(receiverFilter.value.toLowerCase()) : false);
  filtersChanged();
};

const imputedOriginFilter = document.getElementById('imputedOriginFilter');
imputedOriginFilter.onchange = () => {
  predicates.imputed_origin = obj => (obj.impor !== undefined ? obj.impor.toLowerCase().includes(imputedOriginFilter.value.toLowerCase()) : false);
  filtersChanged();
};

const sourceFilter = document.getElementById('sourceFilter');
sourceFilter.onchange = () => {
  predicates.source = obj => obj.source.toLowerCase().includes(sourceFilter.value.toLowerCase());
  filtersChanged();
};

// initialize onchange for slider filtering
const initOnSetForSliders = () => {
  sentSlider.noUiSlider.on('set', (values) => {
    const res = values.map(x => parseFloat(x));

    predicates.sent = (obj) => {
      const year = obj.dateSent.substr(0, 4);
      return year >= res[0] && year <= res[1];
    };
    filtersChanged();
  });

  receivedSlider.noUiSlider.on('set', (values) => {
    const res = values.map(x => parseFloat(x));

    predicates.received = (obj) => {
      const year = obj.dateReceived.substr(0, 4);
      return year >= res[0] && year <= res[1];
    };
    filtersChanged();
  });
};
initOnSetForSliders();

// initialize onclick for reset filters button
const resetFiltersButton = document.getElementById('resetFiltersButton');
resetFiltersButton.onclick = () => {
  senderFilter.value = '';
  receiverFilter.value = '';
  imputedOriginFilter.value = '';
  sourceFilter.value = '';

  /* eslint-disable no-unused-vars */
  predicates = {
    sent: x => true,
    received: x => true,
    summary: x => true,
    sender: x => true,
    receiver: x => true,
    imputed_origin: x => true,
    source: x => true,
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
      elem.className = elem.id !== 'splitButton' ? 'w3-bar-item w3-button w3-light-gray' : 'w3-bar-item w3-button w3-light-gray w3-right';
    });

    document.getElementById(button.id.substring(0, button.id.length - 6)).style.display = 'block';
    button.className = button.id !== 'splitButton' ? 'w3-bar-item w3-button w3-dark-gray' : 'w3-bar-item w3-button w3-dark-gray w3-right';

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
    button.innerHTML = '<i class="fa fa-caret-right"></i>';


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

  screenfull.request(elem);

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
  }, 500);

  // eslint-disable-next-line no-use-before-define
  document.getElementById('fullscreenButton').onclick = closeFullscreen;
  document.getElementById('toggleFilterButton').onclick = () => {};
  // document.getElementById('fullscreenButton').innerHTML = '<i class="fas fa-compress"></i>';
  document.getElementById('fullscreenButton').innerHTML = '<i class="fa fa-compress"></i>';
};

const closeFullscreen = () => {
  const elem = document.getElementById('vizualizers');

  screenfull.exit(elem);

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

// disable fullscreen in Safari lol (Dear my replacement: This is awful pls dont emulate me. -mpo)
const isSafari = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
if (isSafari) {
  document.getElementById('fullscreenButton').parentElement.removeChild(document.getElementById('fullscreenButton'));
}

// load data
// d3.csv('boc.csv').then((rawData) => {
// // d3.csv('../wp-content/uploads/2019/05/boc.csv').then((rawData) => {
//   data = rawData.slice(0);
//   filteredData = rawData.slice(0);

//   table.setData(rawData);

//   fillDatalists();

//   const viz = document.getElementById('vizualizers');
//   map.init(data, filteredData, 600, viz.offsetWidth - 10);
//   donut.init(data, filteredData, 600, viz.offsetWidth - 10);
//   histogramOverTime.init(data, filteredData, 600, viz.offsetWidth - 10);
//   split.init(data, filteredData, 600, viz.offsetWidth - 10);

//   document.getElementById('downloadFilteredBtn').onclick = () => table.download('csv', 'OceansAndContinentsFiltered.csv');
//   document.getElementById('downloadFilterStateBtn').setAttribute('href', `data:text/plain;charset=utf-8,${JSON.stringify(getFiltersState())}`);
// });

const request = new XMLHttpRequest();
request.open('GET', 'database17.json', true);

request.onload = (_error) => {
  data = JSON.parse(request.responseText);
  console.log(data);

  filteredData = data;

  table.setData(data);

  fillDatalists();
};

request.send(null);
