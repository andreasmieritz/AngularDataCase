import { TestBed } from '@angular/core/testing';
import { DataService } from './data.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import {
  DataSetResponse,
  GroupingResponse,
  AnalyticResponse,
  NodeResponse,
  CalculateNodeResponse
} from './app.component';

describe('DataService', () => {
  let service: DataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DataService]
    });

    service = TestBed.inject(DataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); 
  });

  it('should fetch datasets', () => {
    const mockResponse: DataSetResponse[] = [{ id: 1, displayName: 'Dataset 1' }];

    service.getDataSets().subscribe(data => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/data/getdatasets');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch groupings', () => {
    const mockResponse: GroupingResponse[] = [{ id: 'g1', displayName: 'Group 1' }];

    service.getGroupings().subscribe(data => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/data/getgroupings');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch analytics', () => {
    const mockResponse: AnalyticResponse[] = [{ id: 'a1', displayName: 'Analytic 1' }];

    service.getAnalytics().subscribe(data => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/data/getanalytics');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch node names by groupingId', () => {
    const mockResponse: NodeResponse[] = [{ id: 'n1', displayName: 'Node 1' }];
    const groupingId = 'group1';

    service.getNodeNames(groupingId).subscribe(data => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`/api/data/getnodenames?grouping=${groupingId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch calculated results', () => {
    const mockResponse: CalculateNodeResponse[] = [{ id: 'n1', result: 42 }];
    const groupingId = 'group1';
    const analyticIds = 'a1,a2';
    const dataSetId = 5;

    service.getCalculateResults(groupingId, analyticIds, dataSetId).subscribe(data => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`/api/data/calculate?grouping=${groupingId}&analytic=${analyticIds}&dataSet=${dataSetId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});