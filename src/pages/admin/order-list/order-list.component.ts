
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DataService } from '../../../data.service';
import { Order } from '../../../models';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-order-list',
  templateUrl: './order-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
})
export class AdminOrderListComponent {
  dataService = inject(DataService);
  searchQuery = signal('');

  filteredOrders = computed(() => {
    const orders = this.dataService.getOrders()();
    const query = this.searchQuery().toLowerCase();
    if (!query) {
      return orders;
    }
    return orders.filter(
      (order) =>
        order.id.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query)
    );
  });
  
  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'Shipped': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'Processing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/50 dark:text-yellow-200';
      case 'Pending': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
      case 'Cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
