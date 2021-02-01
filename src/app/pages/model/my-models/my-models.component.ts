import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Model } from '../../../models';
import { ModelService } from '../../../services';
import { Router } from '@angular/router';

/**
 * My Models page
 */
@Component({
  templateUrl: 'my-models.component.html',
})
export class MyModelsComponent implements OnInit {
  rows: Model[] = null;

  constructor(private router: Router, private service: ModelService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    // Get the own models from server
    this.service.ownModels().subscribe(
      (models) => {
        this.rows = models;
      },
      (_) => this.router.navigateByUrl('/error', { skipLocationChange: true })
    );
  }
}
