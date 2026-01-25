import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
// FIX: `of` is imported from 'rxjs', not 'rxjs/operators', and `Observable` is imported for explicit typing.
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
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

  // FIX: Explicitly typing the observable helps TypeScript's inference for `toSignal`.
  private order$: Observable<Order | undefined> = this.route.paramMap.pipe(
    map((params: ParamMap) => params.get('id')),
    switchMap(id => {
      if (!id) {
        return of(undefined);
      }
      
      const existingOrder = this.dataService.getOrderById(id);
      if (existingOrder && existingOrder.items && existingOrder.items.length > 0) {
        return of(existingOrder);
      }
      
      return this.dataService.fetchOrderDetails(id).pipe(
        catchError(err => {
            console.error('Failed to fetch order details', err);
            this.notificationService.show('Order not found.', 'error');
            this.router.navigate(['/admin/orders']);
            return of(undefined);
        })
      );
    })
  );

  order = toSignal(this.order$);

  isShipModalOpen = signal(false);
  statuses: Order['status'][] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  
  shippingForm = this.fb.group({
    carrier: ['', Validators.required],
    trackingNumber: ['', Validators.required],
    estimatedDelivery: ['', Validators.required],
  });

  updateStatus(newStatus: Order['status']) {
    const order = this.order();
    if (!order) return;

    if (newStatus === 'Shipped') {
      this.isShipModalOpen.set(true);
    } else {
      // FIX: The type of `order` is now correctly inferred as `Order`, making `id` accessible.
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
        // FIX: The type of `order` is now correctly inferred as `Order`, making `id` accessible.
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
    // FIX: The type of `order` is now correctly inferred, so `status` is accessible.
    const status = this.order()?.status;
    if(!status) return -1;
    return this.statuses.indexOf(status);
  }
}
