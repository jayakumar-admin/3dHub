
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DataService } from '../../../data.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface ProductSalesData {
  name: string;
  total: number;
}

interface ChartBar extends ProductSalesData {
  x: string;
  y: string;
  width: string;
  height: string;
  textX: string;
  displayName: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink]
})
export class AdminDashboardComponent {
  dataService = inject(DataService);

  private orders = this.dataService.getOrders();
  private products = this.dataService.getProducts();
  private users = this.dataService.getUsers();
  
  hoveredBar = signal<ProductSalesData | null>(null);
  tooltipPosition = signal({ x: 0, y: 0 });


  totalRevenue = computed(() => {
    return this.orders()
      .filter(o => o.status === 'Delivered')
      .reduce((sum, order) => sum + Number(order.totalAmount), 0);
  });
  
  newCustomersThisMonth = computed(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return this.users().filter(u => {
      if (!u.joinedDate) return false;
      const joinedDate = new Date(u.joinedDate);
      return joinedDate >= firstDayOfMonth;
    }).length;
  });

  stats = computed(() => ({
    revenue: this.totalRevenue(),
    orders: this.orders().length,
    products: this.products().length,
    newCustomers: this.newCustomersThisMonth(),
  }));

  recentOrders = computed(() => this.orders().slice(0, 5));
  topProducts = computed(() => this.dataService.getTopSellingProducts(5));

  productSalesData = computed(() => {
    const deliveredOrders = this.orders().filter(o => o.status === 'Delivered');
    const salesByProductId: { [productId: string]: number } = {};

    for (const order of deliveredOrders) {
      for (const item of order.items) {
        salesByProductId[item.productId] = (salesByProductId[item.productId] || 0) + (Number(item.price) * item.quantity);
      }
    }
    
    return Object.entries(salesByProductId)
      .map(([productId, total]) => ({
        product: this.dataService.getProductById(productId),
        total: total
      }))
      .filter(item => !!item.product) // Filter out if product not found for some reason
      .sort((a, b) => b.total - a.total)
      .slice(0, 6)
      .map(item => ({ name: item.product!.name, total: item.total }));
  });

  maxSales = computed(() => {
    if (!this.productSalesData().length) return 10000;
    const max = Math.max(...this.productSalesData().map(d => d.total), 0);
    if (max === 0) return 10000; // Avoid division by zero, provide a default scale
    return Math.ceil(max / 1000) * 1000; // Round up to nearest 1k for a cleaner axis
  });
  
  yAxisLabels = computed(() => {
    const max = this.maxSales();
    if (max === 0) return [0];
    const step = max / 4;
    return Array.from({ length: 5 }, (_, i) => max - i * step);
  });

  chartBars = computed<ChartBar[]>(() => {
    const data = this.productSalesData();
    if (data.length === 0) return [];

    const yAxisWidthPercent = 8;
    const chartAreaWidthPercent = 100 - yAxisWidthPercent;
    const barGroupWidthPercent = chartAreaWidthPercent / data.length;
    const barWidthPercent = barGroupWidthPercent * 0.6;
    const max = this.maxSales();

    return data.map((item, index) => {
      const heightPercent = max > 0 ? (item.total / max) * 100 : 0;
      return {
        ...item,
        displayName: item.name.length > 15 ? item.name.substring(0, 12) + '...' : item.name,
        x: `${yAxisWidthPercent + (index * barGroupWidthPercent) + (barGroupWidthPercent * 0.2)}%`,
        y: `${100 - heightPercent}%`,
        width: `${barWidthPercent}%`,
        height: `${heightPercent}%`,
        textX: `${yAxisWidthPercent + (index * barGroupWidthPercent) + (barGroupWidthPercent / 2)}%`,
      };
    });
  });

  onBarHover(event: MouseEvent, barData: ProductSalesData) {
    this.hoveredBar.set(barData);
    const rect = (event.target as SVGElement).getBoundingClientRect();
    this.tooltipPosition.set({
      x: rect.left + window.scrollX + rect.width / 2,
      y: rect.top + window.scrollY - 10,
    });
  }

  onBarLeave() {
    this.hoveredBar.set(null);
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
