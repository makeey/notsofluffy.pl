# NotSoFluffy Frontend

A modern e-commerce frontend built with [Next.js 15](https://nextjs.org) and [React 19](https://react.dev), featuring a complete shopping experience with Polish localization and admin panel.

## 🚀 Technology Stack

- **Framework**: Next.js 15.3.5 with App Router
- **React**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4 with PostCSS
- **UI Components**: Radix UI primitives with shadcn/ui
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Context API
- **Animations**: Lucide React icons
- **Development**: Turbopack for faster builds

## 🏗️ Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel (English)
│   ├── zaloguj/           # Login page (Polish)
│   ├── rejestracja/       # Registration page (Polish)
│   ├── products/          # Product catalog (Polish)
│   ├── koszyk/            # Shopping cart (Polish)
│   ├── checkout/          # Checkout flow (Polish)
│   └── coming-soon/       # Maintenance mode page
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   └── admin/            # Admin-specific components
├── contexts/             # React Context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and API client
└── public/               # Static assets
```

## 🌐 Features

### Customer Features (Polish Interface)
- **Product Catalog**: Browse products with advanced filtering
- **Shopping Cart**: Session-based cart with persistent storage
- **User Authentication**: JWT-based login/registration
- **Order Management**: Complete order history and tracking
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Polish Localization**: All customer-facing pages in Polish

### Admin Features (English Interface)
- **Product Management**: Full CRUD operations
- **Order Processing**: Order status management and tracking
- **User Management**: Admin and customer account management
- **Content Management**: Categories, materials, colors, sizes
- **Image Upload**: Drag-and-drop image management
- **Discount Codes**: Flexible discount system
- **Site Settings**: Maintenance mode and global settings
- **Client Reviews**: Customer testimonial management

### Technical Features
- **Maintenance Mode**: Admin-controlled site maintenance
- **Real-time Updates**: Live cart count and status updates
- **Form Validation**: Zod schemas with React Hook Form
- **Error Handling**: Comprehensive error boundaries
- **Performance**: Optimized with Next.js Image component
- **Security**: CSRF protection and input sanitization

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm
- Running backend API (see `../backend/README.md`)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API URL
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080  # Development
# NEXT_PUBLIC_API_URL=https://api.notsofluffy.pl  # Production
```

### Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## 🌍 Localization

### Polish Customer Interface
- **Homepage**: Product showcase and categories
- **Products**: `/products` - Product catalog with filters
- **Cart**: `/koszyk` - Shopping cart management
- **Auth**: `/zaloguj`, `/rejestracja` - Login and registration
- **Orders**: `/orders` - Order history and details
- **Profile**: `/profil` - User profile management

### English Admin Interface
- **Dashboard**: `/admin` - Admin overview
- **Products**: `/admin/products` - Product management
- **Orders**: `/admin/orders` - Order processing
- **Users**: `/admin/users` - User management
- **Settings**: `/admin/settings` - Site configuration

## 🎨 Styling & UI

### Tailwind CSS v4
- **Modern Setup**: Latest Tailwind CSS features
- **Custom Design System**: Consistent spacing and colors
- **Dark Mode**: Ready for dark theme implementation
- **Responsive**: Mobile-first responsive design

### Component Library
- **Radix UI**: Accessible primitive components
- **shadcn/ui**: Pre-built component library
- **Custom Components**: Application-specific UI elements
- **Form Components**: Validated form inputs with error states

## 🔒 Authentication & Security

### JWT Authentication
- **Token Storage**: Secure localStorage management
- **Auto Refresh**: Automatic token renewal
- **Role-Based Access**: Admin vs customer permissions
- **Route Protection**: Protected routes with middleware

### Security Features
- **CSRF Protection**: Request validation
- **Input Sanitization**: XSS prevention
- **Rate Limiting**: API request throttling
- **Secure Headers**: Security-first configuration

## 📱 Performance Optimization

### Next.js Optimizations
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **Static Generation**: ISR for product pages
- **Bundle Analysis**: Webpack bundle analyzer

### Development Tools
- **Turbopack**: Fast development builds
- **TypeScript**: Full type safety
- **ESLint**: Code quality enforcement
- **Hot Reload**: Instant development feedback

## 🚀 Deployment

### Production Build
```bash
# Build the application
npm run build

# Test production build locally
npm start
```

### Vercel Deployment
The application is optimized for Vercel deployment:

1. **Connect Repository**: Link your Git repository
2. **Environment Variables**: Set `NEXT_PUBLIC_API_URL`
3. **Build Settings**: Automatic Next.js detection
4. **Domain Setup**: Configure custom domain

### Environment Configuration
```bash
# Production Environment Variables
NEXT_PUBLIC_API_URL=https://api.notsofluffy.pl
```

## 🔧 API Integration

### Backend Integration
- **API Client**: Type-safe API client in `lib/api.ts`
- **Error Handling**: Comprehensive error management
- **Loading States**: UI feedback for async operations
- **Caching**: Smart request caching and invalidation

### Endpoints
- **Public API**: Product catalog, categories, search
- **Auth API**: Login, registration, profile management
- **Cart API**: Session-based cart operations
- **Admin API**: Management operations (protected)

## 🧪 Testing & Quality

### Code Quality
- **TypeScript**: Strict type checking
- **ESLint**: Code style enforcement
- **Prettier**: Code formatting (configured)
- **Husky**: Git hooks for quality checks

### Performance Monitoring
- **Core Web Vitals**: Lighthouse optimization
- **Bundle Size**: Regular bundle analysis
- **Error Tracking**: Production error monitoring

## 📚 Additional Resources

### Documentation
- **API Documentation**: See `../backend/README.md`
- **Deployment Guide**: See `../DEPLOYMENT.md`
- **Database Schema**: See `../CLAUDE.md`

### Learning Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [React 19 Features](https://react.dev/blog/2024/04/25/react-19)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

1. **Code Style**: Follow ESLint configuration
2. **Commits**: Use conventional commit messages
3. **Testing**: Test all new features thoroughly
4. **Documentation**: Update README for new features

## 📄 License

This project is part of the NotSoFluffy e-commerce platform.
