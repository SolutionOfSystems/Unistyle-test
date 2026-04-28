# UniStyle — Unisex E-Commerce Hub

A complete, beginner-friendly **ecommerce website** for unisex clothing and accessories. Built with React, Tailwind CSS, and Supabase.

## 🚀 Quick Start

```bash
npm install        # Install dependencies
npm run dev        # Start dev server at http://localhost:8080
npm run build      # Build for production
npm run test       # Run tests
```

## 📚 Documentation

For a complete guide to the project structure, features, code explanations, database schema, and troubleshooting tips, see [DOCUMENTATION.md](DOCUMENTATION.md).

### Quick Links

- **Project Overview** → See Section 1 in DOCUMENTATION.md
- **Features Explained** → See Section 2 in DOCUMENTATION.md  
- **Folder Structure** → See Section 3 in DOCUMENTATION.md
- **Database Tables** → See Section 6 in DOCUMENTATION.md
- **Common Errors & Fixes** → See Section 16 in DOCUMENTATION.md
- **Viva Questions** → See Section 10 in DOCUMENTATION.md

## 🛍️ Features

✅ User signup & login  
✅ Browse products with filtering  
✅ Shopping cart  
✅ Checkout with Cash on Delivery  
✅ Order history  
✅ Admin panel (add/edit/delete products, manage orders)  

## 🏗️ Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Supabase
- **Database:** PostgreSQL
- **Build Tool:** Vite
- **Testing:** Vitest

## 🔐 Authentication

Users sign up with email/password. The system automatically:
- Creates a user profile
- Assigns the "user" role
- Enables Row-Level Security so users only see their own data

To make yourself admin:
```sql
UPDATE user_roles SET role = 'admin'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL');
```

## 📝 Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview production build |
| `npm run lint` | Check code quality with ESLint |
| `npm run test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |

## 📖 Learn More

- Read [DOCUMENTATION.md](DOCUMENTATION.md) for a complete guide
- Learn about React: https://react.dev
- Learn about Tailwind CSS: https://tailwindcss.com
- Learn about Supabase: https://supabase.com/docs

Happy shopping! 🛍️
