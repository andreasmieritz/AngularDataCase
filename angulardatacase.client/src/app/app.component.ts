import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

interface DataSetResponse {
  id: number,
  displayName: string
}
interface AnalyticResponse {
  id: string,
  displayName: string,
  checked: boolean
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
  public selectedDataSetId: DataSetResponse | null = null;
  public selectedGrouping: GroupingResponse | null = null;
  public selectedAnalytics: string[] | null = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getDataSets();
    this.getGroupings();
    this.getAnalytics();
    //this.getNodeNames();
    //this.calculate();
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
 onDataSetChange() {

 }
 onAnalyticChange(id: string, checked: boolean): void {
  console.log('analytic', id, checked);
  this.selectedAnalytics = this.analytics
    .filter(a => a.checked)
    .map(a => a.id);
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

  updateResults(): void {
    debugger;
  if (!this.selectedGrouping) { return; }

  // GROUPING NODES
  this.http
      .get<NodeResponse[]>(`/api/data/getnodenames?grouping=${this.selectedGrouping}`)
      .subscribe(nodes => (this.groupingNodes = nodes));

  // CALCULATION
  if (this.selectedAnalytics?.length) {
    const analyticsParam = this.selectedAnalytics.join(',');
    this.http
        .get<CalculateNodeResponse[]>(
          `/api/data/calculate?grouping=${this.selectedGrouping}` +
          `&analytic=${analyticsParam}&dataSet=${this.selectedDataSetId}`)
        .subscribe(result => (this.calculatedAnalytics = result));
  } else {
    this.calculatedAnalytics = [];
  }
}

  title = 'angulardatacase.client';
}
