import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SimulationResultsComponent } from './simulation-results.component';
import { ModelStatus, ExecutedSimulation, SimulationResults } from '../../../models';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { CustomDateTimePipe } from '../../../utilities/custom-dateTime-pipe';

describe('SimulationResultsComponent', () => {
  let component: SimulationResultsComponent;
  let fixture: ComponentFixture<SimulationResultsComponent>;
  let el: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SimulationResultsComponent, CustomDateTimePipe],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimulationResultsComponent);
    component = fixture.componentInstance;
    component.executedSimulation = getTestSimulation();
    component.executedSimulationIndex = 3;
    component.executedSimulationResults = getTestResults();
    el = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display model name correctly', () => {
    const expected = getTestSimulation();
    const actualName = el.query(By.css('#resultsName'));
    for (let i = 0; i < component.executedSimulation.executedModels.length; i++) {
      // Set selected model
      component.selectedIndex = i;
      fixture.detectChanges();
      // Get the expected model name
      const expectedName = component.executedSimulation.executedModels[component.selectedIndex].model.name;
      expect(actualName.nativeElement.textContent).toContain(expectedName);
    }
  });

  it('should display executedSimulationIndex correctly', () => {
    let expected = 3;
    const modelSimulationExecutionId = el.query(By.css('#simulationExecutionId'));
    expect(modelSimulationExecutionId.nativeElement.textContent).toContain(expected);

    expected = 4;
    component.executedSimulationIndex = expected;
    fixture.detectChanges();
    expect(modelSimulationExecutionId.nativeElement.textContent).toContain(expected);
  });

  it('should display createdOn correctly', () => {
    const expected = getTestSimulation();
    const createdOn = expected.createdOn;
    const modelCreatedOn = el.query(By.css('#createdOn'));
    const pipe = new CustomDateTimePipe();
    const value = pipe.transform(createdOn);
    expect(modelCreatedOn.nativeElement.textContent).toContain(value);
  });

  it('should display model cards correctly', () => {
    const expected = getTestSimulation();
    const results = getTestResults();
    for (let i = 0; i < component.executedSimulation.executedModels.length; i++) {
      // Set selected index
      component.selectedIndex = i;
      // Get actual values
      const actualCardName = el.query(By.css('#cardName-' + component.selectedIndex));
      const actualCardStatus = el.query(By.css('#status-' + component.selectedIndex));
      // Trigger change detection
      fixture.detectChanges();
      // Get expected values
      const expectedCardName = expected.executedModels[i].model.name;
      const expectedCardStatus = results.results.find((value) => value.modelId === expected.executedModels[i].model.id)
        .status;
      // Assert
      expect(actualCardName.nativeElement.textContent).toBe(expectedCardName);
      expect(actualCardStatus.nativeElement.textContent).toContain(expectedCardStatus);
    }
  });

  it('should display correct resultView', () => {
    // Should default table
    let table = el.query(By.css('#table-view'));
    expect(table.nativeElement).toBeTruthy();

    // Set view to tree-view
    const treeButton = el.query(By.css('#tree-view-button'));
    treeButton.nativeElement.click();
    fixture.detectChanges();
    // Expect tree-view
    const tree = el.query(By.css('#tree-view'));
    expect(tree).toBeTruthy();

    // Set view to tree-view
    const codeButton = el.query(By.css('#code-view-button'));
    codeButton.nativeElement.click();
    fixture.detectChanges();
    // Expect tree-view
    const code = el.query(By.css('#code-view'));
    expect(code).toBeTruthy();

    // Set view back to table-view
    const tableButton = el.query(By.css('#table-view-button'));
    tableButton.nativeElement.click();
    fixture.detectChanges();
    // Expect tree-view
    table = el.query(By.css('#table-view'));
    expect(table).toBeTruthy();
  });
});

function getTestSimulation(): ExecutedSimulation {
  return {
    createdBy: { username: 'user123', fullName: 'User' },
    createdOn: '22 June 2020',
    executedModels: [
      {
        clientRunId: 'cl123',
        model: {
          name: 'model 1',
          id: 'modelID 1',
        },
        modelExecutionId: 'md1',
      },
      {
        clientRunId: 'cl124',
        model: {
          name: 'model 2',
          id: 'modelID 2',
        },
        modelExecutionId: 'md2',
      },
    ],
    simulation: {
      name: 'Simulation 123',
    },
    simulationExecutionId: 'exec1234',
  };
}

function getTestResults(): SimulationResults {
  return {
    ...getTestSimulation(),
    results: [
      {
        modelId: 'modelID 1',
        modelName: 'model 1',
        ranOn: '22 June 2020',
        result: { key: 'val' },
        status: ModelStatus.success,
      },
      {
        modelId: 'modelID 2',
        modelName: 'model 2',
        ranOn: '22 June 2020',
        result: null,
        status: ModelStatus.submitted,
      },
    ],
  };
}
