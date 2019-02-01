tableData = [{
        "ID": 1,
        "Master": "Plácido Sotero Pacheco",
        "Master Residence": "Santa Carolina",
        "Registree": "Naxoá",
        "Status": "Slave",
        "Sex": "Female",
        "Origin": "Mambone",
        "Age": "8",
        "Occupation": "None",
        "Registration Date": "1856-08-09",
        "Registration District": "Bazaruto",
        "Sources": "AHM, Fundo do Século XIX, Códices, 11-1166, ff. 0v-1."

    },
    {
        "ID": 2,
        "Master": "Plácido Sotero Pacheco",
        "Master Residence": "Santa Carolina",
        "Registree": "Mácia",
        "Status": "Slave",
        "Sex": "Female",
        "Origin": "Mambone",
        "Age": "6",
        "Occupation": "None",
        "Registration Date": "1856-08-09",
        "Registration District": "Bazaruto",
        "Sources": "AHM, Fundo do Século XIX, Códices, 11-1166, ff. 0v-1."

    },
    {
        "ID": 3,
        "Master": "Plácido Sotero Pacheco",
        "Master Residence": "Santa Carolina",
        "Registree": "Murrende",
        "Status": "Slave",
        "Sex": "Male",
        "Origin": "Mambone",
        "Age": "20",
        "Occupation": "None",
        "Registration Date": "1856-08-09",
        "Registration District": "Bazaruto",
        "Sources": "AHM, Fundo do Século XIX, Códices, 11-1166, ff. 0v-1."

    },
    {
        "ID": 4,
        "Master": "Plácido Sotero Pacheco",
        "Master Residence": "Santa Carolina",
        "Registree": "Cipriano",
        "Status": "Slave",
        "Sex": "Male",
        "Origin": "Macuane",
        "Age": "20",
        "Occupation": "Bleeder",
        "Registration Date": "1856-08-09",
        "Registration District": "Bazaruto",
        "Sources": "AHM, Fundo do Século XIX, Códices, 11-1166, ff. 0v-1."

    }
]


table = new Tabulator("#table", {
    height: "200px",

    data: tableData,
    columns: [
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
    ],
});

d3.csv("boc.csv").then((data) => {
    table.setData(data);
});
