
import { Product, Category, Order, User, Settings, ContactSubmission } from '../models';

const BUCKET_NAME = 'ajrmart-14f90.appspot.com';
const BUCKET_BASE_URL = `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/`;
const URL_SUFFIX = `?alt=media`;

const fbUrl = (path: string) => `${BUCKET_BASE_URL}${encodeURIComponent(path)}${URL_SUFFIX}`;

// --- MOCK USERS ---
export const MOCK_USERS: User[] = [
  { id: 'user1', name: 'Admin User', email: 'admin1@gmail.com', avatar: fbUrl('3dHub/users/admin.png'), role: 'Admin', joinedDate: '2023-01-15T09:05:10Z', password: 'admin12345678' },
  { id: 'user2', name: 'Alice Johnson', email: 'alice.j@example.com', avatar: fbUrl('3dHub/users/user1.png'), role: 'Customer', joinedDate: '2024-03-10T14:20:30Z', password: 'password123' },
  { id: 'user3', name: 'Bob Williams', email: 'bob.w@example.com', avatar: fbUrl('3dHub/users/user2.png'), role: 'Customer', joinedDate: '2024-05-02T18:45:00Z', password: 'password123' },
  { id: 'user4', name: 'Charlie Brown', email: 'charlie.b@example.com', avatar: fbUrl('3dHub/users/user3.png'), role: 'Customer', joinedDate: '2024-06-20T11:10:15Z', password: 'password123' },
  { id: 'user5', name: 'Diana Prince', email: 'diana.p@example.com', avatar: fbUrl('3dHub/users/user4.png'), role: 'Customer', joinedDate: '2024-07-01T20:00:05Z', password: 'password123' },
];

// --- MOCK CATEGORIES ---
export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Birthday', icon: 'cake' },
  { id: 'cat2', name: 'Love & Romance', icon: 'heart' },
  { id: 'cat3', name: 'Trending Gifts', icon: 'flame' },
  { id: 'cat4', name: 'Anniversary', icon: 'gift' },
  { id: 'cat5', name: 'Home Decor', icon: 'home' },
  { id: 'cat6', name: 'Personalized', icon: 'user' },
];

