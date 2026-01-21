
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { DataService } from '../../data.service';
import { Order, OrderItem } from '../../models';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../notification.service';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
})
export class OrderDetailComponent {
  route = inject(ActivatedRoute);
  dataService = inject(DataService);
  notificationService = inject(NotificationService);

  private orderIdSignal = toSignal(
    this.route.paramMap.pipe(map(params => params.get('id')))
  );

  order = computed(() => {
    const id = this.orderIdSignal();
    return id ? this.dataService.getOrderById(id) : undefined;
  });
  
  statuses: Order['status'][] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  isReturnable = computed(() => {
    const order = this.order();
    const returnSettings = this.dataService.getSettings()().returns;

    if (!order || !returnSettings.returnsEnabled || order.status !== 'Delivered') {
      return false;
    }

    const orderDate = new Date(order.orderDate);
    const returnDeadline = new Date(orderDate);
    returnDeadline.setDate(orderDate.getDate() + returnSettings.returnWindowDays);

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Compare date part only

    return today <= returnDeadline;
  });

  get aStatusIndex() {
    const status = this.order()?.status;
    if(!status || status === 'Cancelled') return -1;
    return this.statuses.indexOf(status);
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

  requestReturn(item: OrderItem) {
    // In a real application, this would trigger a backend process.
    // For this demo, we'll just show a notification.
    this.notificationService.show(`Return requested for ${item.productName}. We will contact you shortly.`);
  }
}
