import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DataSourceService } from '../../services'

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

  /**
   * The data of the table
   */
  rows = new Observable<object[]>();

  /**
   * The gateway url of the data source
   */
  @Input() gateway: string;

  constructor(
    private service: DataSourceService
  ) {}

  ngOnInit(): void {
    this.rows = this.service.fetchData(this.gateway).pipe(
      tap((data) => this.displayedColumns = Object.keys(data[0]))
    );
    /*.subscribe((data) => {
      this.displayedColumns = Object.keys(data[0])
      this.rows = data;
    });*/
  }
}
