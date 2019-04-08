import * as d3v4 from 'd3';
import * as Datamap from 'datamaps';
import { histogram } from '../util';

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
  const hist = histogram(data, filteredData, 'Registration District', x => x);

  const bubbleData = hist.map(elem => ({
    name: elem.key,
    radius: Math.sqrt(elem.value),
    latitude: coordinates[elem.key][0],
    longitude: coordinates[elem.key][1],
    fillKey: elem.key,
  }));

  map.bubbles(bubbleData);
};

const init = (data, filteredData) => {
  const center = Object.values(coordinates)
    .reduce((acc, arr) => [acc[0] + arr[0], acc[1] + arr[1]])
    .map(x => x / Object.keys(coordinates).length);

  const color = d3v4.scaleOrdinal(d3v4.schemeCategory10);
  const fills = Object.assign(
    {},
    ...Object.keys(coordinates)
      .map(k => ({ [k]: color(k) })),
  );
  fills.defaultFill = '#ABDDA4';

  map = new Datamap({
    element: document.getElementById('mapChart'),
    height: 1000,
    width: 1000,
    setProjection(element) { // eslint-disable-line
      const projection = d3.geo.equirectangular() // eslint-disable-line
        .center([center[1], center[0]])
        .scale(1800);

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
