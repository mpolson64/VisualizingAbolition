import * as d3v4 from 'd3';
import * as Datamap from 'datamaps';
import d3Tip from 'd3-tip';
import { histogramLocation, tooltip } from '../util';

const radiusScaling = 0.5;

let map;

const update = (data, filteredData) => {
  let bubbleData;

  const view = document.getElementById('mapSelect').value;

  if (view === 'Origin') {
    const histLoc = histogramLocation(data, filteredData, 'Origin', x => x.match(/\(([^)]+)\)/).pop());

    bubbleData = histLoc.map((elem) => {
      const coord = elem.key.split(',').map(parseFloat);
      return {
        name: [...elem.tags].join(', '),
        count: elem.value,
        radius: Math.sqrt(elem.value) * 1.25, // area of circle proportional
        latitude: coord[0],
        longitude: coord[1],
        fillKey: 'origin',
      };
    });
  } else if (view === 'Registration District') {
    const histLoc = histogramLocation(data, filteredData, 'Registration District', x => x);

    bubbleData = histLoc.map((elem) => {
      const coord = elem.key.split(',').map(parseFloat);
      return {
        name: [...elem.tags].join(', '),
        count: elem.value,
        radius: Math.sqrt(elem.value) * radiusScaling, // area of circle proportional
        latitude: coord[0],
        longitude: coord[1],
        fillKey: 'district',
      };
    });
  } else {
    const histLocOrigin = histogramLocation(data, filteredData, 'Origin', x => x.match(/\(([^)]+)\)/).pop());

    const bubbleDataOrigin = histLocOrigin.map((elem) => {
      const coord = elem.key.split(',').map(parseFloat);
      return {
        name: [...elem.tags].join(', '),
        count: elem.value,
        radius: Math.sqrt(elem.value) * 1.25, // area of circle proportional
        latitude: coord[0],
        longitude: coord[1],
        fillKey: 'origin',
      };
    });

    const histLocDistrict = histogramLocation(data, filteredData, 'Registration District', x => x);

    const bubbleDataDistrict = histLocDistrict.map((elem) => {
      const coord = elem.key.split(',').map(parseFloat);
      return {
        name: [...elem.tags].join(', '),
        count: elem.value,
        radius: Math.sqrt(elem.value) * radiusScaling, // area of circle proportional
        latitude: coord[0],
        longitude: coord[1],
        fillKey: 'district',
      };
    });

    bubbleData = bubbleDataOrigin.concat(bubbleDataDistrict);
  }

  map.bubbles(bubbleData, {
    popupOnHover: false,
  });

  const svg = d3v4.select('.datamap');

  const tip = d3Tip()
    .attr('class', 'd3-tip')
    .offset([-115, 0])
    .html(d => tooltip(d.name, d.count));

  svg.call(tip);

  d3v4.selectAll('.datamaps-bubble')
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide);
};

const init = (data, filteredData) => {
  const fills = {
    district: '#efdc99',
    origin: '#684C00',
    defaultFill: '#CCCCCC',
  };

  map = new Datamap({
    element: document.getElementById('mapChart'),
    height: 600,
    width: 800,
    setProjection(element) { // eslint-disable-line
      const projection = d3.geo.equirectangular() // eslint-disable-line
        .center([43, -22])
        .scale(1000);

      const path = d3.geo.path() // eslint-disable-line
        .projection(projection);

      return { path, projection };
    },
    geographyConfig: {
      popupOnHover: false,
      highlightOnHover: false,
    },
    fills,
  });

  update(data, filteredData);
};


export { init, update };
