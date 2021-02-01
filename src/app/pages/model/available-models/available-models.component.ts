import { Component, OnInit } from '@angular/core';

import { Model } from '../../../models';
import { ModelService } from '../../../services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

/**
 * Available Models page
 */
@Component({
  templateUrl: 'available-models.component.html',
})
export class AvailableModelsComponent implements OnInit {
  rows: Model[] = null;

  constructor(private router: Router, private service: ModelService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    // Get the available models from server
    this.service.availableModels().subscribe(
      (models) => {
        this.rows = models;
      },
      (_) => this.router.navigateByUrl('/error', { skipLocationChange: true })
    );
  }
}
