const updateCols = (table) => {
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
                bottomCalc: checkId == "idCheck" ? "count" : null,
            });
        }
    });

    table.setColumns(newColumns);
}

const predicates = {
    id: (x) => true,
    registree: (x) => true,
    status: (x) => true,
    origin: (x) => true,
    age: (x) => true,
    occupation: (x) => true,
    master: (x) => true,
    masterResidence: (x) => true,
    registrationDate: (x) => true,
    registrationDistrict: (x) => true,
    sources: (x) => true,
};

const filterData = (predicates) => {
    const composedPredicate = Object.values(predicates).reduce((composed, predicate) => (item) => composed(item) && predicate(item));
    return data.filter((item) => composedPredicate(item));
}

const filterDataAndSetTableData = (predicates, table) => {
    filteredData = filterData(predicates);
    table.setData(filteredData);
}

const updateFilterSet = (predicates, key, predicate, table) => {
    predicates[key] = predicate;
    filterDataAndSetTableData(predicates, table);
}

const fillDatalists = (data) => {
    const datalistIds = [
        "registreeDatalist",
    ];

    datalistIds.forEach((datalistId) => {
        const list = document.getElementById(datalistId);

        console.log(datalistId);
        console.log(list.attributes["data-key"].value);
        
        [...new Set(data.map((row) => row[list.attributes["data-key"].value]))].forEach((val) => {
            const option = document.createElement("option");
            option.value = val;
            list.appendChild(option);
        });

    });
}

