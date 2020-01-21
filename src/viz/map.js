import * as d3v4 from 'd3';
import * as Datamap from 'datamaps';
import { histogramLocation, tooltip } from '../util';

const radiusScaling = 0.85;
const radiusMin = 2.5;

let map;

let zoomLevel = 1;
const radiusScaleFloor = x => (x === 0 ? 0 : Math.max(Math.sqrt(x) * radiusScaling, radiusMin));

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
        radius: radiusScaleFloor(elem.value) / zoomLevel,
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
        radius: radiusScaleFloor(elem.value) / zoomLevel,
        latitude: coord[0],
        longitude: coord[1],
        fillKey: 'district',
      };
    });
  } else {
    map.bubbles([]);
    const histLocOrigin = histogramLocation(data, filteredData, 'Origin', x => x.match(/\(([^)]+)\)/).pop());

    const bubbleDataOrigin = histLocOrigin.map((elem) => {
      const coord = elem.key.split(',').map(parseFloat);
      return {
        name: [...elem.tags].join(', '),
        count: elem.value,
        radius: radiusScaleFloor(elem.value) / zoomLevel,
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
        radius: radiusScaleFloor(elem.value) / zoomLevel,
        latitude: coord[0],
        longitude: coord[1],
        fillKey: 'district',
      };
    });

    bubbleData = bubbleDataDistrict.concat(bubbleDataOrigin);
  }

  setTimeout(() => {
    map.bubbles(bubbleData, {
      popupOnHover: false,
    });
    const svg = d3v4.selectAll('.datamap');

    const tooltipDiv = d3v4.select('#vizualizers').append('div')
      .style('opacity', 0)
      .attr('class', 'tooltip');

    d3v4.selectAll('.datamaps-bubble')
      .on('mouseover', (d) => {
        tooltipDiv.transition()
          .style('opacity', 0.9);
        tooltipDiv.html(`${d.name}: ${d.count}`)
          .style('left', `${d3v4.event.pageX - 35}px`)
          .style('top', `${d3v4.event.pageY - 30}px`);
      })
      .on('mouseout', (d) => {
        tooltipDiv.transition()
          .style('opacity', 0);
      })
      .on('click', (d) => {
        let filter;
        if (d.fillKey === 'district') {
          filter = document.getElementById('registrationDistrictFilter');
        } else if (d.fillKey === 'origin') { // TODO: Something is up with this look at the console
          filter = document.getElementById('originFilter');
        }
        filter.value = d.name;
        filter.onchange();
      });

    svg.call(d3v4.zoom()
      .extent(
        [
          [0, 0],
          [document.getElementById('mapChart').offsetWidth, document.getElementById('mapChart').offsetHeight],
        ],
      )
      .scaleExtent([0, 8])
      .on('zoom', () => {
        zoomLevel = d3v4.event.transform.k;
        svg.selectAll('g').attr('transform', d3v4.event.transform);
        svg.selectAll('.datamaps-bubble').each((d) => { // lol this is n^2 don't tell anyone
          const { name, count } = d;
          svg.selectAll('.datamaps-bubble').filter(dInner => dInner.name === name).attr('r', radiusScaleFloor(count) / zoomLevel);
        });
      }));
  }, 100);
};

const init = (data, filteredData, height, width) => {
  const mapChart = document.getElementById('mapChart');
  mapChart.innerHTML = '';

  const fills = {
    district: '#efdc99',
    origin: '#684C00',
    defaultFill: '#CCCCCC',
  };
  map = new Datamap({
    element: mapChart,
    height,
    width,
    setProjection(element) { // eslint-disable-line
      const projection = d3.geo.equirectangular() // eslint-disable-line
        .center([50, -15])
        .scale(850);

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
