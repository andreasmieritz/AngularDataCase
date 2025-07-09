import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent, DataSetResponse, GroupingResponse, AnalyticResponse } from './app.component';
import { of, throwError } from 'rxjs';
import { DataService } from './data.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockDataService: jasmine.SpyObj<DataService>;

  beforeEach(async () => {
    const dataServiceSpy = jasmine.createSpyObj('DataService', [
      'getDataSets',
      'getGroupings',
      'getAnalytics',
      'getNodeNames',
      'getCalculateResults'
    ]);

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        { provide: DataService, useValue: dataServiceSpy }
      ]
    }).compileComponents();

    mockDataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should call getDataSets, getGroupings and getAnalytics on ngOnInit', () => {
    mockDataService.getDataSets.and.returnValue(of([]));
    mockDataService.getGroupings.and.returnValue(of([]));
    mockDataService.getAnalytics.and.returnValue(of([]));

    component.ngOnInit();

    expect(mockDataService.getDataSets).toHaveBeenCalled();
    expect(mockDataService.getGroupings).toHaveBeenCalled();
    expect(mockDataService.getAnalytics).toHaveBeenCalled();
  });

  
  it('should fetch and display node results successfully in loadData', () => {
    const mockDataSet: DataSetResponse = { id: 1, displayName: 'Dataset 1' };
    const mockGrouping: GroupingResponse = { id: 'G1', displayName: 'Group 1' };
    const mockAnalytic: AnalyticResponse = { id: 'A1', displayName: 'Analytic 1' };
    const mockNodes: any[] = [
      { id: 'N1', displayName: 'Node One' },
      { id: 'N2', displayName: 'Node Two' }
    ];
    const mockResults:any[] = [
      { id: 'N1', result: 100 },
      { id: 'N2', result: 200 }
    ];

    component.selectedDataSet = mockDataSet;
    component.selectedGrouping = mockGrouping;
    component.selectedAnalytics = mockAnalytic;
    mockDataService.getNodeNames.and.returnValue(of(mockNodes));
    mockDataService.getCalculateResults.and.returnValue(of(mockResults));

    component.loadData();

    expect(mockDataService.getNodeNames).toHaveBeenCalledWith('G1');
    expect(mockDataService.getCalculateResults).toHaveBeenCalledWith('G1', 'A1', 1);
    expect(component.nodeResults).toEqual([
      { nodeName: 'Node One', result: 100 },
      { nodeName: 'Node Two', result: 200 }
    ]);

    expect(component.displayedAnalytics).toEqual(mockAnalytic);
    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBeNull();
  });

   it('should handle node fetch error in loadData', () => {
    const mockDataSet: DataSetResponse = { id: 1, displayName: 'Dataset 1' };
    const mockGrouping: GroupingResponse = { id: 'G1', displayName: 'Group 1' };
    const mockAnalytic: AnalyticResponse = { id: 'A1', displayName: 'Analytic 1' };

    component.selectedDataSet = mockDataSet;
    component.selectedGrouping = mockGrouping;
    component.selectedAnalytics = mockAnalytic;
    mockDataService.getNodeNames.and.returnValue(throwError(() => new Error('Node fetch failed')));

    component.loadData();

    expect(mockDataService.getNodeNames).toHaveBeenCalledWith('G1');
    expect(mockDataService.getCalculateResults).not.toHaveBeenCalled();
    expect(component.nodeResults).toEqual([]);
    expect(component.errorMessage).toBe('Failed to load node names. Please try again.');
    expect(component.isLoading).toBeFalse();
  });


});
