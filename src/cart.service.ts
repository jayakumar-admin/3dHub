
import { Injectable, signal, computed, effect, PLATFORM_ID, Inject, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { OrderItem, Product } from './models';
import { DataService } from './data.service';

// Define a type for the shipping address form
export type ShippingAddress = {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
} | null;

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private isBrowser = false;
  private dataService = inject(DataService);
  private settings = this.dataService.getSettings();

  cartItems = signal<OrderItem[]>([]);
  shippingAddress = signal<ShippingAddress>(null);

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      const storedCart = sessionStorage.getItem('cartItems');
      if (storedCart) {
        this.cartItems.set(JSON.parse(storedCart));
      }
      const storedShipping = sessionStorage.getItem('shippingAddress');
      if (storedShipping) {
        this.shippingAddress.set(JSON.parse(storedShipping));
      }
    }

    effect(() => {
      if (this.isBrowser) {
        sessionStorage.setItem('cartItems', JSON.stringify(this.cartItems()));
        sessionStorage.setItem('shippingAddress', JSON.stringify(this.shippingAddress()));
      }
    });
  }

  cartCount = computed(() => this.cartItems().reduce((acc, item) => acc + item.quantity, 0));
  
  subtotal = computed(() => this.cartItems().reduce((acc, item) => acc + item.price * item.quantity, 0));
  
  shipping = computed(() => {
    const shippingSettings = this.settings().shipping;
    const subtotal = this.subtotal();
    const address = this.shippingAddress();

    if (subtotal === 0) {
      return 0; // No items, no shipping cost.
    }

    // 1. Check for Pincode-based free shipping
    if (shippingSettings.pincodeFreeShippingEnabled && address && shippingSettings.freeShippingPincodes) {
      const freePincodes = shippingSettings.freeShippingPincodes.split(',').map(p => p.trim()).filter(p => p);
      if (freePincodes.includes(address.zip)) {
        return 0; // Free shipping for this pincode.
      }
    }

    // 2. Check for threshold-based free shipping
    if (shippingSettings.freeShippingEnabled && subtotal >= shippingSettings.freeShippingThreshold) {
      return 0; // Free shipping threshold met.
    }

    // 3. Apply flat rate as a fallback
    if (shippingSettings.flatRateEnabled) {
      return shippingSettings.flatRateCost; // Apply flat rate.
    }
    
    return 0; // Default to 0 if no shipping method is configured.
  });

  total = computed(() => this.subtotal() + this.shipping());

  totalSavings = computed(() => {
    return this.cartItems().reduce((acc, item) => {
      const originalPrice = item.oldPrice || item.price;
      const savings = (originalPrice - item.price) * item.quantity;
      return acc + savings;
    }, 0);
  });


  addToCart(product: Product, quantity: number) {
    this.cartItems.update(items => {
      const existingItem = items.find(item => item.productId === product.id);
      if (existingItem) {
        return items.map(item =>
          item.productId === product.id
            ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) }
            : item
        );
      }
      return [
        ...items,
        {
          productId: product.id,
          productName: product.name,
          quantity: quantity,
          price: product.price,
          image: product.images[0],
          oldPrice: product.oldPrice
        }
      ];
    });
  }

  updateQuantity(productId: string, newQuantity: number) {
    if (newQuantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    this.cartItems.update(items =>
      items.map(item => (item.productId === productId ? { ...item, quantity: newQuantity } : item))
    );
  }

  removeFromCart(productId: string) {
    this.cartItems.update(items => items.filter(item => item.productId !== productId));
  }

  clearCart() {
    this.cartItems.set([]);
    this.shippingAddress.set(null);
  }

  saveShippingAddress(address: ShippingAddress) {
    this.shippingAddress.set(address);
  }
}
