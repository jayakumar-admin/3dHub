
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SearchService {
  searchQuery = signal<string>('');

  setSearchQuery(query: string) {
    this.searchQuery.set(query);
  }
}
