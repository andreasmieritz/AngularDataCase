import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AppComponent } from './app.component';
import { DisplayNamePipe } from './display-name-pipe';

describe('AppComponent – dashboard logic', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let httpMock: HttpTestingController;

  const mockDataSets = [
    { id: 1, displayName: 'DS-One' },
    { id: 2, displayName: 'DS-Two' },
  ];

  const mockGroupings = [
    { id: 'grp-a', displayName: 'Grouping A' },
    { id: 'grp-b', displayName: 'Grouping B' },
  ];

  const mockAnalytics = [
    { id: 'an-1', displayName: 'Analytic 1', checked: false },
    { id: 'an-2', displayName: 'Analytic 2', checked: false },
  ];

  const mockNodesGrpA = [
    { id: 'n-1', displayName: 'Node 1' },
    { id: 'n-2', displayName: 'Node 2' },
  ];

  const mockCalcResponse = [
    { id: 'n-1', result: 42 },
    { id: 'n-2', result: 84 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [HttpClientTestingModule, DisplayNamePipe],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    // trigger ngOnInit
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  function flushStaticRequests(
    dataSets = mockDataSets,
    groupings = mockGroupings,
    analytics = mockAnalytics
  ) {
    httpMock.expectOne('/api/data/getdatasets').flush(dataSets);
    httpMock.expectOne('/api/data/getgroupings').flush(groupings);
    httpMock.expectOne('/api/data/getanalytics').flush(analytics);
  }

  it('should create', fakeAsync(() => {
    flushStaticRequests();
    tick();
    expect(component).toBeTruthy();
  }));

  it('should load dropdown data on init', fakeAsync(() => {
    flushStaticRequests();
    tick();

    expect(component.dataSets).toEqual(mockDataSets);
    expect(component.groupings).toEqual(mockGroupings);
    expect(component.analytics).toEqual(mockAnalytics);
    expect(component.isLoadingDropdowns).toBeFalse();
  }));

  it('should fetch nodes when grouping changes and then cache the result', fakeAsync(() => {
    flushStaticRequests();

    /* 1. Set grouping = grp-a */
    component.updateGrouping('grp-a');
    const nodeReq = httpMock.expectOne(
      '/api/data/getnodenames?grouping=grp-a'
    );
    nodeReq.flush(mockNodesGrpA);
    tick();

    /* 2. Set grouping to null, then back to grp-a → should use cache */
    component.updateGrouping(null);
    component.updateGrouping('grp-a');
    tick();

    httpMock.expectNone('/api/data/getnodenames?grouping=grp-a');
    expect(component.groupingNodes).toEqual(mockNodesGrpA);
  }));

  it('should call calculation API when dataset, grouping and analytics are set', fakeAsync(() => {
    flushStaticRequests();
    component.updateGrouping('grp-a');
    tick();
    httpMock.expectNone('/api/data/getnodenames?grouping=grp-a');
    component.updateDataset(1);
    component.updateAnalytics(['an-1', 'an-2']);

    const calcReq = httpMock.expectOne(
      '/api/data/calculate?grouping=grp-a&analytic=an-1,an-2&dataSet=1'
    );
    calcReq.flush(mockCalcResponse);
    tick();

    expect(component.calculatedAnalytics).toEqual(mockCalcResponse);
    expect(component.isLoadingCalc).toBeFalse();
  }));


});

describe('DisplayNamePipe', () => {
  const pipe = new DisplayNamePipe();

  it('should map single id to displayName', () => {
    const list = [
      { id: 10, displayName: 'Ten' },
      { id: 11, displayName: 'Eleven' },
    ];
    expect(pipe.transform(10, list)).toBe('Ten');
  });

  it('should map array of ids to comma-separated displayNames', () => {
    const list = [
      { id: 'a', displayName: 'Alpha' },
      { id: 'b', displayName: 'Beta' },
    ];
    const result = pipe.transform(['a', 'b'], list);
    expect(result).toBe('Alpha, Beta');
  });

  it('should return empty string for null/undefined', () => {
    expect(pipe.transform(null, [])).toBe('');
    expect(pipe.transform(undefined, [])).toBe('');
  });
});
