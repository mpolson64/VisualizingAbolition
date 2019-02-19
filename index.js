let data = [];
let filteredData = [];

d3.csv("boc.csv").then((rawData) => {
    data = rawData;
    filteredData = rawData;

    fillDatalists(filteredData);

    table.setData(rawData);
    showChanged(table);
    
    drawHistogram(data);
});
