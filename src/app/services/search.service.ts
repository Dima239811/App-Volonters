// services/search.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SearchCriteria {
  keywords?: string;
  category?: string;
  date?: string;
  city?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchCriteria = new BehaviorSubject<SearchCriteria>({});
  currentSearchCriteria = this.searchCriteria.asObservable();

  updateSearchCriteria(criteria: SearchCriteria) {
    this.searchCriteria.next(criteria);
  }
}