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
    const histLoc = histogramLocation(data, filteredData, 'Origin', x => x);

    bubbleData = histLoc.map((elem) => {
      const coord = elem.key.split(',').map(parseFloat);
      return {
        name: [...elem.tags].join(', '),
        count: elem.value,
        radius: Math.sqrt(elem.value) * 1.25, // area of circle proportional
        latitude: coord[0],
        longitude: coord[1],
        fillKey: elem.key,
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
        fillKey: elem.key,
      };
    });
  } else {
    const histLoc = {
      ...histogramLocation(data, filteredData, 'Origin', x => x),
      ...histogramLocation(data, filteredData, 'Registration District', x => x),
    };

    bubbleData = histLoc.map((elem) => {
      const coord = elem.key.split(',').map(parseFloat);
      return {
        name: [...elem.tags].join(', '),
        count: elem.value,
        radius: Math.sqrt(elem.value) * radiusScaling, // area of circle proportional
        latitude: coord[0],
        longitude: coord[1],
        fillKey: elem.key,
      };
    });
  }

  map.bubbles(bubbleData, {
    popupOnHover: false,
  });

  const svg = d3v4.select('.datamap');

  const tip = d3Tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(d => tooltip(d.name, d.count));

  svg.call(tip);

  d3v4.selectAll('.datamaps-bubble')
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide);
};

const init = (data, filteredData) => {
  const allCoords = [...new Set(histogramLocation(data, filteredData, 'Registration District', x => x).map(obj => obj.key))];

  const color = d3v4.scaleOrdinal(d3v4.schemeCategory10);
  const fills = {};
  allCoords.forEach((coord) => {
    fills[coord] = color(coord);
  });
  fills.defaultFill = '#ABDDA4';

  map = new Datamap({
    element: document.getElementById('mapChart'),
    height: 400,
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
