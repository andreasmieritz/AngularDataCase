import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [HttpClientTestingModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should load datasets, groupings and analytics on init', () => {
    component.ngOnInit();

    const dsReq = httpMock.expectOne('/api/data/getdatasets');
    dsReq.flush([{ id: 0, displayName: 'Public' }]);

    const groupReq = httpMock.expectOne('/api/data/getgroupings');
    groupReq.flush([{ id: 'SECURITY', displayName: 'Security' }]);

    const analyticsReq = httpMock.expectOne('/api/data/getanalytics');
    analyticsReq.flush([{ id: 'A1', displayName: 'X Mean' }]);

    expect(component.dataSets.length).toBe(1);
    expect(component.groupings.length).toBe(1);
    expect(component.analytics.length).toBe(1);
  });

  it('should show error if required inputs are missing in loadData', () => {
    component.loadData();

    expect(component.errorMessage).toBe('Please select a dataset, grouping, and at least one analytic.');
    expect(component.isLoading).toBeFalse();
  });

  it('should load node names and calculate analytics data on valid inputs', async () => {
    component.selectedDataSet = { id: 0, displayName: 'Public' };
    component.selectedGrouping = { id: 'SECURITY', displayName: 'Security' };
    component.selectedAnalytics = [
      { id: 'A1', displayName: 'X Mean' },
      { id: 'A2', displayName: 'Y Mean' }
    ];

    component.loadData();

    const nodeReq = httpMock.expectOne('/api/data/getnodenames?grouping=SECURITY');
    expect(nodeReq.request.method).toBe('GET');
    nodeReq.flush([
      { id: 'N1', displayName: 'Node 1' },
      { id: 'N2', displayName: 'Node 2' }
    ]);

    const calcReq1 = httpMock.expectOne('/api/data/calculate?grouping=SECURITY&analytic=A1&dataSet=0');
    expect(calcReq1.request.method).toBe('GET');
    calcReq1.flush([
      { id: 'N1', result: 10 },
      { id: 'N2', result: 20 }
    ]);

    const calcReq2 = httpMock.expectOne('/api/data/calculate?grouping=SECURITY&analytic=A2&dataSet=0');
    expect(calcReq2.request.method).toBe('GET');
    calcReq2.flush([
      { id: 'N1', result: 30 }
    ]);

    await fixture.whenStable();

    expect(component.nodeResults.length).toBe(2);
    expect(component.nodeResults[0].nodeName).toBe('Node 1');
    expect(component.nodeResults[0].results['X Mean']).toBe(10);
    expect(component.nodeResults[0].results['Y Mean']).toBe(30);
    expect(component.nodeResults[1].nodeName).toBe('Node 2');
    expect(component.nodeResults[1].results['X Mean']).toBe(20);
  });

  it('should handle error during getNodeNames gracefully', () => {
    component.selectedDataSet = { id: 0, displayName: 'Public' };
    component.selectedGrouping = { id: 'SECURITY', displayName: 'Security' };
    component.selectedAnalytics = [{ id: 'A1', displayName: 'X Mean' }];

    component.loadData();

    const nodeReq = httpMock.expectOne('/api/data/getnodenames?grouping=SECURITY');
    nodeReq.flush({}, { status: 500, statusText: 'Internal Server Error' });

    expect(component.errorMessage).toBe('Failed to load node names. Please try again.');
    expect(component.isLoading).toBeFalse();
  });

  it('should handle empty analytic results and show no results message', async () => {
    component.selectedDataSet = { id: 0, displayName: 'Public' };
    component.selectedGrouping = { id: 'SECURITY', displayName: 'Security' };
    component.selectedAnalytics = [{ id: 'A1', displayName: 'X Mean' }];

    component.loadData();

    const nodeReq = httpMock.expectOne('/api/data/getnodenames?grouping=SECURITY');
    nodeReq.flush([{ id: 'N1', displayName: 'Node 1' }]);

    const calcReq = httpMock.expectOne('/api/data/calculate?grouping=SECURITY&analytic=A1&dataSet=0');
    calcReq.flush([]); 

    await fixture.whenStable();

    expect(component.nodeResults.length).toBe(0);
    expect(component.errorMessage).toBe('No results available for the selected combination.');
  });
});
