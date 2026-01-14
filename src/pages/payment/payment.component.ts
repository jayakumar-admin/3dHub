
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../cart.service';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../notification.service';
import { DataService } from '../../data.service';
import { Settings } from '../../models';

// This lets TypeScript know that the Razorpay object is loaded from an external script.
declare var Razorpay: any;

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
})
export class PaymentComponent {
  router = inject(Router);
  cartService = inject(CartService);
  dataService = inject(DataService);
  notificationService = inject(NotificationService);

  settings = this.dataService.getSettings();
  paymentSettings = computed(() => this.settings().payment);
  
  placeOrder() {
    const paymentConfig = this.paymentSettings();
    if (!paymentConfig.razorpayEnabled || !paymentConfig.razorpayKeyId) {
      this.notificationService.show('Payment processing is not configured.', 'error');
      return;
    }

    const shippingAddr = this.cartService.shippingAddress();
    if (!shippingAddr) {
        this.notificationService.show('Shipping address not found. Please complete the shipping step.', 'error');
        this.router.navigate(['/shipping']);
        return;
    }

    const options = {
      key: paymentConfig.razorpayKeyId,
      amount: this.cartService.total() * 100, // Amount is in currency subunits. for INR, it's paise.
      currency: "INR",
      name: paymentConfig.companyNameForPayment,
      description: "Order Payment",
      image: paymentConfig.companyLogoForPayment,
      // order_id: "order_9A33XG579H2PA", // This is a sample Order ID. In a real app, you would create this on your server.
      handler: (response: any) => {
        // This function is called after the payment is successful.
        console.log('Razorpay Response:', response);
        this.notificationService.show(`Payment successful! ID: ${response.razorpay_payment_id}`, 'success');
        this.cartService.clearCart();
        this.router.navigate(['/orders']);
      },
      prefill: {
        name: shippingAddr.fullName,
        // For a real app, you'd get the email from the logged-in user or a form.
        email: "customer@example.com", 
        contact: shippingAddr.phone
      },
      notes: {
        address: `${shippingAddr.address}, ${shippingAddr.city}`
      },
      theme: {
        color: "#3b82f6" // Corresponds to primary-light
      }
    };
    
    try {
      const rzp = new Razorpay(options);
      rzp.open();
    } catch (e) {
      console.error('Razorpay Error:', e);
      this.notificationService.show('Error initiating payment.', 'error');
    }
  }
}
