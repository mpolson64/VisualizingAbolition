/* eslint-disable */
import * as d3v4 from 'd3';
import * as Datamap from 'datamaps';
import { histogram } from '../util';

// TODO: get rid of this lookup table
// Note that coordinates are [lat, lon]
const coordinates = {
  'Bazaruto': [-21.64915, 35.46723],
  'Cabo Delgado': [-12.33761, 40.59913],
  'Inhambane': [-23.87328, 35.4103],
  'Lourenço Marques': [-25.96924, 32.57317],
  'Moçambique': [-15.0359, 40.73486],
  'Quelimane': [-17.87368, 36.88194],
  'Sena': [-17.4524, 35.0333],
  'Sofala': [-20.02436, 34.74092],
  'Tete': [-16.13281, 33.60638],
  'Sancul': [-15.07676, 40.70331],
};

let map;

const init = (data, filteredData) => {
  const center = Object.values(coordinates)
    .reduce((acc, arr) => [acc[0] + arr[0], acc[1] + arr[1]])
    .map(x => x / Object.keys(coordinates).length);
  console.log([center[1], center[0]]);

  const color = d3v4.scaleOrdinal(d3v4.schemeCategory10);
const colors = Object.assign(
  {},
  ...Object.keys(coordinates)
  .map(k => ({[k]: color(k)}))
);
colors.defaultFill = '#ABDDA4';
console.log(colors);

  map = new Datamap({
    element: document.getElementById('mapChart'),
    height: 1000,
    width: 1000,
    setProjection: function(element) {
    var projection = d3.geo.equirectangular()
      .center([center[1], center[0]])
      .scale(1800);

    var path = d3.geo.path()
      .projection(projection);

    return {path: path, projection: projection};
  },
    geographyConfig: {
      popupOnHover: false,
      highlightOnHover: false,
    },
    fills: colors,
  });

  update(data, filteredData)
};

const update = (data, filteredData) => {
  const hist = histogram(data, filteredData, 'Registration District', x => x);
  console.log(hist);

  const bubbleData = hist.map(elem => ({
    name: elem.key,
    radius: Math.sqrt(elem.value),
    latitude: coordinates[elem.key][0],
    longitude: coordinates[elem.key][1],
    fillKey: elem.key,
  }));
  console.log(bubbleData);

  map.bubbles(bubbleData);
};

export { init, update };
/* eslint-enable */
