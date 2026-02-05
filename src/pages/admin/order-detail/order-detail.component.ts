import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { DataService } from '../../../data.service';
import { Order } from '../../../models';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService } from '../../../notification.service';

@Component({
  selector: 'app-admin-order-detail',
  templateUrl: './order-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
})
export class AdminOrderDetailComponent {
  route = inject(ActivatedRoute);
  dataService = inject(DataService);
  fb: FormBuilder = inject(FormBuilder);
  notificationService = inject(NotificationService);
  router = inject(Router);

  private orderIdSignal = toSignal(
    this.route.paramMap.pipe(map((params: ParamMap) => params.get('id')))
  );

  order = computed(() => {
    const id = this.orderIdSignal();
    if (!id) return undefined;
    return this.dataService.getOrders()().find(o => o.id === id);
  });

  isShipModalOpen = signal(false);
  statuses: Order['status'][] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  
  shippingForm = this.fb.group({
    carrier: ['', Validators.required],
    trackingNumber: ['', Validators.required],
    estimatedDelivery: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      const id = this.orderIdSignal();
      if (id) {
        const existingOrder = this.order();
        if (!existingOrder || !existingOrder.items || existingOrder.items.length === 0) {
          this.dataService.fetchOrderDetails(id).pipe(
            catchError(err => {
                console.error('Failed to fetch order details', err);
                this.notificationService.show('Order not found.', 'error');
                this.router.navigate(['/admin/orders']);
                return of(undefined);
            })
          ).subscribe();
        }
      }
    });
  }

  updateStatus(newStatus: Order['status']) {
    const order = this.order();
    if (!order) return;

    if (newStatus === 'Shipped') {
      this.isShipModalOpen.set(true);
    } else {
      this.dataService.updateOrderStatus(order.id, newStatus);
      this.notificationService.show(`Order status updated to ${newStatus}`);
    }
  }

  saveShippingInfo() {
    if (this.shippingForm.invalid) {
        this.notificationService.show('Please fill all shipping fields.', 'error');
        return;
    }
    const order = this.order();
    if (order) {
        const shippingInfo = this.shippingForm.value as Order['shippingInfo'];
        this.dataService.updateOrderStatus(order.id, 'Shipped', shippingInfo);
        this.notificationService.show('Order marked as shipped and details saved.');
        this.closeModal();
    }
  }

  closeModal() {
    this.isShipModalOpen.set(false);
    this.shippingForm.reset();
  }

  // UI Helpers
  get aStatusIndex() {
    const status = this.order()?.status;
    if(!status) return -1;
    
    // 'Cancelled' status should not show progress.
    if (status === 'Cancelled') {
      return -1;
    }
    
    // The visual tracker has its own set of statuses.
    const visualStatuses: Order['status'][] = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    return visualStatuses.indexOf(status);
  }
}