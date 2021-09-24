import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DataSource } from 'src/app/models';
import { DataSourceService } from '../../services'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-data-source-data-table',
  templateUrl: './data-source-data-table.component.html',
  styleUrls: ['./data-source-data-table.component.scss'],
})
export class DataSourceDataTableComponent implements OnInit {
  /**
   * Set the displayed columns of the table
   */
  displayedColumns = [];

  exportData: SafeResourceUrl = null;

  /**
   * The data of the table
   */
  rows = new Observable<object[]>();

  /**
   * The gateway url of the data source
   */
  @Input() dataSource: DataSource;

  constructor(
    private service: DataSourceService,
    private sanitizer: DomSanitizer
  ) {}

  toJSONExport(value: any) {
    let prefix = "data:text/plain;charset=utf-8,";
    return this.sanitizer.bypassSecurityTrustResourceUrl(prefix + JSON.stringify(value));
  }

  ngOnInit(): void {
    this.rows = this.service.fetchData(this.dataSource.id).pipe(
      tap((data) => {
        this.displayedColumns = Object.keys(data[0]);
        this.exportData = this.toJSONExport(data);
      })
    );
    /*.subscribe((data) => {
      this.displayedColumns = Object.keys(data[0])
      this.rows = data;
    });*/
  }
}
