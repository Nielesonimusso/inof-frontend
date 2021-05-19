import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataSource } from '../../../models';
import { DataSourceService } from '../../../services';
import { Router } from '@angular/router';

/**
 * My Data Sources page
 */
@Component({
  templateUrl: 'my-data-sources.component.html',
})
export class MyDataSourcesComponent implements OnInit {
  rows: DataSource[] = null;

  constructor(private router: Router, private service: DataSourceService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    // Get the own data sources from server
    this.service.ownDataSources().subscribe(
      (dataSources) => {
        this.rows = dataSources;
      },
      (_) => this.router.navigateByUrl('/error', { skipLocationChange: true })
    );
  }
}
