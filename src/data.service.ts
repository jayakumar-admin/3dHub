
import { Injectable, signal, inject } from '@angular/core';
import { Product, Category, Order, User, Settings, OrderItem } from './models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, of } from 'rxjs';
import { environment } from './environments/environment';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_ORDERS, MOCK_USERS, MOCK_SETTINGS } from './data/mock-data';

@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  private products = signal<Product[]>([]);
  private categories = signal<Category[]>([]);
  private orders = signal<Order[]>([]);
  private users = signal<User[]>([]);
  private settings = signal<Settings>(this.getDefaultSettings());

  constructor() {
    if (environment.useTestData) {
      this.loadMockData();
    } else {
      this.loadPublicData();
      if (this.authService.isAdmin()) {
        this.loadAdminData();
      }
    }
  }

  // --- Data Loading ---
  
  private loadMockData() {
    console.log('--- RUNNING IN TEST MODE ---');
    this.products.set(MOCK_PRODUCTS);
    this.categories.set(MOCK_CATEGORIES);
    this.orders.set(MOCK_ORDERS);
    this.users.set(MOCK_USERS);
    this.settings.set(MOCK_SETTINGS);
  }

  loadPublicData() {
    if (environment.useTestData) return;
    this.http.get<Settings>(`${this.apiUrl}/settings`).subscribe(s => this.settings.set(s));
    this.http.get<Product[]>(`${this.apiUrl}/products`).subscribe(p => this.products.set(p));
    this.http.get<Category[]>(`${this.apiUrl}/products/categories`).subscribe(c => this.categories.set(c));
  }

  loadAdminData() {
    if (environment.useTestData) return; // In test mode, all data is loaded at once.
    if (!this.authService.isAdmin()) return;
    this.http.get<Order[]>(`${this.apiUrl}/orders`, this.getAuthHeaders()).subscribe(o => this.orders.set(o));
    this.http.get<User[]>(`${this.apiUrl}/users`, this.getAuthHeaders()).subscribe(u => this.users.set(u));
  }

  // --- Getters ---

  getProducts() { return this.products; }
  getProductById(id: string) { return this.products().find((p) => p.id === id); }
  getCategories() { return this.categories; }
  getCategoryById(id: string) { return this.categories().find(c => c.id === id); }
  getOrders() { return this.orders; }
  getOrderById(id: string) { return this.orders().find(o => o.id === id); }
  getUsers() { return this.users; }
  getSettings() { return this.settings; }
  
  // --- Data Manipulation Methods ---

  updateOrderStatus(orderId: string, status: Order['status'], shippingInfo?: Order['shippingInfo']) {
    if (environment.useTestData) {
      this.orders.update(orders =>
        orders.map(order =>
          order.id === orderId ? { ...order, status, shippingInfo: shippingInfo || order.shippingInfo } : order
        )
      );
    } else {
      this.http.put(`${this.apiUrl}/orders/${orderId}/status`, { status, shippingInfo }, this.getAuthHeaders())
        .subscribe(() => {
          this.orders.update(orders =>
            orders.map(order =>
              order.id === orderId ? { ...order, status, shippingInfo: shippingInfo || order.shippingInfo } : order
            )
          );
        });
    }
  }

  saveProduct(product: Product) {
    if (environment.useTestData) {
      const isEdit = !!this.getProductById(product.id);
      if (isEdit) {
        this.products.update(products => products.map(p => p.id === product.id ? product : p));
      } else {
        this.products.update(products => [...products, product]);
      }
    } else {
      const isEdit = !!this.getProductById(product.id);
      const url = isEdit ? `${this.apiUrl}/products/${product.id}` : `${this.apiUrl}/products`;
      const request$ = isEdit 
        ? this.http.put<Product>(url, product, this.getAuthHeaders()) 
        : this.http.post<Product>(url, product, this.getAuthHeaders());

      request$.subscribe(savedProduct => {
        if (isEdit) {
          this.products.update(products => products.map(p => p.id === savedProduct.id ? savedProduct : p));
        } else {
          this.products.update(products => [...products, savedProduct]);
        }
      });
    }
  }

  deleteProduct(productId: string) {
    if (environment.useTestData) {
      this.products.update(products => products.filter(p => p.id !== productId));
    } else {
      this.http.delete(`${this.apiUrl}/products/${productId}`, this.getAuthHeaders()).subscribe(() => {
          this.products.update(products => products.filter(p => p.id !== productId));
      });
    }
  }
  
  createUser(user: User): Observable<User> {
    if (environment.useTestData) {
      this.users.update(users => [...users, user]);
      return of(user);
    } else {
      // In a real app, the password would be sent and hashed on the backend.
      const { password, ...userData } = user;
      return this.http.post<User>(`${this.apiUrl}/users`, userData);
    }
  }

  saveUser(userToSave: User) {
    if (environment.useTestData) {
      this.users.update(users => users.map(u => u.id === userToSave.id ? userToSave : u));
    } else {
      this.http.put<User>(`${this.apiUrl}/users/${userToSave.id}`, userToSave, this.getAuthHeaders()).subscribe(updatedUser => {
          this.users.update(users => users.map(u => u.id === updatedUser.id ? updatedUser : u));
      });
    }
  }

  deleteUser(userId: string) {
    if (environment.useTestData) {
      this.users.update(users => users.filter(u => u.id !== userId));
    } else {
      this.http.delete(`${this.apiUrl}/users/${userId}`, this.getAuthHeaders()).subscribe(() => {
          this.users.update(users => users.filter(u => u.id !== userId));
      });
    }
  }

  saveSettings(newSettings: Settings) {
    if (environment.useTestData) {
      this.settings.set(newSettings);
    } else {
      this.http.put(`${this.apiUrl}/settings`, newSettings, this.getAuthHeaders()).subscribe(() => {
          this.settings.set(newSettings);
      });
    }
  }
  
  createOrder(orderData: any): Observable<{success: boolean, order: Order}> {
    if (environment.useTestData) {
      const newOrder: Order = {
        id: `ORD-MOCK-${Date.now()}`,
        orderDate: new Date().toISOString().split('T')[0],
        customerName: orderData.customerDetails.name,
        customerEmail: orderData.customerDetails.email,
        customerAvatar: orderData.customerDetails.avatar || 'https://picsum.photos/seed/new_cust/100/100',
        shippingAddress: orderData.shippingAddress,
        totalAmount: orderData.totalAmount,
        status: 'Pending',
        items: orderData.items as OrderItem[],
      };
      this.orders.update(orders => [newOrder, ...orders]);
      return of({ success: true, order: newOrder });
    } else {
      return this.http.post<{success: boolean, order: Order}>(`${this.apiUrl}/orders`, orderData);
    }
  }

  getTopSellingProducts(limit: number): Product[] {
    const sales: { [key: string]: number } = {};
    this.orders().forEach(order => {
      order.items.forEach(item => {
        sales[item.productId] = (sales[item.productId] || 0) + item.quantity;
      });
    });

    return Object.entries(sales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([productId]) => this.getProductById(productId))
      .filter((p): p is Product => p !== undefined);
  }

  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = this.authService.getToken();
    if (!token) return { headers: new HttpHeaders() };
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }
  
  private getDefaultSettings(): Settings {
    return {
      general: { websiteName: 'Loading...', logoUrlLight: '', logoUrlDark: '', faviconUrl: '' },
      contact: { email: '', phone: '', whatsappNumber: '', address: '', whatsappEnabled: false, whatsappDefaultMessage: '' },
      footer: { description: '', copyrightText: '', socialMediaLinks: [], quickLinks: [] },
      homePage: {
        heroSection: { enabled: false, slides: [] },
        featuresSection: { enabled: false, title: '', features: [] },
        testimonialsSection: { enabled: false, title: '', testimonials: [] },
      },
      seo: { metaTitle: '3D Hub', metaDescription: '' },
      aboutPage: {
        heroTitle: '', heroSubtitle: '', heroImageUrl: '', storyTitle: '', storyContent: '', storyImageUrl: '',
        missionVisionSection: { enabled: false, title: '', missionTitle: '', missionContent: '', visionTitle: '', visionContent: '' },
        teamSection: { enabled: false, title: '', members: [] },
      },
      payment: { razorpayEnabled: false, razorpayKeyId: '', companyNameForPayment: '', companyLogoForPayment: '' },
      shipping: { flatRateEnabled: false, flatRateCost: 0, freeShippingEnabled: false, freeShippingThreshold: 0 },
      returns: { returnsEnabled: false, returnWindowDays: 0, returnPolicy: '' }
    };
  }
}
