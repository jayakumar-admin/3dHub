
import { ChangeDetectionStrategy, Component, computed, inject, signal, effect } from '@angular/core';
import { DataService } from '../../data.service';
import { SearchService } from '../../search.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductCardComponent, CommonModule],
})
export class ProductsComponent {
  dataService = inject(DataService);
  searchService = inject(SearchService);

  allProducts = this.dataService.getProducts();
  categories = this.dataService.getCategories();
  
  maxPrice = computed(() => {
    const products = this.allProducts();
    if (!products || products.length === 0) return 5000;
    const max = Math.max(...products.map(p => p.price));
    return Math.ceil(max / 1000) * 1000; // Round up to nearest 1000
  });

  // Filter states
  selectedCategory = signal<string>('all');
  priceFilter = signal(this.maxPrice());
  sortBy = signal<string>('featured');
  
  // Mobile filter visibility
  isFiltersOpen = signal(false);

  constructor() {
    // When the component initializes or the max price changes,
    // update the filter to match. This effectively sets the initial value.
    effect(() => {
      this.priceFilter.set(this.maxPrice());
    }, { allowSignalWrites: true });
  }

  filteredProducts = computed(() => {
    const query = this.searchService.searchQuery().toLowerCase();
    const category = this.selectedCategory();
    const maxPriceVal = this.priceFilter();
    const sort = this.sortBy();
    
    let products = [...this.allProducts()];

    // 1. Filter by search query
    if (query) {
      products = products.filter(p => 
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // 2. Filter by category
    if (category !== 'all') {
      products = products.filter(p => p.category === category);
    }

    // 3. Filter by price
    products = products.filter(p => p.price <= maxPriceVal);

    // 4. Sort
    switch (sort) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      // 'featured' is default, use original order.
    }
    
    return products;
  });

  selectCategory(categoryId: string) {
    this.selectedCategory.set(categoryId);
    // On mobile, close the filter panel after selection for better UX
    if (window.innerWidth < 768) {
      this.isFiltersOpen.set(false);
    }
  }

  updatePriceFilter(event: Event) {
    this.priceFilter.set(Number((event.target as HTMLInputElement).value));
  }
  
  updateSortBy(event: Event) {
    this.sortBy.set((event.target as HTMLSelectElement).value);
  }

  resetFilters() {
    this.selectedCategory.set('all');
    this.priceFilter.set(this.maxPrice());
    this.sortBy.set('featured');
    this.isFiltersOpen.set(false);
  }

  toggleFilters() {
    this.isFiltersOpen.update(v => !v);
  }
}
