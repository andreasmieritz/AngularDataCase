import { Component, OnInit } from '@angular/core';
import { DataService } from './data.service';

export interface DataSetResponse {
  id: number;
  displayName: string;
}
export interface AnalyticResponse {
  id: string;
  displayName: string;
}
export interface GroupingResponse {
  id: string;
  displayName: string;
}
export interface NodeResponse {
  id: string;
  displayName: string;
}
export interface CalculateNodeResponse {
  id: string;
  result: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public dataSets: DataSetResponse[] = [];
  public groupings: GroupingResponse[] = [];
  public analytics: AnalyticResponse[] = [];
  public calculatedAnalytics: CalculateNodeResponse[] = [];
  public nodeResults: { nodeName: string, result: number }[] = [];
  selectedDataSet: DataSetResponse | null = null;
  selectedGrouping: GroupingResponse | null = null;
  selectedAnalytics: AnalyticResponse | null= null;
  displayedAnalytics: AnalyticResponse | null = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.getDataSets();
    this.getGroupings();
    this.getAnalytics();
  }

  loadData() {
   this.nodeResults = [];
    this.errorMessage = null;
    this.isLoading = true;

    if (!this.selectedDataSet || !this.selectedGrouping || !this.selectedAnalytics) {
      this.errorMessage = 'Please select a dataset, grouping, and an analytic.';
      this.isLoading = false;
      return;
    }

    this.displayedAnalytics = this.selectedAnalytics;

    this.dataService.getNodeNames(this.selectedGrouping.id).subscribe({
      next: (nodes) => {
        const nodeMap = new Map(nodes.map(n => [n.id, n.displayName]));
        this.dataService.getCalculateResults(
          this.selectedGrouping!.id,
          this.selectedAnalytics!.id,
          this.selectedDataSet!.id
        ).subscribe({
          next: (results: CalculateNodeResponse[]) => {
            this.nodeResults = results
              .filter(r => nodeMap.has(r.id)) 
              .map(r => ({
                nodeName: nodeMap.get(r.id) ?? r.id,
                result: r.result
              }));

            this.isLoading = false;
            if (this.nodeResults.length === 0) {
              this.errorMessage = 'No results available for the selected combination.';
            }
          },
          error: (error) => {
            this.errorMessage = 'Failed to load analytic results. Please try again.';
            this.isLoading = false;
            console.error(error);
          }
        });
      },
      error: (error) => {
        this.errorMessage = 'Failed to load node names. Please try again.';
        this.isLoading = false;
        console.error(error);
      }
    });
  }

  
  getGroupings() {
    this.dataService.getGroupings().subscribe({
      next: (result: GroupingResponse[]) => {
        this.groupings = result;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load groupings.';
        console.error(error);
      }
    });
  }
  getDataSets() {
    this.dataService.getDataSets().subscribe({
      next: (result: DataSetResponse[]) => {
        this.dataSets = result;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load datasets.';
        console.error(error);
      }
    });
  }


   getAnalytics() {
    this.dataService.getAnalytics().subscribe({
      next: (result: AnalyticResponse[]) => {
        this.analytics = result;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load analytics.';
        console.error(error);
      }
    });
  }
}
