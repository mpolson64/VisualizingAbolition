/* eslint-disable no-underscore-dangle, func-names */
import * as d3 from 'd3';

import { histogram, coalesceHistogram } from '../util';

let width;
let height;
let radius;

let svg;

let color;

let pie;
let arc;
let outerArc;

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

const midAngle = d => d.startAngle + (d.endAngle - d.startAngle) / 2;

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
    .data(pie(counts), key);

  slice
    .exit()
    .transition()
    .delay(duration)
    .duration(0)
    .remove();

  /* ------- TEXT LABELS -------*/

  let text = svg
    .select('.labels')
    .selectAll('text')
    .data(pie(was), key);

  text
    .enter()
    .append('text')
    .attr('dy', '.35em')
    .style('opacity', 0)
    .text(d => d.data.key)
    .each(function (d) {
      this._current = d;
    });

  text = svg
    .select('.labels')
    .selectAll('text')
    .data(pie(is), key);

  text
    .transition()
    .duration(duration)
    .style('opacity', d => (d.data.value === 0 ? 0 : 1))
    .attrTween('transform', function (d) {
      const interpolate = d3.interpolate(this._current, d);
      const _this = this;
      return function (t) {
        const d2 = interpolate(t);
        _this._current = d2;
        const pos = outerArc.centroid(d2);
        pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      };
    })
    .styleTween('text-anchor', function (d) {
      const interpolate = d3.interpolate(this._current, d);
      return function (t) {
        const d2 = interpolate(t);
        return midAngle(d2) < Math.PI ? 'start' : 'end';
      };
    });

  text = svg
    .select('.labels')
    .selectAll('text')
    .data(pie(counts), key);

  text
    .exit()
    .transition()
    .delay(duration)
    .remove();

  /* ------- SLICE TO TEXT POLYLINES -------*/

  let polyline = svg
    .select('.lines')
    .selectAll('polyline')
    .data(pie(was), key);

  polyline
    .enter()
    .append('polyline')
    .style('opacity', 0)
    .each(function (d) {
      this._current = d;
    });

  polyline = svg
    .select('.lines')
    .selectAll('polyline')
    .data(pie(is), key);

  polyline
    .transition()
    .duration(duration)
    .style('opacity', d => (d.data.value === 0 ? 0 : 1))
    .attrTween('points', function (d) {
      this._current = this._current;
      const interpolate = d3.interpolate(this._current, d);
      const _this = this;
      return function (t) {
        const d2 = interpolate(t);
        _this._current = d2;
        const pos = outerArc.centroid(d2);
        pos[0] = radius * 1 * (midAngle(d2) < Math.PI ? 1 : -1);
        return [arc.centroid(d2), outerArc.centroid(d2), pos];
      };
    });

  polyline = svg
    .select('.lines')
    .selectAll('polyline')
    .data(pie(counts), key);

  polyline
    .exit()
    .transition()
    .delay(duration)
    .remove();
};

const init = (data, filteredData) => {
  const counts = coalesceHistogram(histogram(data, filteredData, 'Occupation', x => x));

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

  outerArc = d3
    .arc()
    .innerRadius(radius * 0.5)
    .outerRadius(radius * 1);

  svg.attr('transform', `translate(${width / 2}, ${height / 2})`);

  key = d => d.data.key;

  color = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(counts.map(pair => pair.key));

  update(data, filteredData);
};

export { init, update };

/* eslint-disable no-underscore-dangle, func-names */
