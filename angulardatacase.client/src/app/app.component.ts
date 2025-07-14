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
  public groupingNodes: NodeResponse[] = [];
  public calculatedAnalytics: CalculateNodeResponse[] = [];

  selectedDataSetId: number | null = null;
  selectedGroupingId: string | null = null;
  selectedAnalytics: string[] = [];

  isLoading = false;
  isLoadingNodes = false;
  isLoadingCalc = false;
  errorMessage: string | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadStaticData();
  }

  private loadStaticData(): void {
    this.dataService.getDataSets().subscribe({
      next: (result) => {
        this.dataSets = result;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load datasets.';
        console.error(error);
      }
    });

    this.dataService.getGroupings().subscribe({
      next: (result) => {
        this.groupings = result;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load groupings.';
        console.error(error);
      }
    });

    this.dataService.getAnalytics().subscribe({
      next: (result) => {
        this.analytics = result;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load analytics.';
        console.error(error);
      }
    });
  }

  onAnalyticsChange(event: any, analyticId: string): void {
    const isChecked = event.target.checked;
    
    if (isChecked) {
      this.selectedAnalytics = [...this.selectedAnalytics, analyticId];
    } else {
      this.selectedAnalytics = this.selectedAnalytics.filter(id => id !== analyticId);
    }
  }

  loadData(): void {
    this.errorMessage = null;
    this.isLoading = true;
    
    if (!this.selectedDataSetId || !this.selectedGroupingId || this.selectedAnalytics.length === 0) {
      this.errorMessage = 'Please select a dataset, grouping, and at least one analytic.';
      this.isLoading = false;
      return;
    }

    // Load nodes and calculations simultaneously
    this.loadNodes();
    this.loadCalculations();
  }
  getItemIdByTrack(index: number, item: { id: string | number }): string | number {
    return item.id;
  }
  private loadNodes(): void {
    if (!this.selectedGroupingId) return;

    this.isLoadingNodes = true;
    this.groupingNodes = [];

    this.dataService.getNodeNames(this.selectedGroupingId).subscribe({
      next: (nodes) => {
        this.groupingNodes = nodes;
        this.isLoadingNodes = false;
        this.checkLoadingComplete();
      },
      error: (error) => {
        this.errorMessage = 'Failed to load node names. Please try again.';
        this.isLoadingNodes = false;
        this.checkLoadingComplete();
        console.error(error);
      }
    });
  }

  private loadCalculations(): void {
    if (!this.selectedGroupingId || !this.selectedDataSetId || this.selectedAnalytics.length === 0) return;

    this.isLoadingCalc = true;
    this.calculatedAnalytics = [];

    this.dataService.getCalculateResults(
      this.selectedGroupingId,
      this.selectedAnalytics.join(','),
      this.selectedDataSetId
    ).subscribe({
      next: (results) => {
        this.calculatedAnalytics = results;
        this.isLoadingCalc = false;
        this.checkLoadingComplete();
      },
      error: (error) => {
        this.errorMessage = 'Failed to load calculation results. Please try again.';
        this.isLoadingCalc = false;
        this.checkLoadingComplete();
        console.error(error);
      }
    });
  }

  private checkLoadingComplete(): void {
    if (!this.isLoadingNodes && !this.isLoadingCalc) {
      this.isLoading = false;
    }
  }


}