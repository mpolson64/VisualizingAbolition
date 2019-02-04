const cols = [
    {
        title: "ID",
        field: "ID",
    },
    {
        title: "Registree",
        field: "Registree",
    },
    {
        title: "Status",
        field: "Status",
    },
    {
        title: "Sex",
        field: "Sex",
    },
    {
        title: "Origin",
        field: "Origin",
    },
    {
        title: "Age",
        field: "Age",
    },
    {
        title: "Occupation",
        field: "Occupation",
    },
    {
        title: "Master",
        field: "Master",
    },
    {
        title: "Master Residence",
        field: "Master Residence",
    },
    {
        title: "Registration Date",
        field: "Registration Date",
    },
    {
        title: "Registration District",
        field: "Registration District",
    },
    {
        title: "Sources",
        field: "Sources",
    },
]

const table = new Tabulator(
    "#table",
    {
        height: "200px",
        columns: cols,
    }
);

const logCheck = (obj) => {
    console.log("Checked by: " + obj.id);
}

const foobar = () => {
    const checkIds = [
        "idCheck",
        "registreeCheck",
        "statusCheck"
    ];
}

d3.csv("boc.csv").then((data) => {
    table.setData(data);
});
