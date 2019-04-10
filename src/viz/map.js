import * as d3v4 from 'd3';
import * as Datamap from 'datamaps';
import d3Tip from 'd3-tip';
import { histogramLocation, tooltip } from '../util';

// TODO: get rid of this lookup table
// Note that coordinates are [lat, lon]
const coordinates = {
  Bazaruto: [-21.64915, 35.46723],
  'Cabo Delgado': [-12.33761, 40.59913],
  Inhambane: [-23.87328, 35.4103],
  'Lourenço Marques': [-25.96924, 32.57317],
  Moçambique: [-15.0359, 40.73486],
  Quelimane: [-17.87368, 36.88194],
  Sena: [-17.4524, 35.0333],
  Sofala: [-20.02436, 34.74092],
  Tete: [-16.13281, 33.60638],
  Sancul: [-15.07676, 40.70331],
};

let map;

const update = (data, filteredData) => {
  let bubbleData;

  const originMapRadio = document.getElementById('originMapRadio');
  const registrationDistrictMapRadio = document.getElementById('registrationDistrictMapRadio');

  if (originMapRadio.cheked) {
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
  } else if (registrationDistrictMapRadio.checked) {
    const histLoc = histogramLocation(data, filteredData, 'Registration District', x => x);

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
        radius: Math.sqrt(elem.value) * 1.25, // area of circle proportional
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
    height: 1000,
    width: 1000,
    setProjection(element) { // eslint-disable-line
      const projection = d3.geo.equirectangular() // eslint-disable-line
        .center([35, -13])
        .scale(2750);

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