// --- MOCK PRODUCTS ---
export const MOCK_PRODUCTS: Product[] = [
    { id: 'prod1', name: 'Resin Wall Clock', description: 'A beautifully handcrafted resin wall clock.', price: 1499, oldPrice: 2000, rating: 5, stock: 15, category: 'cat5', images: [fbUrl('3dHub/products/prod1_1.jpg'), fbUrl('3dHub/products/prod1_2.jpg'), fbUrl('3dHub/products/prod1_3.jpg')], reviews: 112, sku: 'RWC-001', enabled: true, tags: ['home decor', 'clock'], weight: 1.5, dimensions: { length: 30, width: 30, height: 2.5 } },
    { id: 'prod2', name: 'Luxury Gift Hamper', description: 'Curated with the finest products, this luxury gift hamper is perfect for any special occasion.', price: 2499, oldPrice: 3200, rating: 4, stock: 8, category: 'cat2', images: [fbUrl('3dHub/products/prod2_1.jpg'), fbUrl('3dHub/products/prod2_2.jpg')], reviews: 88, sku: 'LGH-001', enabled: true, tags: ['gourmet', 'gift box'], weight: 2.2, dimensions: { length: 35, width: 25, height: 10 } },
    { id: 'prod3', name: 'Memory Scrapbook', description: 'Capture your precious moments in this elegant memory scrapbook.', price: 799, oldPrice: 999, rating: 5, stock: 30, category: 'cat4', images: [fbUrl('3dHub/products/prod3_1.jpg'), fbUrl('3dHub/products/prod3_2.jpg')], reviews: 250, sku: 'MSB-001', enabled: true, tags: ['photo album', 'craft'], weight: 0.8, dimensions: { length: 25, width: 25, height: 3 } },
    { id: 'prod4', name: 'Custom Neon Sign', description: 'Light up your space with a custom neon sign.', price: 3499, rating: 5, stock: 12, category: 'cat6', images: [fbUrl('3dHub/products/prod4_1.jpg'), fbUrl('3dHub/products/prod4_2.jpg')], reviews: 45, sku: 'CNS-001', enabled: false, tags: ['custom', 'lighting'], weight: 2.5, dimensions: { length: 50, width: 20, height: 5 } },
    { id: 'prod5', name: '3D Photo Frame Box', description: 'A unique 3D photo frame box to display your favorite pictures.', price: 1299, oldPrice: 1599, rating: 4, stock: 22, category: 'cat6', images: [fbUrl('3dHub/products/prod5_1.jpg'), fbUrl('3dHub/products/prod5_2.jpg')], reviews: 76, sku: 'PFB-3D-001', enabled: true, tags: ['photo frame', '3d'], weight: 1.1, dimensions: { length: 20, width: 20, height: 8 } },
    { id: 'prod6', name: 'Enchanted Rose Lamp', description: 'Inspired by fairy tales, this beautiful rose is encased in a glass dome with LED lights.', price: 1899, rating: 5, stock: 0, category: 'cat2', images: [fbUrl('3dHub/products/prod6_1.jpg'), fbUrl('3dHub/products/prod6_2.jpg')], reviews: 150, sku: 'ERL-001', enabled: true, tags: ['lamp', 'romance'], weight: 0.7, dimensions: { length: 15, width: 15, height: 25 } },
    { id: 'prod7', name: 'Personalized Name Plate', description: 'A stylish and modern name plate for your home or office.', price: 999, rating: 4, stock: 40, category: 'cat6', images: [fbUrl('3dHub/products/prod7_1.jpg')], reviews: 92, sku: 'PNP-001', enabled: true, tags: ['name plate', 'custom'], weight: 0.5, dimensions: { length: 30, width: 15, height: 1 } },
    { id: 'prod8', name: 'Explosion Gift Box', description: 'A creative and surprising way to gift. When opened, the box "explodes" to reveal photos and messages.', price: 1199, oldPrice: 1499, rating: 5, stock: 18, category: 'cat1', images: [fbUrl('3dHub/products/prod8_1.jpg'), fbUrl('3dHub/products/prod8_2.jpg')], reviews: 133, sku: 'EGB-001', enabled: true, tags: ['gift box', 'surprise'], weight: 0.6, dimensions: { length: 15, width: 15, height: 15 } },
    { id: 'prod9', name: 'Galaxy Moon Lamp', description: 'Bring the galaxy into your room with this stunning, rechargeable 3D printed moon lamp.', price: 1799, rating: 5, stock: 25, category: 'cat3', images: [fbUrl('3dHub/products/prod9_1.jpg'), fbUrl('3dHub/products/prod9_2.jpg')], reviews: 210, sku: 'GML-001', enabled: true, tags: ['lamp', 'space', 'trending'], weight: 0.4, dimensions: { length: 18, width: 18, height: 18 } },
    { id: 'prod10', name: 'Couple Caricature Stand', description: 'A fun and quirky personalized gift for couples.', price: 1599, oldPrice: 1999, rating: 4, stock: 14, category: 'cat4', images: [fbUrl('3dHub/products/prod10_1.jpg')], reviews: 65, sku: 'CCS-001', enabled: true, tags: ['caricature', 'couple', 'anniversary'], weight: 0.3, dimensions: { length: 15, width: 5, height: 20 } }
];

