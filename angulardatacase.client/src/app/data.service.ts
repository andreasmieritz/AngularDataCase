import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataSetResponse, GroupingResponse, AnalyticResponse, NodeResponse, CalculateNodeResponse } from './app.component';

@Injectable({
  providedIn: 'root' 
})
export class DataService {
   apiUrl = '/api/data';

  constructor(public http: HttpClient) {}
  
  // start: These 3 api calls are used to fetch datasets, groupings, and analytic
  getDataSets(): Observable<DataSetResponse[]> {
    return this.http.get<DataSetResponse[]>(`${this.apiUrl}/getdatasets`);
  }

  getGroupings(): Observable<GroupingResponse[]> {
    return this.http.get<GroupingResponse[]>(`${this.apiUrl}/getgroupings`);
  }

  getAnalytics(): Observable<AnalyticResponse[]> {
    return this.http.get<AnalyticResponse[]>(`${this.apiUrl}/getanalytics`);
  }
// End:
  getNodeNames(groupingId: string): Observable<NodeResponse[]> {
    return this.http.get<NodeResponse[]>(`${this.apiUrl}/getnodenames?grouping=${groupingId}`);
  }

  getCalculateResults(groupingId: string, analyticId: string, dataSetId: number): Observable<CalculateNodeResponse[]> {
    return this.http.get<CalculateNodeResponse[]>(`${this.apiUrl}/calculate?grouping=${groupingId}&analytic=${analyticId}&dataSet=${dataSetId}`);
  }
}