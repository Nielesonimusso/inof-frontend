import { Component, OnInit } from '@angular/core';
import { DataSource, Company, isOwner, UserProfile, isCreator } from '../../../models';
import { ActivatedRoute, Router } from '@angular/router';
import { DataSourceService, UserService } from '../../../services';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { TabbedComponent } from 'src/app/components';

/**
 * Inspect Data Source page
 */
@Component({
  selector: 'app-inspect-data-source',
  templateUrl: './inspect-data-source.component.html',
  styleUrls: ['./inspect-data-source.component.scss'],
})
export class InspectDataSourceComponent extends TabbedComponent implements OnInit {
  /**
   * The Data Surce object to inspect
   * Uses a setter to map the model inputs and outputs to the type the
   */
  dataSource: DataSource = null;

  selectedCompanies: Company[] = [];
  profile: Observable<UserProfile>;

  constructor(
    router: Router,
    private route: ActivatedRoute,
    private service: DataSourceService,
    private userService: UserService
  ) {
    super(router, route);
  }

  ngOnInit(): void {
    // Get the user's profile
    this.userService.getUserProfile().subscribe((profile) => (this.profile = of(profile)));

    // Get the routing parameters
    this.route.params.subscribe((params) => {
      if (!params.id) {
        return;
      }
      // Get the Model from the server
      this.service.get(params.id).subscribe(
        (dataSource) => {
          // Use the returned model to prefill values
          this.dataSource = dataSource;
          this.getDataSourcePermissions();
        },
        (_) => this.router.navigateByUrl('/error', { skipLocationChange: true })
      );
    });
  }

  showPermissions(): Observable<boolean> {
    // Only show the permissions piece when you are from the same company
    return this.profile?.pipe(map((profile) => isOwner(this.dataSource, profile)));
  }

  showEditButton(): Observable<boolean> {
    // Only show the permissions piece when you are from the same company
    return this.profile?.pipe(map((profile) => isCreator(this.dataSource, profile)));
  }

  /**
   * Copies text into the clipboard by executing the native copy command.
   */
  copyText(text: string) {
    // A direct copy command is not available, only to text inputs
    // Thus a workaround:

    // Create text input (don't display)
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    // Set text
    selBox.value = text;
    // Append to body
    document.body.appendChild(selBox);
    // Select text input
    selBox.focus();
    selBox.select();
    // Copy text
    document.execCommand('copy');
    // Cleanup
    document.body.removeChild(selBox);
  }

  getDataSourcePermissions() {
    // If the logged in user is from the same company, get the permissions
    this.profile?.pipe(map((profile) => isOwner(this.dataSource, profile))).subscribe((canGetPermissions) => {
      if (canGetPermissions) {
        this.service.getPermissions(this.dataSource.id).subscribe((permissions) => {
          this.selectedCompanies = permissions.map((x) => x.company);
        });
      }
    });
  }
}