// --- MOCK ORDERS ---
export const MOCK_ORDERS: Order[] = [
    { id: 'ORD-2024-001', orderDate: '2024-07-20T10:30:00Z', customerName: 'Alice Johnson', customerEmail: 'alice.j@example.com', customerAvatar: fbUrl('3dHub/users/user1.png'), shippingAddress: { street: '123 Dream Ave', city: 'Metropolis', state: 'NY', zip: '10001' }, totalAmount: 3998, status: 'Delivered', items: [{ productId: 'prod1', productName: 'Resin Wall Clock', quantity: 1, price: 1499, image: fbUrl('3dHub/products/prod1_thumb.jpg'), oldPrice: 2000 }, { productId: 'prod2', productName: 'Luxury Gift Hamper', quantity: 1, price: 2499, image: fbUrl('3dHub/products/prod2_thumb.jpg'), oldPrice: 3200 }], shippingInfo: { carrier: 'Express Courier', trackingNumber: 'EC123456789', estimatedDelivery: '2024-07-22' } },
    { id: 'ORD-2024-002', orderDate: '2024-07-22T15:00:45Z', customerName: 'Bob Williams', customerEmail: 'bob.w@example.com', customerAvatar: fbUrl('3dHub/users/user2.png'), shippingAddress: { street: '456 Wonder Rd', city: 'Gotham', state: 'NJ', zip: '07001' }, totalAmount: 799, status: 'Shipped', items: [{ productId: 'prod3', productName: 'Memory Scrapbook', quantity: 1, price: 799, image: fbUrl('3dHub/products/prod3_thumb.jpg'), oldPrice: 999 }], shippingInfo: { carrier: 'Standard Post', trackingNumber: 'SP987654321', estimatedDelivery: '2024-07-26' } },
    { id: 'ORD-2024-003', orderDate: '2024-07-23T09:15:10Z', customerName: 'Charlie Brown', customerEmail: 'charlie.b@example.com', customerAvatar: fbUrl('3dHub/users/user3.png'), shippingAddress: { street: '789 Imagination Ln', city: 'Star City', state: 'CA', zip: '90210' }, totalAmount: 3499, status: 'Processing', items: [{ productId: 'prod4', productName: 'Custom Neon Sign', quantity: 1, price: 3499, image: fbUrl('3dHub/products/prod4_thumb.jpg') }] },
    { id: 'ORD-2024-004', orderDate: '2024-07-24T12:05:00Z', customerName: 'Diana Prince', customerEmail: 'diana.p@example.com', customerAvatar: fbUrl('3dHub/users/user4.png'), shippingAddress: { street: '1 Paradise Island', city: 'Themyscira', state: 'DC', zip: '12345' }, totalAmount: 2298, status: 'Pending', items: [{ productId: 'prod8', productName: 'Explosion Gift Box', quantity: 1, price: 1199, image: fbUrl('3dHub/products/prod8_thumb.jpg'), oldPrice: 1499 }, { productId: 'prod7', productName: 'Personalized Name Plate', quantity: 1, price: 999, image: fbUrl('3dHub/products/prod7_thumb.jpg') }] },
    { id: 'ORD-2024-005', orderDate: '2024-07-25T17:40:25Z', customerName: 'Alice Johnson', customerEmail: 'alice.j@example.com', customerAvatar: fbUrl('3dHub/users/user1.png'), shippingAddress: { street: '123 Dream Ave', city: 'Metropolis', state: 'NY', zip: '10001' }, totalAmount: 1899, status: 'Cancelled', items: [{ productId: 'prod6', productName: 'Enchanted Rose Lamp', quantity: 1, price: 1899, image: fbUrl('3dHub/products/prod6_thumb.jpg') }] },
    { id: 'ORD-2024-006', orderDate: '2024-07-26T21:00:00Z', customerName: 'Bob Williams', customerEmail: 'bob.w@example.com', customerAvatar: fbUrl('3dHub/users/user2.png'), shippingAddress: { street: '456 Wonder Rd', city: 'Gotham', state: 'NJ', zip: '07001' }, totalAmount: 3398, status: 'Processing', items: [{ productId: 'prod9', productName: 'Galaxy Moon Lamp', quantity: 1, price: 1799, image: fbUrl('3dHub/products/prod9_thumb.jpg') }, { productId: 'prod10', productName: 'Couple Caricature Stand', quantity: 1, price: 1599, image: fbUrl('3dHub/products/prod10_thumb.jpg'), oldPrice: 1999 }] }
];

