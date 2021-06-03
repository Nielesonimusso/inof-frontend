import { Component, Input, OnInit } from "@angular/core";
import { ModelArgumentColumn } from "src/app/models";

import { DataSourceService } from '../../services';

@Component({
    selector: 'app-ontology-viewer',
    templateUrl: './ontology-viewer.component.html',
    styleUrls: ['./ontology-viewer.component.scss'],
  })
  export class OntologyViewerComponent implements OnInit {

    displayedColumns = ['name', 'type']

    @Input() columns: ModelArgumentColumn[];

    ngOnInit(): void { }
  }