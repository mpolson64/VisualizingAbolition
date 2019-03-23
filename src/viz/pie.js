import * as d3 from 'd3';
import d3Tip from 'd3-tip';

import { histogram, coalesceHistogram } from '../util';

let margin;
let width;
let height;
let radius;
let svg;
let color;
let ready;
let pie;
let u;


const init = (data, filteredData) => {
  const counts = coalesceHistogram(histogram(data, filteredData, 'Sex', x => x));

  margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 50,
  };

  width = 800 - margin.left - margin.right;
  height = 400 - margin.top - margin.bottom;

  radius = Math.min(width, height) / 2;

  svg = d3.select('#pieChart').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${width / 2},${height / 2})`)

  color = d3.scaleOrdinal()
    .domain(Object.keys(counts))
    .range(d3.schemeDark2);

  pie = d3.pie()
    .value(d => d.value)
    .sort((a, b) => d3.ascending(a.key, b.key));

  ready = pie(d3.entries(counts));

  u = svg.selectAll('path')
    .data(ready);

  u.enter()
    .append('path')
    .merge(u)
    .transition()
    .duration(1000)
    .attr('d', d3.arc()
      .innerRadius(0)
      .outerRadius(radius))
    .attr('fill', d => color(d.data.key))
    .attr('stroke', 'white')
    .style('stroke-width', '2px')
    .style('opacity', 1);

  u.exit()
    .remove();
};

const update = (data, filteredData) => {

};

export { init, update };