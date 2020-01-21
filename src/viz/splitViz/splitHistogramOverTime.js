import * as d3 from 'd3';
import { histogramNumberic } from '../../util';

let margin;
let width;
let height;
let xScale;
let yScale;
let xAxis;
let yAxis;
let plotLine;
let svg;
let line;
let dot; // eslint-disable-line no-unused-vars

const init = (data, filteredData, rawHeight, rawWidth) => {
  document.getElementById('splitHistogramOverTimeChart').innerHTML = '';

  const hist = histogramNumberic(data, filteredData, 'Registration Date', str => parseInt(str.substr(0, 4), 10));

  margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 50,
  };

  width = rawWidth - margin.left - margin.right;
  height = rawHeight - margin.top - margin.bottom;

  xScale = d3.scaleLinear()
    .range([0, width])
    .domain(d3.extent(hist, d => d.x)).nice();

  yScale = d3.scaleLinear()
    .range([height, 0])
    .domain(d3.extent(hist, d => d.y)).nice();

  xAxis = d3
    .axisBottom(xScale)
    .ticks(12)
    .tickFormat(d3.format('d'));
  yAxis = d3
    .axisLeft(yScale)
    .ticks(12 * height / width);

  plotLine = d3.line()
    .curve(d3.curveMonotoneX)
    .x(d => xScale(d.x))
    .y(d => yScale(d.y));

  svg = d3.select('#splitHistogramOverTimeChart').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

  svg.append('g')
    .attr('class', 'x axis ')
    .attr('id', 'axis--x')
    .attr('transform', `translate(${margin.left},${height + margin.top})`)
    .call(xAxis);

  svg.append('g')
    .attr('class', 'y axis')
    .attr('transform', `translate(${margin.left},${margin.top})`)
    .attr('id', 'axis--y')
    .call(yAxis);

  line = svg.append('g').append('path').attr('transform', `translate(${margin.left},${margin.top})`)
    .datum(hist)
    .attr('d', plotLine)
    .style('fill', 'none')
    .style('stroke', '#684c00');

  const tooltipDiv = d3.select('#vizualizers').append('div')
    .style('opacity', 0)
    .attr('class', 'tooltip');

  dot = svg.append('g')
    .attr('id', 'scatter')
    .attr('transform', `translate(${margin.left},${margin.top})`)
    .selectAll('.dot')
    .data(hist)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('r', 6)
    .attr('cx', d => xScale(d.x))
    .attr('cy', d => yScale(d.y))
    .attr('stroke', 'white')
    .attr('stroke-width', '2px')
    .style('fill', '#684c00')
    .on('mouseover', (d) => {
      tooltipDiv.transition()
        .style('opacity', 0.9);
      tooltipDiv.html(`${d.x}: ${d.y}`)
        .style('left', `${d3.event.pageX - 35}px`)
        .style('top', `${d3.event.pageY - 30}px`);
    })
    .on('mouseout', (d) => {
      tooltipDiv.transition()
        .style('opacity', 0);
    })
    .on('click', (d) => {
      const dateSlider = document.getElementById('dateSlider');
      dateSlider.noUiSlider.set([d.x, d.x]);
    });
};

const update = (data, filteredData) => {
  const hist = histogramNumberic(data, filteredData, 'Registration Date', str => parseInt(str.substr(0, 4), 10));

  yScale.domain(d3.extent(hist, d => d.y)).nice();
  yAxis = d3.axisLeft(yScale).ticks(12 * height / width);
  svg.select('.y')
    .transition()
    .duration(750)
    .call(yAxis);

  line.datum(hist)
    .transition().duration(750)
    .attr('d', plotLine)
    .style('fill', 'none')
    .style('stroke-width', '2px')
    .style('stroke', '#684c00');

  svg.selectAll('circle')
    .data(hist)
    .transition()
    .duration(750)
    .attr('cx', d => xScale(d.x))
    .attr('cy', d => yScale(d.y))
    .style('fill', '#864c00');

  svg.selectAll('circle')
    .data(hist)
    .enter()
    .append('circle')
    .attr('cx', d => xScale(d.x))
    .attr('cy', d => yScale(d.y))
    .attr('r', 5);

  svg.selectAll('circle')
    .data(hist)
    .exit()
    .remove();
};

export { init, update };