// --- MOCK CONTACT SUBMISSIONS ---
export const MOCK_CONTACT_SUBMISSIONS: ContactSubmission[] = [
  { id: 1, name: 'John Doe', email: 'john.d@example.com', message: 'I have a question about the Resin Wall Clock. Is it possible to get it in a custom color?', status: 'New', submitted_at: '2024-07-28T10:30:00Z' },
  { id: 2, name: 'Jane Smith', email: 'jane.s@example.com', message: 'Just wanted to say I love my new Luxury Gift Hamper! The quality is amazing. Thank you!', status: 'Read', submitted_at: '2024-07-27T15:00:00Z' },
  { id: 3, name: 'Sam Wilson', email: 'sam.w@example.com', message: 'There was an issue with my recent delivery. The tracking number does not seem to be working. Can you please look into it? My order ID is ORD-2024-002.', status: 'New', submitted_at: '2024-07-28T12:00:00Z' },
];

// --- MOCK SETTINGS ---
export const MOCK_SETTINGS: Settings = {
  general: { websiteName: '3D Hub (Test)', logoUrlLight: '', logoUrlDark: '', faviconUrl: '' },
  contact: { email: 'support@3dhub.com', phone: '+91 123 456 7890', whatsappNumber: '911234567890', address: '123 Craft Lane, Art City, India', whatsappEnabled: true, whatsappDefaultMessage: 'Hello! I have a question about a product.' },
  footer: { description: 'Your one-stop shop for unique, handcrafted 3D and personalized gifts.', copyrightText: `© ${new Date().getFullYear()} 3D Hub. All Rights Reserved.`, socialMediaLinks: [{ platform: 'facebook', url: '#' },{ platform: 'instagram', url: '#' },{ platform: 'twitter', url: '#' }], quickLinks: [{ title: 'About Us', url: '/about' },{ title: 'Contact', url: '/contact' },{ title: 'All Products', url: '/products' }] },
  homePage: {
    heroSection: { enabled: true, slides: [ { title: '3D Photo Frame Box - Customized Products', subtitle: 'Handcrafted with love, starting from just ₹1299.', ctaText: 'Shop Now', ctaLink: '/products', imageUrl: fbUrl('3dHub/settings/banner1.jpg') }, { title: 'Luxury Gift Hampers for Every Occasion', subtitle: 'Curated with the finest products to delight your loved ones.', ctaText: 'Explore Hampers', ctaLink: '/products', imageUrl: fbUrl('3dHub/settings/banner2.jpg') }, { title: 'Light Up Your World with Custom Neon', subtitle: 'Personalized signs that make a bold statement.', ctaText: 'Design Yours', ctaLink: '/products', imageUrl: fbUrl('3dHub/settings/banner3.jpg') } ] },
    featuresSection: { enabled: true, title: 'Why Choose Us?', features: [ { icon: 'sparkles', title: 'Unique Designs', description: 'Every item is a unique piece of art, crafted with passion.' }, { icon: 'quality', title: 'Premium Quality', description: 'We use only the finest materials for a lasting impression.' }, { icon: 'shipping', title: 'Fast Shipping', description: 'Your handcrafted gifts delivered to your doorstep quickly.' } ] },
    testimonialsSection: { enabled: true, title: 'What Our Customers Say', testimonials: [ { author: 'Priya S.', role: 'Happy Customer', quote: 'The resin clock is stunning! Amazing quality!', avatarUrl: fbUrl('3dHub/testimonials/test1.png') }, { author: 'Rahul K.', role: 'Gift Recipient', quote: 'Received a luxury hamper and it was packed with so many wonderful things. Highly recommended!', avatarUrl: fbUrl('dHub/testimonials/test2.png') } ] }
  },
  seo: { metaTitle: '3D Hub - Unique Handcrafted Gifts', metaDescription: 'Discover a world of personalized and 3D gifts. From resin clocks to custom neon signs, find the perfect present for any occasion.' },
  aboutPage: {
    heroTitle: 'Crafting Memories, One Gift at a Time.', heroSubtitle: 'Learn about our journey, our passion for craftsmanship, and the people who make 3D Hub special.', heroImageUrl: fbUrl('3dHub/settings/about-hero.jpg'), storyTitle: 'Our Story', storyContent: "Welcome to 3D Hub. We're dedicated to giving you the very best of personalized gifts, with a focus on quality, customer service, and uniqueness.\\n\\nFounded in 2023, 3D Hub has come a long way from its beginnings. We now serve customers all over the country and are thrilled to be a part of the quirky, eco-friendly, fair trade wing of the gift industry.", storyImageUrl: fbUrl('3dHub/settings/about-story.jpg'),
    missionVisionSection: { enabled: true, title: 'Our Mission & Vision', missionTitle: 'Our Mission', missionContent: 'To create high-quality, personalized gifts that bring joy and create lasting memories.', visionTitle: 'Our Vision', visionContent: 'To be the leading online destination for unique and handcrafted gifts.' },
    teamSection: { enabled: true, title: 'Meet Our Team', members: [ { name: 'Jane Doe', role: 'Founder & Lead Artist', bio: 'Jane started 3D Hub, driven by a passion for resin art and personalized crafts.', imageUrl: fbUrl('3dHub/team/team1.png') }, { name: 'John Smith', role: 'Operations Manager', bio: 'John ensures everything runs smoothly, from sourcing materials to managing shipments.', imageUrl: fbUrl('3dHub/team/team2.png') }, { name: 'Priya Patel', role: 'Customer Happiness Lead', bio: 'Priya is dedicated to providing the best experience for our customers.', imageUrl: fbUrl('3dHub/team/team3.png') } ] }
  },
  payment: { razorpayEnabled: true, razorpayKeyId: 'rzp_test_YOUR_KEY_ID', companyNameForPayment: '3D Hub (Test Mode)', companyLogoForPayment: fbUrl('3dHub/settings/logo-payment.png') },
  shipping: {
    flatRateEnabled: true,
    flatRateCost: 50,
    freeShippingEnabled: true,
    freeShippingThreshold: 2000,
    pincodeFreeShippingEnabled: true,
    freeShippingPincodes: '10001, 07001, 90210, 12345'
  },
  returns: {
    returnsEnabled: true,
    returnWindowDays: 15,
    returnPolicy: 'Items can be returned within 15 days of delivery. The product must be in its original condition. Please contact support to initiate a return.'
  },
  whatsappNotifications: {
    enableOrderNotifications: true,
    apiProvider: 'graph_api',
    whatsappToken: 'YOUR_GRAPH_API_TOKEN_HERE',
    whatsappPhoneId: 'YOUR_PHONE_NUMBER_ID',
    whatsappVersion: 'v19.0',
    adminPhoneNumber: '919876543210',
    adminNewOrderTemplateName: 'admin_new_order',
    adminNewOrderTemplateParams: '[CUSTOMER_NAME],[ORDER_ID],[TOTAL_AMOUNT]',
    customerNewOrderTemplateName: 'customer_new_order',
    customerNewOrderTemplateParams: '[CUSTOMER_NAME],[ORDER_ID],[TOTAL_AMOUNT]',
    customerProcessingTemplateName: 'order_processing',
    customerProcessingTemplateParams: '[CUSTOMER_NAME],[ORDER_ID]',
    customerShippedTemplateName: 'order_shipped',
    customerShippedTemplateParams: '[ORDER_ID],[CARRIER],[TRACKING_NUMBER]',
    customerDeliveredTemplateName: 'order_delivered',
    customerDeliveredTemplateParams: '[CUSTOMER_NAME],[ORDER_ID]',
    customerCancelledTemplateName: 'order_cancelled',
    customerCancelledTemplateParams: '[CUSTOMER_NAME],[ORDER_ID]'
  }
};