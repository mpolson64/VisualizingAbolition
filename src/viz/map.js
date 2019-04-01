import * as Datamap from "datamaps";

let map;

const init = (data, filteredData) => {
    console.log('new datamap');
    console.log(document.getElementById("mapChart"));
    map = new Datamap({
        element: document.getElementById("mapChart"),
        height: 1000,
        width: 1000,
        scope: 'usa',
        fills: {
            defaultFill: "#ABDDA4",
            win: '#0fa0fa'
        },
        data: {
            'TX': { fillKey: 'win' },
            'CA': { fillKey: 'win' },
        }
    });

    map.arc([
        {
            destination: {
                latitude: 29.762778,
                longitude: -95.383056,
            },
            origin: {
                latitude: 37.618889,
                longitude: -122.375,
            }
        }
    ], {strokeWidth: 1, arcSharpness: 1.4});
};

const update = (data, filteredData) => {

};

export { init, update };