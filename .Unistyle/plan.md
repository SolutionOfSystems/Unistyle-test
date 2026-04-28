
# UniStyle — Simple Ecommerce (College Project)

A clean, beginner-friendly unisex clothing & accessories store using Supabase for auth + database.

## Tech & Setup
- React + Tailwind + shadcn/ui (already in project)
- Supabase: Auth (email/password) + Postgres + RLS
- Clean minimal theme (white + black, subtle grays)
- Beginner-friendly code with comments throughout

## Database Tables
- **profiles** — id, name, email (auto-created on signup)
- **user_roles** — user_id, role ('admin' | 'user')  *(separate table for security)*
- **products** — id, name, price, description, category ('men' | 'women' | 'accessories'), image_url
- **cart_items** — id, user_id, product_id, quantity
- **orders** — id, user_id, status, total, created_at
- **order_items** — id, order_id, product_id, quantity, price *(stores each item per order)*

RLS: users see only their cart/orders; admins manage products & view all orders. `has_role()` security-definer function used in policies.

10 sample products seeded (men shirts/jeans, women dresses/tops, unisex accessories) with placeholder image URLs.

## Pages (User Side)
1. **Home** `/` — hero, category filter (All / Men / Women / Accessories), product grid
2. **Product Detail** `/product/:id` — image, description, price, Add to Cart
3. **Cart** `/cart` — list items, update qty, remove, total, Checkout button
4. **Checkout** `/checkout` — shipping name/address, COD only, Place Order
5. **Orders** `/orders` — past orders with items & status
6. **Login / Signup** `/auth` — single page with toggle

## Pages (Admin Side) — only visible to admin role
7. **Admin Products** `/admin/products` — table with Add / Edit / Delete (image via URL field)
8. **Admin Orders** `/admin/orders` — view all orders, update status (Pending → Shipped → Delivered)

## Navigation
Top nav: Logo, Home, Cart (with badge), Orders, Login/Logout, Admin link (if admin)

## Key UX Details
- Toast notifications for add-to-cart, order placed, etc.
- Empty states for cart/orders
- Protected routes (must be logged in to checkout / view orders / access admin)
- Mobile-responsive

## Deliverable: `DOCUMENTATION.md`
A long, beginner-friendly doc with all 11 sections you specified:
1. Project Overview (with shopping-mall analogy)
2. Features Explanation (real-life examples)
3. Folder & File Structure (every file explained simply)
4. Code Explanation (small snippets, plain English)
5. Line-by-Line Explanation of key functions: signup/login, addToCart, placeOrder
6. Database Explanation (tables + relationships, mall/receipt analogy)
7. System Flow (story format: open → login → browse → cart → order)
8. Basic Concepts (frontend, backend, database, auth — zero-knowledge friendly)
9. Beginner Learning Section (how it all connects)
10. Viva Q&A (15 questions with simple answers)
11. Conclusion

After writing, I'll do a self-review pass to simplify wording further.

## How to Become Admin (for your demo)
1. Sign up normally with the email you want as admin
2. I'll include simple SQL (and explain it in DOCUMENTATION.md) to insert your user_id into `user_roles` with role 'admin'
3. Refresh — admin links appear in nav

Ready to build when you click **Implement plan**.
