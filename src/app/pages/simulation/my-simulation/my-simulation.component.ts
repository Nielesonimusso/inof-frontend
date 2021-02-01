import { Component, OnInit } from '@angular/core';
import { SimulationService } from '../../../services';
import { Simulation } from '../../../models';
import { Router } from '@angular/router';

/**
 * My Simulation table with sticky header, filtering and pagination
 */
@Component({
  selector: 'app-my-simulation',
  styleUrls: ['my-simulation.component.css'],
  templateUrl: 'my-simulation.component.html',
})
export class SimulationComponent implements OnInit {
  /** Datasource to fill table */
  rows: Simulation[] = null;

  constructor(private router: Router, private simulationService: SimulationService) {}

  ngOnInit(): void {
    // Get the data and assign it to the rows
    this.simulationService.getMySimulations().subscribe((mySimulations) => {
      this.rows = mySimulations;
    }, _ => this.router.navigateByUrl('/error', { skipLocationChange: true }));
  }
}
