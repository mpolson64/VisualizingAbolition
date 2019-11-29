import Tabulator from 'tabulator-tables';
import * as splitMap from './splitViz/splitMap';
import * as splitDonut from './splitViz/splitDonut';
import * as splitHistogramOverTime from './splitViz/splitHistogramOverTime';

let table;

const init = (data, filteredData, height, width) => {
  const adjustedHeight = height / 2 - 50;
  const adjustedWidth = width / 2 - 50;
  splitDonut.init(data, filteredData, adjustedHeight, adjustedWidth);
  splitMap.init(data, filteredData, adjustedHeight, adjustedWidth);
  splitHistogramOverTime.init(data, filteredData, adjustedHeight, adjustedWidth);

  table = new Tabulator(
    '#splitTableChart',
    {
      height: `${adjustedHeight}px`,
      layout: 'fitColumns',
      pagination: 'local',
      paginationSize: 100,
      columns: [
        // { title: 'ID', field: 'ID' },
        { title: 'Registree', field: 'Registree' },
        { title: 'Status', field: 'Status' },
        { title: 'Sex', field: 'Sex' },
        { title: 'Origin', field: 'Origin' },
        // { title: 'Age', field: 'Age' },
        // { title: 'Occupation', field: 'Occupation' },
        // { title: 'Master', field: 'Master' },
        // { title: 'Master Residence', field: 'Registree' },
        // { title: 'Registration Date', field: 'Registration Date' },
        // { title: 'Registration District', field: 'Registration District' },
        // { title: 'Sources', field: 'Sources' },
      ],
    },
  );
  table.setData(filteredData);
  document.getElementById('splitTableChart').style.width = `${adjustedWidth}px`;
};

const update = (data, filteredData) => {
  splitDonut.update(data, filteredData);
  splitMap.update(data, filteredData);
  splitHistogramOverTime.update(data, filteredData);

  table.setData(filteredData);
};

export { init, update };
