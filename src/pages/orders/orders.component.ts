
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DataService } from '../../data.service';
import { CommonModule } from '@angular/common';

type StatusFilter = 'All' | 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class OrdersComponent {
  dataService = inject(DataService);
  allOrders = this.dataService.getOrders();
  activeFilter = signal<StatusFilter>('All');

  filteredOrders = computed(() => {
    const filter = this.activeFilter();
    if (filter === 'All') {
      return this.allOrders();
    }
    return this.allOrders().filter(order => order.status === filter);
  });

  setFilter(filter: StatusFilter) {
    this.activeFilter.set(filter);
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      case 'Pending': return 'bg-orange-100 text-orange-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
