import { Component, Input, OnInit } from "@angular/core";

import { DataSourceService } from '../../services';

@Component({
    selector: 'app-ontology-viewer',
    templateUrl: './ontology-viewer.component.html',
    styleUrls: ['./ontology-viewer.component.scss'],
  })
  export class OntologyViewerComponent implements OnInit {

    ontology: string;

    @Input() gateway: string;

    constructor(
        private service: DataSourceService,
    ) {}

    ngOnInit(): void {
        this.service.fetchOntology(this.gateway).subscribe(
            (result) => this.ontology = result
        );
    }
  }