import { Component, OnInit, ViewChild } from '@angular/core';
import { Company, EmptyModel, Model, ModelPermissionType, isCreator } from '../../../models';
import { ModelService, UserService, AuthService } from '../../../services';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, NgForm } from '@angular/forms';
import { addFormServerErrors } from '../../../utilities/error';
import { CancelEditsDialogAction, CancelEditsDialogComponent, LoadingButtonComponent } from '../../../components';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { MatTable } from '@angular/material/table';
import { TabbedComponent } from 'src/app/components/tabbed-component';

/**
 * Add / Edit Model page
 */
@Component({
  selector: 'app-add-edit-model',
  styleUrls: ['add-edit-model.component.scss'],
  templateUrl: 'add-edit-model.component.html',
})
export class AddEditModelComponent extends TabbedComponent implements OnInit {
  @ViewChild('ngForm')
  form: NgForm;

  @ViewChild('permissionsTable') permissionsTable: MatTable<any>;
  displayedColumns = ['companyName', 'view', 'use'];

  @ViewChild(LoadingButtonComponent)
  saveButton: LoadingButtonComponent;

  @ViewChild(MatSelect)
  matSelect: MatSelect;

  /** List of companies to be displayed in the dropdown */
  companies: Company[] = [];
  /** Tuple of companies and their permissions. */
  companyPermission: [Company, boolean][] = [];
  /** Companies that have permissions */
  selectedCompanies: Company[] = [];

  model: Model = null;

  constructor(
    router: Router,
    private route: ActivatedRoute,
    private service: ModelService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private userService: UserService,
    private dialog: MatDialog
  ) {
    super(router, route);
  }

  ngOnInit() {
    // Get all the companies to be shown in the dropdown menu expect that of the user since the user's own company has rights per default
    this.authService.companies().subscribe((companies) => {
      this.userService.getUserProfile().subscribe((userProfile) => {
        this.companies = companies.filter((allCompanies) => allCompanies.id !== userProfile.companyId);
      });
    });

    // Get parameters of the route
    this.route.params.subscribe((params) => {
      // If id parameter is set
      if (params.id !== null && params.id !== undefined) {
        // Get the Model from the service
        this.service.get(params.id).subscribe(
          (model) => {
            // Get the user's profile
            this.userService.getUserProfile().subscribe((userProfile) => {
              if (!isCreator(model, userProfile)) {
                this.router.navigate(['inspect', params.id], {
                  relativeTo: this.route.parent,
                });
              } else {
                this.model = model;
                this.getModelPermissions();
              }
            });
          },
          (_) => this.router.navigateByUrl('/error', { skipLocationChange: true })
        );
      } else {
        // Else, default to EmptyModel
        this.model = EmptyModel();
      }
    });
  }

  /**
   * Check if the permission execute is given to the company, otherwise give it view
   */
  matSelectPermissionChange() {
    this.companyPermission = this.selectedCompanies.map((selectedCompany) => {
      const permission = this.companyPermission.find((companyPermission) => {
        return companyPermission[0].id === selectedCompany.id;
      });
      return [selectedCompany, permission ? permission[1] : false];
    });
  }

  /**
   * Get the permissions of a model
   */
  getModelPermissions() {
    this.service.getPermissions(this.model.id).subscribe((permissions) => {
      this.companyPermission = permissions.map((modelPermission) => [
        modelPermission.company,
        // To translate the response "ModelPermissionTypes.VIEW_AND_EXECUTE" to execute permission
        modelPermission.permissionType.toLowerCase().includes(ModelPermissionType.execute),
      ]);
      this.selectedCompanies = this.companyPermission.map((companyPermission) => {
        // return the company
        return companyPermission[0];
      });
    });
  }

  /**
   * Update the permissions of a model
   * @param id the id of the model which permissions are updated.
   */
  updateModelPermissions(id: string) {
    // Send the PUT request and return the updated model
    return this.service.updatePermissions(
      id,
      this.companyPermission.map((companyPermission) => {
        return {
          companyId: companyPermission[0].id,
          modelInfoId: id,
          permissionType: companyPermission[1] ? ModelPermissionType.execute : ModelPermissionType.view,
        };
      })
    );
  }

  compareCompanies(companyA: Company, companyB: Company) {
    return companyA?.id === companyB?.id;
  }

  /**
   * Remove the company from the permissions list
   * @param index: the index of the company removed to be unselected from the dropdown.
   */
  removeCompany(index: number) {
    // find the item in the options of the matSelect and remove it
    this.matSelect.options
      .find((item, _, __) => {
        return item.value.id === this.companyPermission[index][0].id;
      })
      .deselect();
    // Update the table rows afterwards to have the indices align correctly
    this.permissionsTable.renderRows();
  }

  saveModel() {
    // If id is set, it is an edit operation
    if (this.model.id) {
      // Call update endpoint
      this.service
        .update(this.model)
        .pipe(finalize(() => this.saveButton.completeLoading()))
        .subscribe(
          (model) => {
            this.updateModelPermissions(model.id).subscribe(() => {
              this.snackBar.open('Model saved successfully', '', { duration: 2000 });
              this.model = model;
              this.form.control.markAsPristine();
            });
          },
          (error) => {
            addFormServerErrors(this.form.controls.generalInfo as FormGroup, error);
            addFormServerErrors(this.form.form, error);
          }
        );
    } else {
      // Add operation
      // Call create endpoint
      this.service
        .create(this.model)
        .pipe(finalize(() => this.saveButton.completeLoading()))
        .subscribe(
          (model) => {
            this.updateModelPermissions(model.id).subscribe(() => {
              this.snackBar.open('Model saved successfully', '', { duration: 2000 });
              this.model = model;
              this.router.navigate(['edit', model.id], {
                state: { tab: this.tabIndex },
                relativeTo: this.route.parent,
              });
            });
          },
          (error) => {
            addFormServerErrors(this.form.controls.generalInfo as FormGroup, error);
            addFormServerErrors(this.form.form, error);
          }
        );
    }
  }

  cancel() {
    if (!this.model) {
      return;
    }

    if (!this.form.dirty) {
      this.doCancel();
    } else {
      const dialogRef = this.dialog.open(CancelEditsDialogComponent);

      dialogRef.afterClosed().subscribe((result: CancelEditsDialogAction) => {
        if (result === CancelEditsDialogAction.NO_SAVE) {
          this.doCancel();
        }
        // Else, do nothing, only close dialog
      });
    }
  }

  private doCancel() {
    // If model has an id, it is an edit operation
    // Then, go to inspect page
    if (this.model.id) {
      this.router.navigate(['inspect', this.model.id], {
        relativeTo: this.route.parent,
        fragment: this.tabIndex.toString(),
      });
    } else {
      // Else, go back to the my/available models page (dependend on what the origin is)
      this.route.parent.url.subscribe((url) => {
        this.router.navigate([`${url}`]);
      });
    }
  }
}
