/* eslint-disable no-underscore-dangle, func-names */
import * as d3 from 'd3';
import d3Tip from 'd3-tip';

import { histogram, coalesceHistogram } from '../util';

let width;
let height;
let radius;

let svg;

let color;

let pie;
let arc;

let key;

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
  const counts = coalesceHistogram(histogram(data, filteredData, 'Occupation', x => x));

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
    .offset([-10, 0])
    .html(d => `${d.data.key}: <span style='color:red'>${d.data.value}</span>`);

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
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide);

  slice
    .exit()
    .transition()
    .delay(duration)
    .duration(0)
    .remove();
};

const init = (data, filteredData) => {
  svg = d3
    .select('#pieChart')
    .append('svg')
    .append('g');

  svg.append('g').attr('class', 'slices');
  svg.append('g').attr('class', 'labels');
  svg.append('g').attr('class', 'lines');

  width = 960;
  height = 450;
  radius = Math.min(width, height) / 2;

  pie = d3
    .pie()
    .sort(null)
    .value(d => d.value);

  arc = d3
    .arc()
    .outerRadius(radius * 1.0)
    .innerRadius(radius * 0.4);

  svg.attr('transform', `translate(${width / 2}, ${height / 2})`);

  key = d => d.data.key;

  color = d3.scaleOrdinal(d3.schemeCategory10);

  update(data, filteredData);
};

export { init, update };

/* eslint-disable no-underscore-dangle, func-names */
