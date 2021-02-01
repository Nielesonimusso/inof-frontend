import { Component, Input, ViewChild, OnInit, OnChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-abstract-table',
  template: '',
})
export abstract class AbstractTableComponent<T extends Record<string, any>> implements OnInit, OnChanges {
  // Define names of the columns
  displayedColumns: string[];

  // Title to show above the table
  @Input()
  pageTitle: string;

  // Input data
  @Input()
  rows: T[];

  // Whether the table should show the loading view
  @Input()
  loading: boolean;

  // Filter function
  @Input()
  filterFunction: (data: T, filter: string) => boolean;

  // Datasource to connect data to the table
  dataSource: MatTableDataSource<T>;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  constructor() {}

  sortingDataAccessor?: (data: T, sortingHeaderId: string) => string = (data, sortingHeaderId) => {
    return data[sortingHeaderId].toLowerCase();
  };

  setDataSource() {
    this.dataSource = new MatTableDataSource<T>(this.rows ? this.rows : []);
    this.dataSource.paginator = this.paginator;
    this.dataSource.filterPredicate = this.filterFunction;
    // Only if the table has sorting set the sorting configuration
    if (this.sort) {
      this.dataSource.sort = this.sort;
      if (this.sortingDataAccessor) {
        this.dataSource.sortingDataAccessor = this.sortingDataAccessor;
      }
      this.dataSource.sort.sort(
        {id: this.dataSource.sort.active,
          start: this.dataSource.sort.start,
          disableClear: false
        });
    }
    }

  ngOnInit() {
    this.setDataSource();
  }

  // When a change takes place, we update the table-data with the response
  ngOnChanges() {
    this.setDataSource();
  }

  applyFilter(filterValue: string) {
    // Remove starting and ending whitespaces
    filterValue = filterValue.trim();

    // Ignore cases during search
    filterValue = filterValue.toLowerCase();

    // Set the filter of the datasource
    this.dataSource.filter = filterValue;
  }
}
