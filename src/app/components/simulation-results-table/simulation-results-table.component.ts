import { Component, Input, OnChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-simulation-results-table',
  templateUrl: './simulation-results-table.component.html',
  styleUrls: [],
})
export class SimulationResultsTableComponent implements OnChanges {
  @Input() results: any[];

  displayedColumns: string[];

  // Datasource to connect data to the table
  dataSource: MatTableDataSource<any>;

  constructor() { }

  ngOnChanges(): void {
    if (this.results) {
      this.displayedColumns = this.getColumns(this.results);
      this.dataSource = new MatTableDataSource(this.results);
    }
  }

  /**
   * Read the results, and merge all properties of member objects
   * Finalize it by deduplicating property names
   */
  getColumns(results: any[]): string[] {
    // Find all column names by compiling a list of all result properies
    const allColumns = results.flatMap((singleResult) => {
      if (typeof singleResult === 'object' && singleResult !== null) {
        return Object.keys(singleResult);
      }
      return [];
    });

    // Return de-duplicated version of all columns
    return [...new Set(allColumns)];
  }
}
