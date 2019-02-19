const drawHistogram = (data) => {
    console.log("in");
    hist = histogram(data, "Registration Date", (str) => str.substr(0, 4));

    const margin = {
        top: 20,
        right: 80,
        bottom: 20,
        left: 50,
    }

    const minYear0 = d3.min(Object.keys(hist));
    const maxYear0 = d3.max(Object.keys(hist));
    const minCount0 = d3.min(Object.values(hist));
    const maxCount0 = d3.max(Object.values(hist));

    const width = 960 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    const svg = d3.select("#histogramLineChart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleTime().rangeRound([0, width]);
    const y = d3.scaleLinear().rangeRound([height, 0]);

    x.domain(d3.extent(hist, (d) => d.key));
    y.domain(d3.extent(hist, (d) => d.count));

    const line = d3.line()
        .x((d) => x(d.key))
        .y((d) => y(d.count));

    g.append("g")
        .attr("transform",  `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .select(".domain")
        .remove();
    g.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Quantity");

    g.append("path")
        .datum(hist)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line);
}
