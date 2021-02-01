import { Component, Input, OnInit } from '@angular/core';
import { Simulation, UserProfile, HasCreator, isCreator } from '../../models';
import { AbstractTableComponent } from '../abstract-table';
import { SimulationService, UserService } from '../../services';
import { MatDialog } from '@angular/material/dialog';
import { DeleteItemDialogComponent } from '../delete-item-dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Table component for an overview of Simulations
 */
@Component({
  selector: 'app-simulations-table',
  styleUrls: ['simulations-table.component.scss'],
  templateUrl: 'simulations-table.component.html',
})
export class SimulationsTableComponent extends AbstractTableComponent<Simulation> implements OnInit {
  // Define names of the columns
  @Input()
  displayedColumns: string[] = ['name', 'owner', 'foodproductname', 'createdby', 'actions'];

  // User's profile
  profile: Observable<UserProfile>;

  constructor(
    private simulationService: SimulationService,
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    super();
  }

  ngOnInit() {
    super.ngOnInit();
    this.userService.getUserProfile().subscribe((profile) => this.profile = of(profile));
  }

  /**
   * Show confirmation dialog to delete a simulation and delete it if the action was confirmed.
   */
  deleteSimulation(simulation: Simulation) {
    const dialogRef = this.dialog.open(DeleteItemDialogComponent, {
      data: simulation.name,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }
      this.simulationService.deleteById(simulation.id).subscribe((x) => {
        if (x.status === 200) {
          const removed = this.rows.indexOf(simulation);
          this.rows.splice(removed, 1);
          this.setDataSource();
          this.snackBar.open('Simulation deleted successfully', '', { duration: 2000 });
        }
      });
    });
  }

  runSimulationById(simulation: Simulation) {
    this.simulationService.runById(simulation.id).subscribe(() => {
      this.snackBar.open('Simulation run has been requested successfully', '', { duration: 4000 });
    });
  }

  isCreator(object: HasCreator): Observable<boolean> {
    return this.profile?.pipe(map((profile) => isCreator(object, profile)));
  }

  /**
   * Overwrite specific filter function for my simulation scenario
   */
  filterFunction = (data: Simulation, filter: string) => {
    return data.name.toLowerCase().includes(filter.toLowerCase())
      || data.owner.name.toLowerCase().includes(filter.toLowerCase());
  };
}
