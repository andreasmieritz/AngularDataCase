import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
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
  public nodeResults: { nodeName: string, results: { [analyticDisplayName: string]: number } }[] = [];
  selectedDataSet: DataSetResponse | null = null;
  selectedGrouping: GroupingResponse | null = null;
  selectedAnalytics: AnalyticResponse[] = [];
  displayedAnalytics: AnalyticResponse[] = [];
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
    if (!this.selectedDataSet || !this.selectedGrouping || this.selectedAnalytics.length === 0) {
      this.errorMessage = 'Please select a dataset, grouping, and at least one analytic.';
      this.isLoading = false;
      return;
    }

    this.displayedAnalytics = [...this.selectedAnalytics];

    this.dataService.getNodeNames(this.selectedGrouping.id).subscribe({
      next: (nodes) => {
        const nodeMap = new Map(nodes.map(n => [n.id, n.displayName]));
        // Comment: Fetch results for each selected analytic
        const requests = this.selectedAnalytics.map(analytic =>
          this.dataService.getCalculateResults(
            this.selectedGrouping!.id,
            analytic.id,
            this.selectedDataSet!.id
          )
        );

        forkJoin(requests).subscribe({
          next: (resultsArray: CalculateNodeResponse[][]) => {
            const nodeResultsMap: { [nodeId: string]: { [analyticDisplayName: string]: number } } = {};

            resultsArray.forEach((results, i) => {
              const analyticName = this.selectedAnalytics[i].displayName;
              if (results) {
                results.forEach(r => {
                  if (!nodeResultsMap[r.id]) {
                    nodeResultsMap[r.id] = {};
                  }
                  nodeResultsMap[r.id][analyticName] = r.result;
                });
              }
            });

            this.nodeResults = Object.entries(nodeResultsMap)
              .filter(([_, results]) => Object.keys(results).length > 0)
              .map(([nodeId, results]) => ({
                nodeName: nodeMap.get(nodeId) ?? nodeId,
                results
              }));

            this.isLoading = false;
            if (this.nodeResults.length === 0) {
              this.errorMessage = 'No results available for the selected combination.';
            }
          },
          error: (error) => {
            this.errorMessage = 'Failed to load analytic results. Please try again.';
            this.isLoading = false;
            console.error('Error fetching calculate results:', error);
          }
        });
      },
      error: (error) => {
        this.errorMessage = 'Failed to load node names. Please try again.';
        this.isLoading = false;
        console.error('Error fetching node names:', error);
      }
    });
  }

  private getDataSets() {
    this.dataService.getDataSets().subscribe({
      next: (result: DataSetResponse[]) => {
        this.dataSets = result;
      },
      error: () => {
        this.errorMessage = 'Failed to load datasets.';
        console.error('Error fetching datasets');
      }
    });
  }

  private getGroupings() {
    this.dataService.getGroupings().subscribe({
      next: (result: GroupingResponse[]) => {
        this.groupings = result;
      },
      error: () => {
        this.errorMessage = 'Failed to load groupings.';
        console.error('Error fetching groupings');
      }
    });
  }

  private getAnalytics() {
    this.dataService.getAnalytics().subscribe({
      next: (result: AnalyticResponse[]) => {
        this.analytics = result;
      },
      error: () => {
        this.errorMessage = 'Failed to load analytics.';
        console.error('Error fetching analytics');
      }
    });
  }
}