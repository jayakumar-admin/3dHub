
const bcrypt = require('bcryptjs');

// Hash the admin password before seeding
const salt = bcrypt.genSaltSync(10);
const adminPasswordHash = bcrypt.hashSync('admin123', salt);

const users = [
  { id: 'user1', name: 'Admin User', email: 'admin1@gmail.com', password: adminPasswordHash, avatar: 'https://picsum.photos/seed/admin/100/100', role: 'Admin', joined_date: '2023-01-15'},
  { id: 'user2', name: 'Alice Johnson', email: 'alice.j@example.com', password: null, avatar: 'https://picsum.photos/seed/user1/100/100', role: 'Customer', joined_date: '2024-03-10'},
  { id: 'user3', name: 'Bob Williams', email: 'bob.w@example.com', password: null, avatar: 'https://picsum.photos/seed/user2/100/100', role: 'Customer', joined_date: '2024-05-02'},
  { id: 'user4', name: 'Charlie Brown', email: 'charlie.b@example.com', password: null, avatar: 'https://picsum.photos/seed/user3/100/100', role: 'Customer', joined_date: '2024-06-20'},
];

const categories = [
  { id: 'cat1', name: 'Birthday', icon: 'cake' },
  { id: 'cat2', name: 'Love', icon: 'heart' },
  { id: 'cat3', name: 'Trending Gifts', icon: 'flame' },
  { id: 'cat4', name: 'Anniversary', icon: 'gift' },
];

const products = [
    {
      id: 'prod1',
      name: 'Resin Wall Clock',
      description: 'A beautifully handcrafted resin wall clock that adds a touch of elegance to any room. Each piece is unique with its own mesmerizing patterns.',
      price: 1499,
      old_price: 2000,
      stock: 15,
      category_id: 'cat3',
      images: ['https://picsum.photos/seed/prod1/600/600', 'https://picsum.photos/seed/prod1_2/600/600'],
      sku: 'RWC-001',
      enabled: true,
      tags: ['home decor', 'clock', 'resin art'],
      weight_kg: 1.5,
      dimensions: { length: 30, width: 30, height: 2.5 },
    },
    {
      id: 'prod2',
      name: 'Luxury Gift Hamper',
      description: 'Curated with the finest products, this luxury gift hamper is perfect for any special occasion. Includes gourmet chocolates, premium coffee, and more.',
      price: 2499,
      old_price: 3200,
      stock: 8,
      category_id: 'cat2',
      images: ['https://picsum.photos/seed/prod2/600/600', 'https://picsum.photos/seed/prod2_2/600/600'],
      sku: 'LGH-001',
      enabled: true,
      tags: ['gourmet', 'gift box', 'luxury'],
      weight_kg: 2.2,
      dimensions: { length: 35, width: 25, height: 10 },
    },
    {
      id: 'prod3',
      name: 'Memory Scrapbook',
      description: 'Capture your precious moments in this elegant memory scrapbook. High-quality paper and a beautiful cover make it a keepsake to cherish forever.',
      price: 799,
      old_price: 999,
      stock: 30,
      category_id: 'cat4',
      images: ['https://picsum.photos/seed/prod3/600/600', 'https://picsum.photos/seed/prod3_2/600/600'],
      sku: 'MSB-001',
      enabled: true,
      tags: ['photo album', 'memories', 'craft'],
      weight_kg: 0.8,
      dimensions: { length: 25, width: 25, height: 3 },
    },
    {
      id: 'prod4',
      name: 'Custom Neon Sign',
      description: 'Light up your space with a custom neon sign. Perfect for bedrooms, offices, or events. Choose your text, font, and color for a personalized touch.',
      price: 3499,
      old_price: null,
      stock: 12,
      category_id: 'cat1',
      images: ['https://picsum.photos/seed/prod4/600/600', 'https://picsum.photos/seed/prod4_2/600/600'],
      sku: 'CNS-001',
      enabled: false,
      tags: ['custom', 'lighting', 'decor'],
      weight_kg: 2.5,
      dimensions: { length: 50, width: 20, height: 5 },
    },
];

