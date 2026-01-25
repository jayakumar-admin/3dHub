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

  private orders = this.dataService.getOrders();
  private products = this.dataService.getProducts();
  private users = this.dataService.getUsers();

  totalRevenue = computed(() => {
    return this.orders()
      .filter(o => o.status === 'Delivered')
      .reduce((sum, order) => sum + order.totalAmount, 0);
  });
  
  newCustomersThisMonth = computed(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return this.users().filter(u => {
      const joinedDate = new Date(u.joinedDate);
      return joinedDate >= firstDayOfMonth;
    }).length;
  });

  stats = computed(() => [
    { title: 'Total Revenue', value: `₹${this.totalRevenue().toLocaleString('en-IN')}`, icon: 'currency-dollar', color: 'bg-green-500' },
    { title: 'Total Orders', value: this.orders().length, icon: 'shopping-cart', color: 'bg-blue-500' },
    { title: 'Total Products', value: this.products().length, icon: 'cube', color: 'bg-purple-500' },
    { title: 'New Customers (This Month)', value: this.newCustomersThisMonth(), icon: 'users', color: 'bg-yellow-500' }
  ]);

  recentOrders = computed(() => this.orders().slice(0, 5));
  topProducts = computed(() => this.dataService.getTopSellingProducts(3));

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
