
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
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

  filteredProducts = computed(() => {
    const query = this.searchService.searchQuery().toLowerCase();
    if (!query) {
      return this.allProducts();
    }
    return this.allProducts().filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
  });
}
