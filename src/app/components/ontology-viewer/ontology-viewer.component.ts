import { Component, Input, OnInit } from "@angular/core";
import { SchemaColumn, SchemaDefinition } from "src/app/models";

interface ColumnInfo {
  name: string;
  datatype: string;
  unit: string;
  reference: string;
}
@Component({
    selector: 'app-ontology-viewer',
    templateUrl: './ontology-viewer.component.html',
    styleUrls: ['./ontology-viewer.component.scss'],
})
export class OntologyViewerComponent implements OnInit {

  displayedColumns = ['ColumnName', 'DataType', 'ColumnUnit', 'ColumnReference']

  @Input() columns: SchemaColumn[] = [];
  @Input() name: string = "";

  dataSource: ColumnInfo[] = [];

  ngOnInit(): void {
    this.dataSource = this.columns.map((column) => {
      let unitinfo = "";
      if (column.unitType == "none") {
        unitinfo = "-";
      } else if (column.unitType == "fixed") {
        unitinfo = column.unitUri.split(/#|\//).pop();
      } else {
        unitinfo = column.unitSourceUri.split('/')[2] + "#" + column.unitSourceUri.split(/#|\//).pop() 
          + " -> " + column.unitUri.split(/#|\//).pop();
      }

      let referenceinfo = "";
      if (column.referenceType == "none") {
        referenceinfo = "-"
      } else {
        referenceinfo = column.referencedObjectUri.split('/')[2] + column.referencedObjectUri.split(/#|\//).pop() 
          + " -> " + column.referencedPropertyUri.split(/#|\//).pop() + ":"
        if (column.referenceType == "column") {
          referenceinfo += (<SchemaDefinition> column.referencedSchema).columns.map((column) => "<br />"+column.name)
        } else { // concept
          referenceinfo += (<string[]> column.referencedSchema).map((property) => "<br />"+property)
        }
      }

      return {
        name: column.name,
        datatype: column.datatype.split(/#|\//).pop(),
        unit: unitinfo,
        reference: referenceinfo
      }
    })
  }
}
