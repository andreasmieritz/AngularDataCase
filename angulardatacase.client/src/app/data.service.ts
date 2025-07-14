import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  DataSetResponse, 
  GroupingResponse, 
  AnalyticResponse, 
  NodeResponse, 
  CalculateNodeResponse 
} from './app.component';

@Injectable({
  providedIn: 'root' 
})
export class DataService {
  private readonly apiUrl = '/api/data';

  constructor(private http: HttpClient) {}
  
  // API calls for fetching datasets, groupings, and analytics
  getDataSets(): Observable<DataSetResponse[]> {
    return this.http.get<DataSetResponse[]>(`${this.apiUrl}/getdatasets`);
  }

  getGroupings(): Observable<GroupingResponse[]> {
    return this.http.get<GroupingResponse[]>(`${this.apiUrl}/getgroupings`);
  }

  getAnalytics(): Observable<AnalyticResponse[]> {
    return this.http.get<AnalyticResponse[]>(`${this.apiUrl}/getanalytics`);
  }

  // API call for getting node names based on grouping
  getNodeNames(groupingId: string): Observable<NodeResponse[]> {
    return this.http.get<NodeResponse[]>(`${this.apiUrl}/getnodenames?grouping=${groupingId}`);
  }

  // API call for getting calculation results
  // Updated to handle multiple analytics (comma-separated)
  getCalculateResults(groupingId: string, analyticIds: string, dataSetId: number): Observable<CalculateNodeResponse[]> {
    return this.http.get<CalculateNodeResponse[]>(
      `${this.apiUrl}/calculate?grouping=${groupingId}&analytic=${analyticIds}&dataSet=${dataSetId}`
    );
  }
}