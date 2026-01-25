
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService, ShippingAddress } from '../../cart.service';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../notification.service';

@Component({
  selector: 'app-shipping',
  templateUrl: './shipping.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
})
export class ShippingComponent {
  fb: FormBuilder = inject(FormBuilder);
  router = inject(Router);
  cartService = inject(CartService);
  notificationService = inject(NotificationService);

  shippingForm = this.fb.group({
    fullName: ['', Validators.required],
    address: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    zip: ['', [Validators.required, Validators.pattern('^[0-9]{6}(?:-[0-9]{4})?$')]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
  });

  constructor() {
    // Pre-fill form if address already exists in service
    const existingAddress = this.cartService.shippingAddress();
    if (existingAddress) {
      this.shippingForm.patchValue(existingAddress);
    }
  }

  proceedToPayment() {
    if (this.shippingForm.valid) {
      this.cartService.saveShippingAddress(this.shippingForm.value as ShippingAddress);
      this.router.navigate(['/payment']);
    } else {
      this.shippingForm.markAllAsTouched();
      this.notificationService.show('Please fill all required fields correctly.', 'error');
    }
  }

  // Getters for template validation
  get fullName() { return this.shippingForm.get('fullName'); }
  get address() { return this.shippingForm.get('address'); }
  get city() { return this.shippingForm.get('city'); }
  get state() { return this.shippingForm.get('state'); }
  get zip() { return this.shippingForm.get('zip'); }
  get phone() { return this.shippingForm.get('phone'); }
}
