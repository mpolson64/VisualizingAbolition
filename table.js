const table = new Tabulator(
    "#table",
    {
        height: "200px",
        layout: "fitColumns",
        pagination: "local",
        paginationSize: 20,
    }
);

d3.csv("boc.csv").then((rawData) => {
    data = rawData;
    filteredData = rawData;

    table.setData(rawData);
    updateCols(table);
    fillDatalists(filteredData);
});
