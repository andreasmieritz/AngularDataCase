import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

interface DataSetResponse {
  id: number,
  displayName: string
}
interface AnalyticResponse {
  id: string,
  displayName: string
}

interface GroupingResponse {
  id: string,
  displayName: string
}

interface NodeResponse {
  id: string,
  displayName: string
}

interface CalculateNodeResponse {
  id: string,
  result: number
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  public dataSets: DataSetResponse[] = [];
  public groupings: GroupingResponse[] = [];
  public analytics: AnalyticResponse[] = [];
  public groupingNodes: NodeResponse[] = [];
  public calculatedAnalytics: CalculateNodeResponse[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getDataSets();
    this.getGroupings();
    this.getAnalytics();
    this.getNodeNames();
    this.calculate();
  }

  getDataSets() {
    this.http.get<DataSetResponse[]>('/api/data/getdatasets').subscribe(
      (result) => {
        this.dataSets = result;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  getGroupings() {
    this.http.get<GroupingResponse[]>('/api/data/getgroupings').subscribe(
      (result) => {
        this.groupings = result;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  getAnalytics() {
    this.http.get<AnalyticResponse[]>('/api/data/getanalytics').subscribe(
      (result) => {
        this.analytics = result;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  getNodeNames() {
    this.http.get<NodeResponse[]>('/api/data/getnodenames?grouping=SECURITY').subscribe(
      (result) => {
        this.groupingNodes = result;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  calculate() {
    this.http.get<CalculateNodeResponse[]>('/api/data/calculate?grouping=SECURITY&analytic=A1&dataSet=0').subscribe(
      (result) => {
        this.calculatedAnalytics = result;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  title = 'angulardatacase.client';
}