const orders = [
    {
      id: 'ORD-2024-001',
      order_date: '2024-07-20',
      customer_name: 'Alice Johnson',
      customer_email: 'alice.j@example.com',
      shipping_address: { street: '123 Dream Ave', city: 'Metropolis', state: 'NY', zip: '10001' },
      total_amount: 3998,
      status: 'Delivered',
      user_id: 'user2',
      shipping_info: { carrier: 'Express Courier', trackingNumber: 'EC123456789', estimatedDelivery: '2024-07-22' }
    },
    {
      id: 'ORD-2024-002',
      order_date: '2024-07-22',
      customer_name: 'Bob Williams',
      customer_email: 'bob.w@example.com',
      shipping_address: { street: '456 Wonder Rd', city: 'Gotham', state: 'NJ', zip: '07001' },
      total_amount: 799,
      status: 'Shipped',
      user_id: 'user3',
      shipping_info: { carrier: 'Standard Post', trackingNumber: 'SP987654321', estimatedDelivery: '2024-07-26' }
    },
    {
      id: 'ORD-2024-003',
      order_date: '2024-07-23',
      customer_name: 'Charlie Brown',
      customer_email: 'charlie.b@example.com',
      shipping_address: { street: '789 Imagination Ln', city: 'Star City', state: 'CA', zip: '90210' },
      total_amount: 3499,
      status: 'Processing',
      user_id: 'user4',
      shipping_info: null
    },
];

const order_items = [
    // Items for ORD-2024-001
    { order_id: 'ORD-2024-001', product_id: 'prod1', product_name: 'Resin Wall Clock', quantity: 1, price: 1499, old_price: 2000, image: 'https://picsum.photos/seed/prod1/100/100' },
    { order_id: 'ORD-2024-001', product_id: 'prod2', product_name: 'Luxury Gift Hamper', quantity: 1, price: 2499, old_price: 3200, image: 'https://picsum.photos/seed/prod2/100/100' },
    // Item for ORD-2024-002
    { order_id: 'ORD-2024-002', product_id: 'prod3', product_name: 'Memory Scrapbook', quantity: 1, price: 799, old_price: 999, image: 'https://picsum.photos/seed/prod3/100/100' },
    // Item for ORD-2024-003
    { order_id: 'ORD-2024-003', product_id: 'prod4', product_name: 'Custom Neon Sign', quantity: 1, price: 3499, old_price: null, image: 'https://picsum.photos/seed/prod4/100/100' },
];

