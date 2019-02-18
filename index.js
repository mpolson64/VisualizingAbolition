let data = [];
let filteredData = [];

d3.csv("boc.csv").then((rawData) => {
    data = rawData;
    filteredData = rawData;

    table.setData(rawData);
    showChanged(table);
    fillDatalists(filteredData);
});
