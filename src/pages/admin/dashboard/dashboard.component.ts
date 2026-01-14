
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DataService } from '../../../data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class AdminDashboardComponent {
  dataService = inject(DataService);

  stats = [
    { title: 'Total Revenue', value: '₹54,320', icon: 'currency-dollar', color: 'bg-green-500' },
    { title: 'Total Orders', value: this.dataService.getOrders()().length, icon: 'shopping-cart', color: 'bg-blue-500' },
    { title: 'Total Products', value: this.dataService.getProducts()().length, icon: 'cube', color: 'bg-purple-500' },
    { title: 'New Customers', value: '12', icon: 'users', color: 'bg-yellow-500' }
  ];

  recentOrders = this.dataService.getOrders()().slice(0, 5);
  topProducts = this.dataService.getTopSellingProducts(3);

  salesData = [
    { month: 'Jan', sales: 6500 }, { month: 'Feb', sales: 5900 }, { month: 'Mar', sales: 8000 },
    { month: 'Apr', sales: 8100 }, { month: 'May', sales: 5600 }, { month: 'Jun', sales: 9500 },
    { month: 'Jul', sales: 7200 },
  ];

  maxSales = computed(() => Math.max(...this.salesData.map(d => d.sales), 0));

  getBarHeight(sales: number): string {
    const maxHeight = this.maxSales();
    return maxHeight > 0 ? `${(sales / maxHeight) * 100}%` : '0%';
  }
}
