
import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const APP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout.component').then(c => c.MainLayoutComponent),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', loadComponent: () => import('./pages/home/home.component').then(c => c.HomeComponent) },
      { path: 'product/:id', loadComponent: () => import('./pages/product-detail/product-detail.component').then(c => c.ProductDetailComponent) },
      { path: 'cart', loadComponent: () => import('./pages/cart/cart.component').then(c => c.CartComponent) },
      { path: 'shipping', loadComponent: () => import('./pages/shipping/shipping.component').then(c => c.ShippingComponent) },
      { path: 'payment', loadComponent: () => import('./pages/payment/payment.component').then(c => c.PaymentComponent) },
      { path: 'orders', loadComponent: () => import('./pages/orders/orders.component').then(c => c.OrdersComponent) },
      { path: 'products', loadComponent: () => import('./pages/products/products.component').then(c => c.ProductsComponent) },
      { path: 'about', loadComponent: () => import('./pages/about/about.component').then(c => c.AboutComponent) },
      { path: 'contact', loadComponent: () => import('./pages/contact/contact.component').then(c => c.ContactComponent) }
    ]
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./pages/admin/login/login.component').then(c => c.AdminLoginComponent),
  },
  {
    path: 'admin',
    loadComponent: () => import('./layouts/admin-layout.component').then(c => c.AdminLayoutComponent),
    canActivate: [authGuard],
    children: [
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        { path: 'dashboard', loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(c => c.AdminDashboardComponent) },
        { path: 'products', loadComponent: () => import('./pages/admin/product-list/product-list.component').then(c => c.AdminProductListComponent) },
        { path: 'products/edit/:id', loadComponent: () => import('./pages/admin/product-edit/product-edit.component').then(c => c.AdminProductEditComponent) },
        { path: 'products/new', loadComponent: () => import('./pages/admin/product-edit/product-edit.component').then(c => c.AdminProductEditComponent) },
        { path: 'orders', loadComponent: () => import('./pages/admin/order-list/order-list.component').then(c => c.AdminOrderListComponent) },
        { path: 'orders/:id', loadComponent: () => import('./pages/admin/order-detail/order-detail.component').then(c => c.AdminOrderDetailComponent) },
        { path: 'users', loadComponent: () => import('./pages/admin/users/users.component').then(c => c.AdminUsersComponent) },
        { path: 'settings', loadComponent: () => import('./pages/admin/settings/settings.component').then(c => c.AdminSettingsComponent) },
    ]
  },
  { path: '**', redirectTo: 'home' } // Wildcard route
];