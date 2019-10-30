/* eslint-disable no-underscore-dangle, func-names */
import * as d3 from 'd3';
import d3Tip from 'd3-tip';

import { histogram, coalesceHistogram, tooltip } from '../util';

let radius;

let svg;

const color = d3.scaleOrdinal(d3.schemeCategory10);

let pie;
let arc;

const key = d => d.data.key;

const mergeWithFirstEqualZero = (first, second) => {
  const secondSet = d3.set();
  second.forEach((d) => {
    secondSet.add(d.key);
  });

  const onlyFirst = first
    .filter(d => !secondSet.has(d.key))
    .map(d => ({ key: d.key, value: 0 }));
  return d3.merge([second, onlyFirst]).sort((a, b) => d3.ascending(a.key, b.key));
};

const update = (data, filteredData) => {
  const counts = coalesceHistogram(histogram(data, filteredData, document.getElementById('donutSelect').value, x => x));

  const duration = 750;
  let data0 = svg
    .select('.slices')
    .selectAll('path.slice')
    .data()
    .map(d => d.data);
  if (data0.length === 0) data0 = counts;
  const was = mergeWithFirstEqualZero(counts, data0);
  const is = mergeWithFirstEqualZero(data0, counts);

  /* -------- TIP -------------*/
  const tip = d3Tip()
    .attr('class', 'd3-tip')
    .offset([-115, 0])
    .html(d => tooltip(d.data.key, d.data.value));

  svg.call(tip);

  /* ------- SLICE ARCS -------*/

  let slice = svg
    .select('.slices')
    .selectAll('path.slice')
    .data(pie(was), key);

  slice
    .enter()
    .insert('path')
    .attr('class', 'slice')
    .style('fill', d => color(d.data.key))
    .each(function (d) {
      this._current = d;
    });

  slice = svg
    .select('.slices')
    .selectAll('path.slice')
    .data(pie(is), key);

  slice
    .transition()
    .duration(duration)
    .attrTween('d', function (d) {
      const interpolate = d3.interpolate(this._current, d);
      const _this = this;
      return function (t) {
        _this._current = interpolate(t);
        return arc(_this._current);
      };
    });

  slice = svg
    .select('.slices')
    .selectAll('path.slice')
    .data(pie(counts), key)
    .attr('stroke', 'white')
    .attr('stroke-width', '2px')
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)
    .on('click', (d) => {
      tip.hide();

      let filter;
      const filterName = document.getElementById('donutSelect').value;
      if (filterName === 'Status') {
        filter = document.getElementById('statusFilter');
      } else if (filterName === 'Sex') {
        filter = document.getElementById('sexFilter');
      } else if (filterName === 'Origin') {
        filter = document.getElementById('originFilter');
      } else if (filterName === 'Occupation') {
        filter = document.getElementById('occupationFilter');
      } else if (filterName === 'Master') {
        filter = document.getElementById('masterFilter');
      } else if (filterName === 'Master Residence') {
        filter = document.getElementById('masterResidenceFilter');
      } else if (filterName === 'Registration District') {
        filter = document.getElementById('registrationDistrictFilter');
      }

      filter.value = d.data.key;
      filter.onchange();
    });

  slice
    .exit()
    .transition()
    .delay(duration)
    .duration(0)
    .remove();
};

const init = (data, filteredData, height, width) => {
  document.getElementById('donutChart').innerHTML = '';
  radius = Math.min(width, height) / 2;

  svg = d3
    .select('#donutChart')
    .append('svg')
    .attr('height', height)
    .attr('width', width)
    .append('g');

  svg.append('g').attr('class', 'slices');
  svg.append('g').attr('class', 'labels');
  svg.append('g').attr('class', 'lines');

  pie = d3
    .pie()
    .value(d => d.value);

  arc = d3
    .arc()
    .outerRadius(radius * 1.0)
    .innerRadius(radius * 0.4);

  svg.attr('transform', `translate(${width / 2}, ${height / 2})`);

  update(data, filteredData);
};

export { init, update };

/* eslint-disable no-underscore-dangle, func-names */
