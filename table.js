const table = new Tabulator(
    "#table",
    {
        height: "200px",
        layout: "fitColumns",
        pagination: "local",
        paginationSize: 20,
    }
);

const updateCols = () => {
    const newColumns = [];
    const checkIds = [
        "idCheck",
        "registreeCheck",
        "statusCheck",
        "sexCheck",
        "originCheck",
        "ageCheck",
        "occupationCheck",
        "masterCheck",
        "masterResidenceCheck",
        "registrationDateCheck",
        "registrationDistrictCheck",
        "sourcesCheck",
    ];

    checkIds.forEach((checkId) => {
        const checkbox = document.getElementById(checkId);

        if (checkbox.checked) {
            newColumns.push({
                title: checkbox.value,
                field: checkbox.value,
                bottomCalc: checkbox.value == "ID" ? "count" : null,
            });
        }
    });

    table.setColumns(newColumns);
}

d3.csv("boc.csv").then((data) => {
    table.setData(data);
    updateCols();
});
