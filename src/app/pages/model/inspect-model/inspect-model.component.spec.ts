import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { InspectModelComponent } from './inspect-model.component';
import { LanguageLabel, Model, ModelPermission, ModelPermissionType, UserProfile } from '../../../models';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FoodProductService, ModelService, UserService } from '../../../services';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

const testModel1: Model = {
  name: 'Saltiness of wet products',
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam id nibh felis. Quisque eget malesuada nisi, at placerat mauris. Suspendisse id diam nisl. Fusce pharetra cursus mauris eu accumsan. Nunc rutrum ornare felis eget tincidunt. Nulla molestie mollis nulla, nec commodo metus venenatis a.',
  owner: { id: '1', name: 'Company A', address: 'TU/e Campus' },
  createdBy: { fullName: 'Daan Hegger', username: 'dhegger' },
  price: 10,
  useCount: 22,
  gatewayUrl: 'http://192.168.0.1:8000',
  isConnected: false,
  inputDescriptions: [
    {
      labels: [
        {
          name: 'invoer',
          language: LanguageLabel.nl,
        },
        {
          name: 'input',
          language: LanguageLabel.en,
        },
      ],
      description: 'An input of the model',
      unit: 'n/a',
    },
  ],
  outputDescriptions: [
    {
      labels: [
        {
          name: 'uitvoer',
          language: LanguageLabel.nl,
        },
        {
          name: 'output',
          language: LanguageLabel.en,
        },
      ],
      description: 'An output of the model',
      unit: 'n/a',
    },
  ],
};

const expectedID = 'id123';

describe('InspectModelComponent', () => {
  let component: InspectModelComponent;
  let fixture: ComponentFixture<InspectModelComponent>;
  let service: ModelService;
  let userService: UserService;
  let spy: jasmine.Spy;
  let permissionSpy: jasmine.Spy;
  let getUserProfileSpy: jasmine.Spy;
  let router: Router;
  let route: ActivatedRoute;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([]), HttpClientTestingModule],
      declarations: [InspectModelComponent],
    }).compileComponents();

    // Services
    router = TestBed.inject(Router);
    route = TestBed.inject(ActivatedRoute);
    route.params = of({ id: expectedID });
    service = TestBed.inject(ModelService);
    userService = TestBed.inject(UserService);
    spy = spyOn(service, 'get').and.returnValue(of(testModel1));
    permissionSpy = spyOn(service, 'getPermissions').and.returnValue(of(getTestPermissions()));
    getUserProfileSpy = spyOn(userService, 'getUserProfile').and.returnValue(of(getTestUserProfile()));

    fixture = TestBed.createComponent(InspectModelComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(expectedID);
    expect(permissionSpy).toHaveBeenCalled();
  });

  it('should show all properties', (done) => {
    // Trigger change detection
    fixture.detectChanges();
    // Wait until element is stable (has processed changes)
    fixture.whenStable().then(() => {
      // Checks whether an element with a certain selector has the expected value
      const checkProperty = (selector: string, expectedValue: string, debugDescription: string) => {
        const element = fixture.debugElement.query(By.css(selector));
        expect(element).toBeTruthy(debugDescription);
        expect(element.nativeElement.textContent).toBe(expectedValue, debugDescription);
      };

      // Check title
      checkProperty('.title', `Inspect model: ${testModel1.name}`, 'name');
      // Check description
      checkProperty('#description', testModel1.description, 'description');
      // Check company
      checkProperty('#owner', `Owned by: ${testModel1.owner.name}`, 'company');
      // Check creator
      checkProperty('#creator', `Created By: ${testModel1.createdBy.fullName}`, 'creator');
      // Check price
      checkProperty('#price', `Price: ${testModel1.price} €/call`, 'price');
      // Check gateway url
      checkProperty('#gateway-url .fixed-width-value', `${testModel1.gatewayUrl}`, 'gateway-url');
      // Check is_connected
      checkProperty('#status', `Status: ${testModel1.isConnected ? 'CONNECTED' : 'NOT CONNECTED'}`, 'connected_status');

      done();
    });

    expect(spy).toHaveBeenCalledWith(expectedID);
  });

  it('should query data from service', () => {
    fixture.detectChanges();

    expect(component.model).toEqual(testModel1);
    expect(spy).toHaveBeenCalledWith(expectedID);
  });

  it('should redirect to the error page if getting model fails', () => {
    // Arrange
    const navigateByUrlSpy = spyOn(router, 'navigateByUrl');
    spy.and.returnValue(throwError({}));

    // Act
    fixture.detectChanges();

    // Assert
    expect(spy).toHaveBeenCalled();
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/error', { skipLocationChange: true });
  });

  it('should copy to clipboard when copy button is pressed', async () => {
    // Arrange
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('#copy-button'));
    spyOn(component, 'copyText').and.callThrough();

    // Act
    button.nativeElement.click();

    // Assert
    expect(component.copyText).toHaveBeenCalled();
  });
});

function getTestPermissions(): ModelPermission[] {
  return [
    {
      company: {
        id: '1',
        name: 'Company A',
      },
      companyId: '555',
      modelInfo: {
        canExecute: true,
        id: '111111',
        name: 'tomato soup Model',
        description: 'Test Model Description',
        price: 12,
        isConnected: true,
      },
      modelInfoId: '1111',
      permissionType: ModelPermissionType.execute,
    },
  ];
}

function getTestUserProfile(): UserProfile {
  return {
    companyId: '1',
    fullName: 'Full Name',
    username: 'username123',
    company: {
      id: '1',
      name: 'Company A',
    },
    email: 'email@domain.com',
  };
}
