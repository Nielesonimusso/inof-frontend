import { Component, OnInit } from '@angular/core';

import { DataSource } from '../../../models';
import { DataSourceService } from '../../../services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

/**
 * Available Data Sources page
 */
@Component({
  templateUrl: 'available-data-sources.component.html',
})
export class AvailableDataSourcesComponent implements OnInit {
  rows: DataSource[] = null;

  constructor(private router: Router, private service: DataSourceService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    // Get the available models from server
    this.service.availableDataSources().subscribe(
      (dataSources) => {
        this.rows = dataSources;
      },
      (_) => this.router.navigateByUrl('/error', { skipLocationChange: true })
    );
  }
}
