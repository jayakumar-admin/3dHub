
export interface Category {
  id: string;
  name: string;
  icon: string; // SVG path data or icon name
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  rating: number;
  stock: number;
  category: string;
  images: string[];
  reviews: number;
  sku: string;
  enabled: boolean;
  tags?: string[];
  weight?: number; // in kg
  dimensions?: {
    length: number; // in cm
    width: number; // in cm
    height: number; // in cm
  };
}

export interface PaymentDetails {
  paymentId: string;
  provider: string; // e.g., 'Razorpay', 'Mock'
}

export interface Order {
  id: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerAvatar: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: OrderItem[];
  shippingInfo?: {
    carrier: string;
    trackingNumber: string;
    estimatedDelivery: string;
  };
  reviewedProductIds?: string[];
  paymentDetails?: PaymentDetails;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image: string;
  oldPrice?: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: 'Admin' | 'Customer';
    joinedDate: string;
    password?: string; // Added for sign-up and login
    // FIX: Add optional phone property to User model to match signup form
    phone?: string;
}

export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  message: string;
  status: 'New' | 'Read' | 'Archived';
  submitted_at: string;
}

export interface Review {
  id: number;
  productId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// New Settings Models
export interface SocialMediaLink {
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin';
  url: string;
}

export interface QuickLink {
  title: string;
  url: string;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface Testimonial {
  author: string;
  role: string;
  quote: string;
  avatarUrl: string;
}

export interface HeroSlide {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
}

export interface AboutPageSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  storyTitle: string;
  storyContent: string;
  storyImageUrl: string;
  missionVisionSection: {
    enabled: boolean;
    title: string;
    missionTitle: string;
    missionContent: string;
    visionTitle: string;
    visionContent: string;
  };
  teamSection: {
    enabled: boolean;
    title: string;
    members: TeamMember[];
  };
}

export interface PaymentSettings {
    razorpayEnabled: boolean;
    razorpayKeyId: string;
    companyNameForPayment: string;
    companyLogoForPayment: string;
}

export interface ShippingSettings {
  flatRateEnabled: boolean;
  flatRateCost: number;
  freeShippingEnabled: boolean;
  freeShippingThreshold: number;
}

export interface ReturnSettings {
  returnsEnabled: boolean;
  returnWindowDays: number;
  returnPolicy: string;
}

export interface WhatsappNotificationSettings {
  enableOrderNotifications: boolean;
  apiProvider: 'none' | 'mock_server';
  apiKey: string;
  senderNumber: string;
  adminPhoneNumber: string;
  customerOrderMessage: string;
  adminOrderMessage: string;
}


export interface Settings {
  general: {
    websiteName: string;
    logoUrlLight: string;
    logoUrlDark: string;
    faviconUrl: string;
  };
  contact: {
    email: string;
    phone: string;
    whatsappNumber: string;
    address: string;
    whatsappEnabled: boolean;
    whatsappDefaultMessage: string;
  };
  footer: {
    description: string;
    copyrightText: string;
    socialMediaLinks: SocialMediaLink[];
    quickLinks: QuickLink[];
  };
  homePage: {
    heroSection: {
      enabled: boolean;
      slides: HeroSlide[];
    };
    featuresSection: {
      enabled: boolean;
      title: string;
      features: Feature[];
    };
    testimonialsSection: {
      enabled: boolean;
      title: string;
      testimonials: Testimonial[];
    };
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
  aboutPage: AboutPageSettings;
  payment: PaymentSettings;
  shipping: ShippingSettings;
  returns: ReturnSettings;
  whatsappNotifications: WhatsappNotificationSettings;
}
