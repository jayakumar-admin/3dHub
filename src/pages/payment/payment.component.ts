
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../cart.service';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../notification.service';
import { DataService } from '../../data.service';
import { Order, PaymentDetails } from '../../models';
import { AuthService } from '../../auth.service';
import { environment } from '../../environments/environment';

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
  
  skipPaymentEnabled = environment.skipPayment;
  isPlacingOrder = signal(false);

  private _createOrder(paymentDetails: PaymentDetails) {
    this.isPlacingOrder.set(true);

    const currentUser = this.currentUser();
    if (!currentUser) {
      this.notificationService.show('You must be logged in to place an order.', 'error');
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/payment' } });
      this.isPlacingOrder.set(false);
      return;
    }

    const shippingAddr = this.cartService.shippingAddress();
    if (!shippingAddr) {
      this.notificationService.show('Shipping address not found. Please complete the shipping step.', 'error');
      this.router.navigate(['/shipping']);
      this.isPlacingOrder.set(false);
      return;
    }

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
      userId: currentUser.id,
      paymentDetails: paymentDetails,
    };

    this.dataService.createOrder(orderData).subscribe({
      next: (orderResponse) => {
        const newOrder: Order = {
          id: orderResponse.order.id,
          orderDate: new Date().toISOString().split('T')[0],
          customerName: orderData.customerDetails.name,
          customerEmail: orderData.customerDetails.email,
          customerAvatar: orderData.customerDetails.avatar,
          shippingAddress: orderData.shippingAddress,
          totalAmount: orderData.totalAmount,
          status: 'Pending',
          items: orderData.items,
          paymentDetails: paymentDetails
        };
        this.dataService.addOrderToSignal(newOrder);

        this.sendWhatsappNotifications(newOrder, shippingAddr.phone);

        const successMessage = paymentDetails.provider === 'Mock'
          ? `Order placed successfully (mock): ${orderResponse.order.id}`
          : `Payment successful! Order placed: ${orderResponse.order.id}`;
        this.notificationService.show(successMessage, 'success');

        this.cartService.clearCart();
        this.router.navigate(['/order-success', orderResponse.order.id]);
      },
      error: (err) => {
        const message = err?.error?.message || 'Please contact support.';
        console.error('Order creation failed:', err);
        const errorMessage = paymentDetails.provider === 'Mock'
          ? `Order creation failed: ${message}`
          : `Payment was successful, but creating your order failed: ${message}`;
        this.notificationService.show(errorMessage, 'error');
        this.isPlacingOrder.set(false);
      },
    });
  }

  placeOrder() {
    const paymentConfig = this.paymentSettings();
    if (!paymentConfig.razorpayEnabled || !paymentConfig.razorpayKeyId) {
      this.notificationService.show('Payment processing is not configured.', 'error');
      return;
    }

    const shippingAddr = this.cartService.shippingAddress();
    const currentUser = this.currentUser();

    if (!shippingAddr || !currentUser) {
      this.notificationService.show('Please complete shipping details and log in.', 'error');
      if (!shippingAddr) this.router.navigate(['/shipping']);
      else this.router.navigate(['/login']);
      return;
    }
    
    this.isPlacingOrder.set(true);

    const options = {
      key: paymentConfig.razorpayKeyId,
      amount: this.cartService.total() * 100, // Amount is in currency subunits. for INR, it's paise.
      currency: "INR",
      name: paymentConfig.companyNameForPayment,
      description: "Order Payment for " + this.cartService.cartItems().map(i => i.productName).join(', '),
      image: paymentConfig.companyLogoForPayment,
      handler: (response: any) => {
        const paymentDetails: PaymentDetails = {
          paymentId: response.razorpay_payment_id,
          provider: 'Razorpay'
        };
        this._createOrder(paymentDetails);
      },
      modal: {
        ondismiss: () => {
          this.isPlacingOrder.set(false); // Reset loading state if user closes modal
        }
      },
      prefill: {
        name: shippingAddr.fullName,
        email: currentUser.email,
        contact: shippingAddr.phone,
      },
      notes: {
        address: `${shippingAddr.address}, ${shippingAddr.city}, ${shippingAddr.state} - ${shippingAddr.zip}`,
        user_id: currentUser.id,
        items_summary: this.cartService.cartItems().map(item => `${item.productName} (Qty: ${item.quantity})`).join('; ')
      },
      theme: {
        color: "#3b82f6", // Corresponds to primary-light
      },
    };

    try {
      const rzp = new Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        this.notificationService.show('Payment failed. Please try again or contact support.', 'error');
        console.error('Razorpay payment failed:', response.error);
        this.isPlacingOrder.set(false);
      });
      rzp.open();
    } catch (e) {
      console.error('Razorpay Initialization Error:', e);
      this.notificationService.show('Error initiating payment.', 'error');
      this.isPlacingOrder.set(false);
    }
  }

  placeMockOrder() {
    const mockPaymentDetails: PaymentDetails = {
      paymentId: `MOCK_${Date.now()}`,
      provider: 'Mock'
    };
    this._createOrder(mockPaymentDetails);
  }

  private sendWhatsappNotifications(order: Order, customerPhone: string) {
    const notificationSettings = this.settings().whatsappNotifications;
  
    if (!notificationSettings?.enableOrderNotifications) {
      return;
    }
  
    const placeholders: { [key: string]: string } = {
      '[ORDER_ID]': order.id,
      '[CUSTOMER_NAME]': order.customerName,
      '[TOTAL_AMOUNT]': order.totalAmount.toString(),
    };
  
    const replacePlaceholders = (template: string): string => {
      return template.replace(/\[ORDER_ID\]|\[CUSTOMER_NAME\]|\[TOTAL_AMOUNT\]/g, (match) => placeholders[match]);
    };

    const customerMessage = replacePlaceholders(notificationSettings.customerOrderMessage);
    const adminMessage = replacePlaceholders(notificationSettings.adminOrderMessage);
  
    if (notificationSettings.apiProvider === 'mock_server') {
      // Simulate server-side API call
      console.log('--- SIMULATING SERVER-SIDE WHATSAPP NOTIFICATION ---');
      if (customerPhone && customerMessage) {
        console.log(`To Customer (${customerPhone}): ${customerMessage}`);
      }
      if (notificationSettings.adminPhoneNumber && adminMessage) {
        console.log(`To Admin (${notificationSettings.adminPhoneNumber}): ${adminMessage}`);
      }
      console.log('Using API Key:', notificationSettings.apiKey);
      console.log('From Sender Number:', notificationSettings.senderNumber);
      console.log('----------------------------------------------------');
      this.notificationService.show('Order notifications sent (simulated).', 'success');
    } else {
      // Fallback to client-side wa.me links
      if (customerPhone && customerMessage) {
        const customerWhatsappUrl = `https://wa.me/${customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(customerMessage)}`;
        window.open(customerWhatsappUrl, '_blank');
      }
    
      if (notificationSettings.adminPhoneNumber && adminMessage) {
        const adminWhatsappUrl = `https://wa.me/${notificationSettings.adminPhoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(adminMessage)}`;
        window.open(adminWhatsappUrl, '_blank');
      }
    }
  }
}
