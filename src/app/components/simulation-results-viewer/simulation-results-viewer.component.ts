import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material/tree';

/**
 * Recursive type definition for a tree
 */
interface TreeNode {
  label: string;
  children: TreeNode[];
}

interface FlatNode {
  expandable: boolean;
  label: string;
  level: number;
}

@Component({
  selector: 'app-simulation-results-viewer',
  templateUrl: './simulation-results-viewer.component.html',
  styleUrls: [],
})
export class SimulationResultsViewerComponent implements OnChanges {
  @Input() results: any[];

  treeControl = new FlatTreeControl<FlatNode>(
    (node) => node.level,
    (node) => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    (node: TreeNode, level: number): FlatNode => {
      return {
        expandable: node.children.length > 0,
        label: node.label,
        level,
      };
    },
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  ngOnChanges() {
    if (this.results) {
      this.dataSource.data = [smartParser('Results', this.results)];
    }
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;
}

/**
 * Parses artbetrary JS variables to a node-structure
 * exports function for tests
 */
export const smartParser = (label: string, value: any): TreeNode => {
  /**
   * Array: One root node, and a child for every array item
   */
  if (Array.isArray(value)) {
    return {
      label: `${label} (list of ${value.length} item(s))`,
      // Loop over array items, generate a node for each of them
      children: value.map((item, i) => smartParser(`Row ${i}`, item)),
    };
  }

  /**
   * Object literal: One root node, a child for all key/value pairs
   */
  if (typeof value === 'object' && value !== null) {
    return {
      label: `${label} (${Object.entries(value).length} properties)`,
      // Loop over all pairs and generate nodes for all of them
      children: Object.entries(value).map(([key, v], i) => smartParser(key, v)),
    };
  }

  /**
   * Primitives and null: a node without children
   */
  if (['string', 'number', 'boolean'].includes(typeof value) || value === null || value === undefined) {
    return {
      label: `${label}: ${value}`,
      children: [],
    };
  }

  /**
   * Fallback: When a type is not renderable  (e.g. function), we show the label and
   * its type.
   */
  return { label: `${label}: ${typeof value}`, children: [] };
};
