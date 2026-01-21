
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
// FIX: Import ParamMap to correctly type route parameters.
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
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
  // FIX: Explicitly type `fb` to prevent TypeScript from inferring it as `unknown`.
  fb: FormBuilder = inject(FormBuilder);
  notificationService = inject(NotificationService);

  private orderIdSignal = toSignal(
    // FIX: Explicitly type `params` as `ParamMap` to resolve `get` method.
    this.route.paramMap.pipe(map((params: ParamMap) => params.get('id')))
  );

  order = computed(() => {
    const id = this.orderIdSignal();
    return id ? this.dataService.getOrderById(id) : undefined;
  });

  isShipModalOpen = signal(false);
  statuses: Order['status'][] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  
  shippingForm = this.fb.group({
    carrier: ['', Validators.required],
    trackingNumber: ['', Validators.required],
    estimatedDelivery: ['', Validators.required],
  });

  get a() {
    return 's'
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
    return this.statuses.indexOf(status);
  }
}
