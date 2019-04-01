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
let outerArc;

const init = (data, filteredData) => {
  width = 960;
  height = 450;
  radius = Math.min(width, height) / 2;

  svg = d3
    .select('#pie')
    .append('svg')
    .append('g');

  svg.append('g').attr('class', 'slices');
  svg.append('g').attr('class', 'labels');
  svg.append('g').attr('class', 'lines');

  svg.attr('transform', `translate(${width / 2}, ${height / 2})`);

  pie = d3
    .pie()
    .value(d => d.value);

  arc = d3
    .arc()
    .outerRadius(radius * 1.0)
    .innerRadius(radius * 0.4);

  outerArc = d3
    .arc()
    .innerRadius(radius * 0.5)
    .outerRadius(radius * 1);

  color = d3.scaleOrdinal(d3.schemeCategory10);

  update(data, filteredData);
};

const update = (data, filteredData) => {  
  const counts = coalesceHistogram(histogram(data, filteredData, 'Occupation', x => x));

  let oldCounts = svg
    .select('.slices')
    .selectAll('path.slice')
    .data()
    .map(d => d.data);

  if (oldCounts.length === 0) {
    oldCounts = counts;
  }

  const was = mergeWithFirstEqualZero(counts, oldCounts);
  const is = mergeWithFirstEqualZero(oldCounts, counts);

  /* ------- SLICE ARCS -------*/

  let slice = svg
    .select('.slices')
    .selectAll('path.slice')
    .data(pie(was), d => d.data.key);

  slice
    .enter()
    .insert('path')
    .attr('class', 'slice')
    .style('fill', d => color(d.data.label))
    .each(function(d) {
      this._current = d;
    });

  slice = svg
    .select('.slices')
    .selectAll('path.slice')
    .data(pie(is), d => d.data.key);

  slice
    .transition()
    .duration(750)
    .attrTween("d", function(d) {
      var interpolate = d3.interpolate(this._current, d);
      var _this = this;
      return function(t) {
        _this._current = interpolate(t);
        return arc(_this._current);
      };
    });

  slice = svg
    .select('.slices')
    .selectAll('path.slice')
    .data(pie(data), d => d.data.key);

  slice
    .exit()
    .transition()
    .delay(750)
    .duration(0)
    .remove();

  /* ------- TEXT LABELS -------*/

  let text = svg
    .select('.labels')
    .selectAll('text')
    .data(pie(was), d => d.data.key);

  text
    .enter()
    .append('text')
    .attr('dy', '.35em')
    .style('opacity', 0)
    .text(d => d.data.key)
    .each(function(d) {
      this._current = d;
    })

  text = svg
    .select('.labels')
    .selectAll('text')
    .data(pie(is), d => d.data.key);

  text
    .transition()
    .duration(750)
    .style('opacity', d => (d.data.value == 0 ? 0 : 1))
    .attrTween("transform", function(d) {
      var interpolate = d3.interpolate(this._current, d);
      var _this = this;
      return function(t) {
        var d2 = interpolate(t);
        _this._current = d2;
        var pos = outerArc.centroid(d2);
        pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
        return "translate(" + pos + ")";
      };
    })
    .styleTween("text-anchor", function(d) {
      var interpolate = d3.interpolate(this._current, d);
      return function(t) {
        var d2 = interpolate(t);
        return midAngle(d2) < Math.PI ? "start" : "end";
      };
    });

  text = svg
    .select('.labels')
    .selectAll('text')
    .data(pie(data), d => d.data.key);

  text
    .exit()
    .transition()
    .delay(750)
    .remove();

  /* ------- SLICE TO TEXT POLYLINES -------*/

  let polyline = svg
    .select('.lines')
    .selectAll('polyline')
    .data(pie(was), d => d.data.key);

  polyline
    .enter()
    .append('polyline')
    .style('opacity', 0)
    .each(function(d) {
      this._current = d;
    });

  polyline = svg
    .select('.lines')
    .selectAll('polyline')
    .data(pie(is), d => d.data.key);

  polyline
    .transition()
    .duration(750)
    .style('opacity', d => (d.data.value == 0 ? 0 : 1))
    .attrTween("points", function(d) {
      this._current = this._current;
      var interpolate = d3.interpolate(this._current, d);
      var _this = this;
      return function(t) {
        var d2 = interpolate(t);
        _this._current = d2;
        var pos = outerArc.centroid(d2);
        pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
        return [arc.centroid(d2), outerArc.centroid(d2), pos];
      };
    });
    
  polyline = svg
    .select('.lines')
    .selectAll('polyline')
    .data(pie(data), d => d.data.key);

  polyline
    .exit()
    .transition()
    .delay(750)
    .remove();
};

const mergeWithFirstEqualZero = (oldHist, newHist) => {
  const newSet = d3.set();
  Object.keys(newHist).forEach(d => newSet.add(d.key));

  const onlyOld = oldHist
    .filter(d => !newSet.has(d.key))
    .map(d => ({
      key: d.key,
      value: 0,
    }));

  return d3.merge([newHist, onlyOld])
    .sort((a, b) => d3.ascending(a.key, b.key));
};

const midAngle = d => d.startAngle + (d.endAngle - d.startAngle) / 2;

export { init, update };