const settings = {
    general: {
      websiteName: '3D Hub',
      logoUrlLight: '',
      logoUrlDark: '',
      faviconUrl: '',
    },
    contact: {
      email: 'support@3dhub.com',
      phone: '+91 123 456 7890',
      whatsappNumber: '911234567890',
      address: '123 Craft Lane, Art City, India',
    },
    footer: {
      description: 'Your one-stop shop for unique, handcrafted 3D and personalized gifts.',
      copyrightText: `© ${new Date().getFullYear()} 3D Hub. All Rights Reserved.`,
      socialMediaLinks: [
        { platform: 'facebook', url: '#' },
        { platform: 'instagram', url: '#' },
        { platform: 'twitter', url: '#' },
      ],
      quickLinks: [
        { title: 'About Us', url: '/#/about' },
        { title: 'Contact', url: '/#/contact' },
        { title: 'All Products', url: '/#/products' },
      ],
    },
    homePage: {
      heroSection: {
        enabled: true,
        slides: [
           { title: '3D Photo Frame Box - Customized Products', subtitle: 'Handcrafted with love, starting from just ₹1299.', ctaText: 'Shop Now', ctaLink: '/#/products', imageUrl: 'https://picsum.photos/seed/banner1/1600/800' },
           { title: 'Luxury Gift Hampers for Every Occasion', subtitle: 'Curated with the finest products to delight your loved ones.', ctaText: 'Explore Hampers', ctaLink: '/#/products', imageUrl: 'https://picsum.photos/seed/banner2/1600/800' },
           { title: 'Light Up Your World with Custom Neon', subtitle: 'Personalized signs that make a bold statement.', ctaText: 'Design Yours', ctaLink: '/#/products', imageUrl: 'https://picsum.photos/seed/banner3/1600/800' }
        ]
      },
      featuresSection: {
        enabled: true,
        title: 'Why Choose Us?',
        features: [
          { icon: 'sparkles', title: 'Unique Designs', description: 'Every item is a unique piece of art, crafted with passion.' },
          { icon: 'quality', title: 'Premium Quality', description: 'We use only the finest materials for a lasting impression.' },
          { icon: 'shipping', title: 'Fast Shipping', description: 'Your handcrafted gifts delivered to your doorstep quickly.' },
        ],
      },
      testimonialsSection: {
        enabled: true,
        title: 'What Our Customers Say',
        testimonials: [
          { author: 'Priya S.', role: 'Happy Customer', quote: 'The resin clock I bought is absolutely stunning! It\'s the centerpiece of my living room now. Amazing quality!', avatarUrl: 'https://picsum.photos/seed/test1/100/100' },
          { author: 'Rahul K.', role: 'Gift Recipient', quote: 'Received a luxury hamper for my birthday and it was packed with so many wonderful things. Highly recommended!', avatarUrl: 'https://picsum.photos/seed/test2/100/100' },
        ],
      },
    },
    seo: {
      metaTitle: '3D Hub - Unique Handcrafted Gifts',
      metaDescription: 'Discover a world of personalized and 3D gifts. From resin clocks to custom neon signs, find the perfect present for any occasion.',
    },
    aboutPage: {
      heroTitle: 'Crafting Memories, One Gift at a Time.',
      heroSubtitle: 'Learn about our journey, our passion for craftsmanship, and the people who make 3D Hub special.',
      heroImageUrl: 'https://picsum.photos/seed/aboutpage/1600/500',
      storyTitle: 'Our Story',
      storyContent: "Welcome to 3D Hub, your number one source for all things unique and handcrafted. We're dedicated to giving you the very best of personalized gifts, with a focus on quality, customer service, and uniqueness.\n\nFounded in 2023, 3D Hub has come a long way from its beginnings. When we first started out, our passion for creating beautiful, personalized art drove us to start our own business. We now serve customers all over the country and are thrilled to be a part of the quirky, eco-friendly, fair trade wing of the gift industry. We hope you enjoy our products as much as we enjoy offering them to you.",
      storyImageUrl: 'https://picsum.photos/seed/workshop2/600/400',
      missionVisionSection: {
        enabled: true,
        title: 'Our Mission & Vision',
        missionTitle: 'Our Mission',
        missionContent: 'To create high-quality, personalized gifts that bring joy and create lasting memories for our customers, while fostering a culture of creativity and craftsmanship.',
        visionTitle: 'Our Vision',
        visionContent: 'To be the leading online destination for unique and handcrafted gifts, known for our innovation, dedication to quality, and exceptional customer experience.',
      },
      teamSection: {
        enabled: true,
        title: 'Meet Our Team',
        members: [
          { name: 'Jane Doe', role: 'Founder & Lead Artist', bio: 'Jane started 3D Hub from her small workshop, driven by a passion for resin art and personalized crafts. She oversees all creative aspects.', imageUrl: 'https://picsum.photos/seed/team1/400/400' },
          { name: 'John Smith', role: 'Operations Manager', bio: 'John ensures everything runs smoothly, from sourcing materials to managing shipments. He is the backbone of our logistics.', imageUrl: 'https://picsum.photos/seed/team2/400/400' },
          { name: 'Priya Patel', role: 'Customer Happiness Lead', bio: 'Priya is dedicated to providing the best experience for our customers, handling inquiries with a smile and ensuring satisfaction.', imageUrl: 'https://picsum.photos/seed/team3/400/400' }
        ]
      }
    }
};

module.exports = { users, categories, products, orders, order_items, settings };
