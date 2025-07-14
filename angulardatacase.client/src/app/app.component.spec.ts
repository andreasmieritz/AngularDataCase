import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { DataService } from './data.service';
import { of, throwError } from 'rxjs';

describe('AppComponent (High-Level)', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockDataService: jasmine.SpyObj<DataService>;

  beforeEach(async () => {
    mockDataService = jasmine.createSpyObj('DataService', [
      'getDataSets',
      'getGroupings',
      'getAnalytics',
      'getNodeNames',
      'getCalculateResults'
    ]);

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [{ provide: DataService, useValue: mockDataService }]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });


  it('should set error if required fields are not selected on loadData', () => {
    component.loadData();

    expect(component.errorMessage).toBe('Please select a dataset, grouping, and at least one analytic.');
    expect(component.isLoading).toBeFalse();
  });

  it('should call getNodeNames and getCalculateResults when loadData is triggered with valid selection', () => {
    component.selectedDataSetId = 1;
    component.selectedGroupingId = 'g1';
    component.selectedAnalytics = ['a1'];

    mockDataService.getNodeNames.and.returnValue(of([]));
    mockDataService.getCalculateResults.and.returnValue(of([]));

    component.loadData();

    expect(mockDataService.getNodeNames).toHaveBeenCalledWith('g1');
    expect(mockDataService.getCalculateResults).toHaveBeenCalledWith('g1', 'a1', 1);
  });

  it('should handle error in getNodeNames gracefully', () => {
    component.selectedDataSetId = 1;
    component.selectedGroupingId = 'g1';
    component.selectedAnalytics = ['a1'];

    mockDataService.getNodeNames.and.returnValue(throwError(() => new Error('Fail')));
    mockDataService.getCalculateResults.and.returnValue(of([]));

    component.loadData();

    expect(component.errorMessage).toBe('Failed to load node names. Please try again.');
  });

  it('should handle error in getCalculateResults gracefully', () => {
    component.selectedDataSetId = 1;
    component.selectedGroupingId = 'g1';
    component.selectedAnalytics = ['a1'];

    mockDataService.getNodeNames.and.returnValue(of([]));
    mockDataService.getCalculateResults.and.returnValue(throwError(() => new Error('Fail')));

    component.loadData();

    expect(component.errorMessage).toBe('Failed to load calculation results. Please try again.');
  });

  it('should update selectedAnalytics on checkbox change', () => {
    const mockEvent = { target: { checked: true } };
    component.onAnalyticsChange(mockEvent, 'a1');
    expect(component.selectedAnalytics).toContain('a1');

    const uncheckEvent = { target: { checked: false } };
    component.onAnalyticsChange(uncheckEvent, 'a1');
    expect(component.selectedAnalytics).not.toContain('a1');
  });

  it('getItemIdByTrack should return the item id', () => {
    const item = { id: 'node-1' };
    expect(component.getItemIdByTrack(0, item)).toBe('node-1');
  });
});
