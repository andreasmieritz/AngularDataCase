import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSelectionListChange } from '@angular/material/list';
import {
  BehaviorSubject, forkJoin, of, Subject
} from 'rxjs';
import {
  switchMap, distinctUntilChanged, tap, shareReplay, takeUntil,
  finalize
} from 'rxjs/operators';

interface DataSetResponse { id: number; displayName: string; }
interface AnalyticResponse { id: string; displayName: string; checked: boolean; }
interface GroupingResponse { id: string; displayName: string; }
interface NodeResponse { id: string; displayName: string; }
interface CalculateNodeResponse { id: string; result: number; }

interface FilterState {
  datasetId: number | null;
  groupingId: string | null;
  analytics: string[];
}

const nodeCache = new Map<string, NodeResponse[]>();
const calcCache = new Map<string, CalculateNodeResponse[]>();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {

  dataSets: DataSetResponse[] = [];
  groupings: GroupingResponse[] = [];
  analytics: AnalyticResponse[] = [];

  groupingNodes: NodeResponse[] = [];
  calculatedAnalytics: CalculateNodeResponse[] = [];

  selectedDataSetId: number | null = null;
  selectedGrouping: string | null = null;
  selectedAnalytics: string[] = [];

  isLoadingNodes = false;
  isLoadingCalc = false;

  private destroy$ = new Subject<void>();
  private filter$ = new BehaviorSubject<FilterState>({
    datasetId: null,
    groupingId: null,
    analytics: []
  });
  isLoadingDropdowns: boolean | undefined;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadStaticLists();

    this.filter$.pipe(
      distinctUntilChanged((a, b) => a.groupingId === b.groupingId),
      switchMap(f => {
        if (!f.groupingId) { return of([] as NodeResponse[]); }

        const key = f.groupingId;
        if (nodeCache.has(key)) { return of(nodeCache.get(key)!); }

        this.isLoadingNodes = true;

        return this.http.get<NodeResponse[]>(`/api/data/getnodenames?grouping=${key}`)
          .pipe(
            tap(res => nodeCache.set(key, res)),
            tap(() => (this.isLoadingNodes = false))
          );
      }),
      shareReplay(1),
      takeUntil(this.destroy$)
    )
      .subscribe(res => (this.groupingNodes = res));

    this.filter$.pipe(
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      switchMap(f => {
        if (!f.groupingId || f.analytics.length === 0) {
          return of([] as CalculateNodeResponse[]);
        }

        const key = JSON.stringify(f);
        if (calcCache.has(key)) { return of(calcCache.get(key)!); }

        this.isLoadingCalc = true;

        const analyticsParam = f.analytics.join(',');
        const url =
          `/api/data/calculate?grouping=${f.groupingId}` +
          `&analytic=${analyticsParam}&dataSet=${f.datasetId ?? ''}`;

        return this.http.get<CalculateNodeResponse[]>(url).pipe(
          tap(res => calcCache.set(key, res)),
          tap(() => (this.isLoadingCalc = false))
        );
      }),
      shareReplay(1),
      takeUntil(this.destroy$)
    )
      .subscribe(res => (this.calculatedAnalytics = res));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  private loadStaticLists(): void {
    this.isLoadingDropdowns = true;

    forkJoin({
      dataSets: this.http.get<DataSetResponse[]>('/api/data/getdatasets'),
      groupings: this.http.get<GroupingResponse[]>('/api/data/getgroupings'),
      analytics: this.http.get<AnalyticResponse[]>('/api/data/getanalytics')
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoadingDropdowns = false)
      )
      .subscribe(({ dataSets, groupings, analytics }) => {
        this.dataSets = dataSets;
        this.groupings = groupings;
        this.analytics = analytics;
      });
  }

  updateDataset(id: number | null) {
    const s = this.filter$.value;
    this.filter$.next({ ...s, datasetId: id });
  }

  updateGrouping(id: string | null) {
    const s = this.filter$.value;
    this.filter$.next({ ...s, groupingId: id });
  }

  onAnalyticsChange(evt: MatSelectionListChange) {
    const selectedValues = evt.source.selectedOptions.selected.map(item => item.value);
    this.updateAnalytics(selectedValues);
  }

  updateAnalytics(list: string[]) {
    const s = this.filter$.value;
    this.filter$.next({ ...s, analytics: list });
  }

  trackById(_: number, item: { id: string | number }) {
    return item.id;
  }
}
