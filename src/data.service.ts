
import { Injectable, signal, inject } from '@angular/core';
import { Product, Category, Order, User, Settings, OrderItem, ContactSubmission } from './models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, of } from 'rxjs';
import { environment } from './environments/environment';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_ORDERS, MOCK_USERS, MOCK_SETTINGS, MOCK_CONTACT_SUBMISSIONS } from './data/mock-data';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private apiUrl = environment.apiUrl;

  private products = signal<Product[]>([]);
  private categories = signal<Category[]>([]);
  private orders = signal<Order[]>([]);
  private users = signal<User[]>([]);
  private settings = signal<Settings>(this.getDefaultSettings());
  private contactSubmissions = signal<ContactSubmission[]>([]);

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

  private handleError(userMessage: string, error: any) {
    console.error(userMessage, error);
    const serverMessage = error?.error?.message || 'An unknown server error occurred.';
    this.notificationService.show(`${userMessage}: ${serverMessage}`, 'error');
  }

  // --- Data Loading ---
  
  private loadMockData() {
    console.log('--- RUNNING IN TEST MODE ---');
    this.products.set(MOCK_PRODUCTS);
    this.categories.set(MOCK_CATEGORIES);
    this.orders.set(MOCK_ORDERS);
    this.users.set(MOCK_USERS);
    this.settings.set(MOCK_SETTINGS);
    this.contactSubmissions.set(MOCK_CONTACT_SUBMISSIONS);
  }

  loadPublicData() {
    if (environment.useTestData) return;
    this.http.get<Settings>(`${this.apiUrl}/settings`).subscribe({
      next: s => this.settings.set(s),
      error: err => this.handleError('Failed to load settings', err)
    });
    this.http.get<Product[]>(`${this.apiUrl}/products`).subscribe({
      next: p => this.products.set(p),
      error: err => this.handleError('Failed to load products', err)
    });
    this.http.get<Category[]>(`${this.apiUrl}/products/categories`).subscribe({
      next: c => this.categories.set(c),
      error: err => this.handleError('Failed to load categories', err)
    });
  }

  loadAdminData() {
    if (environment.useTestData) return; // In test mode, all data is loaded at once.
    if (!this.authService.isAdmin()) return;
    this.http.get<Order[]>(`${this.apiUrl}/orders`, this.getAuthHeaders()).subscribe({
      next: o => this.orders.set(o),
      error: err => this.handleError('Failed to load orders', err)
    });
    this.http.get<User[]>(`${this.apiUrl}/users`, this.getAuthHeaders()).subscribe({
      next: u => this.users.set(u),
      error: err => this.handleError('Failed to load users', err)
    });
    this.http.get<ContactSubmission[]>(`${this.apiUrl}/contact`, this.getAuthHeaders()).subscribe({
      next: cs => this.contactSubmissions.set(cs),
      error: err => this.handleError('Failed to load contact submissions', err)
    });
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
  getContactSubmissions() { return this.contactSubmissions; }
  
  // --- Data Manipulation Methods ---

  submitContactForm(formData: { name: string, email: string, message: string }): Observable<ContactSubmission> {
    if (environment.useTestData) {
      const newSubmission: ContactSubmission = {
        id: Date.now(),
        ...formData,
        status: 'New',
        submitted_at: new Date().toISOString()
      };
      this.contactSubmissions.update(submissions => [newSubmission, ...submissions]);
      return of(newSubmission);
    } else {
      return this.http.post<ContactSubmission>(`${this.apiUrl}/contact`, formData);
    }
  }

  updateContactSubmissionStatus(id: number, status: ContactSubmission['status']) {
    if (environment.useTestData) {
      this.contactSubmissions.update(submissions => 
        submissions.map(s => s.id === id ? { ...s, status } : s)
      );
    } else {
      this.http.put<ContactSubmission>(`${this.apiUrl}/contact/${id}/status`, { status }, this.getAuthHeaders())
        .subscribe({
          next: updatedSubmission => {
            this.contactSubmissions.update(submissions => 
              submissions.map(s => s.id === id ? updatedSubmission : s)
            );
          },
          error: err => this.handleError('Failed to update submission status', err)
        });
    }
  }

  uploadImage(file: File, folder: string): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    
    // Note: When sending FormData, HttpClient sets the Content-Type header automatically,
    // so we don't include it in our custom headers to avoid conflicts.
    const token = this.authService.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
    return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/upload`, formData, { headers });
  }

  updateOrderStatus(orderId: string, status: Order['status'], shippingInfo?: Order['shippingInfo']) {
    if (environment.useTestData) {
      this.orders.update(orders =>
        orders.map(order =>
          order.id === orderId ? { ...order, status, shippingInfo: shippingInfo || order.shippingInfo } : order
        )
      );
    } else {
      this.http.put(`${this.apiUrl}/orders/${orderId}/status`, { status, shippingInfo }, this.getAuthHeaders())
        .subscribe({
          next: () => {
            this.orders.update(orders =>
              orders.map(order =>
                order.id === orderId ? { ...order, status, shippingInfo: shippingInfo || order.shippingInfo } : order
              )
            );
          },
          error: err => this.handleError('Failed to update order status', err)
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

      request$.subscribe({
        next: savedProduct => {
          if (isEdit) {
            this.products.update(products => products.map(p => p.id === savedProduct.id ? savedProduct : p));
          } else {
            this.products.update(products => [...products, savedProduct]);
          }
        },
        error: err => this.handleError('Failed to save product', err)
      });
    }
  }

  deleteProduct(productId: string) {
    if (environment.useTestData) {
      this.products.update(products => products.filter(p => p.id !== productId));
    } else {
      this.http.delete(`${this.apiUrl}/products/${productId}`, this.getAuthHeaders()).subscribe({
          next: () => {
            this.products.update(products => products.filter(p => p.id !== productId));
          },
          error: err => this.handleError('Failed to delete product', err)
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
      this.http.put<User>(`${this.apiUrl}/users/${userToSave.id}`, userToSave, this.getAuthHeaders()).subscribe({
        next: updatedUser => {
          this.users.update(users => users.map(u => u.id === updatedUser.id ? updatedUser : u));
        },
        error: err => this.handleError('Failed to save user', err)
      });
    }
  }

  deleteUser(userId: string) {
    if (environment.useTestData) {
      this.users.update(users => users.filter(u => u.id !== userId));
    } else {
      this.http.delete(`${this.apiUrl}/users/${userId}`, this.getAuthHeaders()).subscribe({
        next: () => {
          this.users.update(users => users.filter(u => u.id !== userId));
        },
        error: err => this.handleError('Failed to delete user', err)
      });
    }
  }

  saveSettings(newSettings: Settings) {
    if (environment.useTestData) {
      this.settings.set(newSettings);
    } else {
      this.http.put(`${this.apiUrl}/settings`, newSettings, this.getAuthHeaders()).subscribe({
        next: () => {
          this.settings.set(newSettings);
        },
        error: err => this.handleError('Failed to save settings', err)
      });
    }
  }
  
  addOrderToSignal(order: Order) {
    this.orders.update(orders => [order, ...orders]);
  }

  createOrder(orderData: any): Observable<{success: boolean, order: Order}> {
    if (environment.useTestData) {
      const newOrder: Order = {
        id: `ORD-MOCK-${Date.now()}`,
        orderDate: new Date().toISOString().split('T')[0],
        customerName: orderData.customerDetails.name,
        customerEmail: orderData.customerDetails.email,
        customerAvatar: orderData.customerDetails.avatar || 'https://via.placeholder.com/100',
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
    return { headers: new HttpHeaders({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }) };
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