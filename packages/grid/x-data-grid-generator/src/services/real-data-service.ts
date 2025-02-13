import { GridRowModel } from '@mui/x-data-grid-pro';
import asyncWorker from '../asyncWorker';
import { GridColDefGenerator, GridDataGeneratorContext } from './gridColDefGenerator';

export interface GridDemoData {
  rows: GridRowModel[];
  columns: GridColDefGenerator[];
}

export function getRealGridData(
  rowLength: number,
  columns: GridColDefGenerator[],
): Promise<GridDemoData> {
  return new Promise<GridDemoData>((resolve) => {
    const tasks = { current: rowLength };
    const rows: GridDemoData['rows'] = [];
    const indexedValues: { [field: string]: { [value: string]: number } } = {};

    function work() {
      const row: any = {};

      for (let j = 0; j < columns.length; j += 1) {
        const column = columns[j];
        if (column.generateData) {
          const context: GridDataGeneratorContext = {};
          if (column.dataGeneratorUniquenessEnabled) {
            let fieldValues = indexedValues[column.field];
            if (!fieldValues) {
              fieldValues = {};
              indexedValues[column.field] = fieldValues;
            }

            context.values = fieldValues;
          }

          row[column.field] = column.generateData(row, context);
        }
      }

      rows.push(row);
      tasks.current -= 1;
    }

    asyncWorker({
      work,
      done: () => resolve({ columns, rows }),
      tasks,
    });
  });
}
