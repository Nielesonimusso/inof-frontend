import { Component, Input, OnChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-simulation-results-table',
  templateUrl: './simulation-results-table.component.html',
  styleUrls: [],
})
export class SimulationResultsTableComponent implements OnChanges {
  @Input() results: Object;

  displayedColumns: Map<string, string[]>;

  // Datasource to connect data to the table
  dataSources: Map<string, MatTableDataSource<any>>;

  constructor() { 
    this.displayedColumns = new Map<string, string[]>();
    this.dataSources = new Map<string, MatTableDataSource<any>>();
  }

  ngOnChanges(): void {
    if (this.results) {
      this.displayedColumns.clear();
      this.dataSources.clear();
      Object.entries(this.results).forEach((result) => {
        this.displayedColumns.set(result[0], this.getColumns(result[1]));
        this.dataSources.set(result[0], new MatTableDataSource(result[1]))
      });
    }
  }

  getArgumentNames(): string[] {
    return Object.keys(this.results);
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
