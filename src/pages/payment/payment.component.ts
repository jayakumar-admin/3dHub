
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../cart.service';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../notification.service';
import { DataService } from '../../data.service';
import { Settings } from '../../models';
import { AuthService } from '../../auth.service';

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
  authService = inject(AuthService);

  settings = this.dataService.getSettings();
  paymentSettings = computed(() => this.settings().payment);
  currentUser = this.authService.currentUser;
  
  placeOrder() {
    const paymentConfig = this.paymentSettings();
    if (!paymentConfig.razorpayEnabled || !paymentConfig.razorpayKeyId) {
      this.notificationService.show('Payment processing is not configured.', 'error');
      return;
    }
    
    const currentUser = this.currentUser();
    if(!currentUser) {
        this.notificationService.show('You must be logged in to place an order.', 'error');
        this.router.navigate(['/login'], { queryParams: { returnUrl: '/payment' } });
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
      handler: (response: any) => {
        // This function is called after the payment is successful.
        const orderData = {
          items: this.cartService.cartItems(),
          totalAmount: this.cartService.total(),
          shippingAddress: {
            street: shippingAddr.address,
            city: shippingAddr.city,
            state: shippingAddr.state,
            zip: shippingAddr.zip,
          },
          customerDetails: {
            name: currentUser.name,
            email: currentUser.email,
            avatar: currentUser.avatar,
          },
          userId: currentUser.id
        };
        
        this.dataService.createOrder(orderData).subscribe({
          next: (orderResponse) => {
             this.notificationService.show(`Payment successful! Order placed: ${orderResponse.order.id}`, 'success');
             this.cartService.clearCart();
             this.router.navigate(['/orders']);
          },
          error: (err) => {
            console.error('Order creation failed:', err);
            this.notificationService.show('Payment was successful, but there was an error creating your order. Please contact support.', 'error');
          }
        });
      },
      prefill: {
        name: shippingAddr.fullName,
        email: currentUser.email, 
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
