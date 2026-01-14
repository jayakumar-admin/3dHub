
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DataService } from '../../../data.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-product-list',
  templateUrl: './product-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CommonModule, FormsModule],
})
export class AdminProductListComponent {
  dataService = inject(DataService);
  searchQuery = signal('');
  categoryFilter = signal('all');
  statusFilter = signal<'all' | 'enabled' | 'disabled'>('all');
  
  categories = this.dataService.getCategories();

  filteredProducts = computed(() => {
    const allProducts = this.dataService.getProducts()();
    const query = this.searchQuery().toLowerCase();
    const category = this.categoryFilter();
    const status = this.statusFilter();

    return allProducts.filter((p) => {
        const matchesSearch = query ? p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query) : true;
        const matchesCategory = category === 'all' || p.category === category;
        const matchesStatus = status === 'all' || (status === 'enabled' ? p.enabled : !p.enabled);
        return matchesSearch && matchesCategory && matchesStatus;
      }
    );
  });
  
  onSearchChange(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  getCategoryName(id: string) {
    return this.dataService.getCategoryById(id)?.name ?? 'N/A';
  }

  getDiscount(price: number, oldPrice?: number): string {
    if (!oldPrice || oldPrice <= price) {
      return '—';
    }
    const percentage = Math.round(((oldPrice - price) / oldPrice) * 100);
    return `${percentage}% off`;
  }

  deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.dataService.deleteProduct(id);
    }
  }
}