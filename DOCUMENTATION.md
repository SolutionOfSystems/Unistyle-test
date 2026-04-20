# UniStyle — Project Documentation

A complete, beginner-friendly guide to the UniStyle ecommerce website.

---

## 0. Branding & Visual Identity

UniStyle has its own custom brand identity built from a logo provided by the team.

### Logo assets
| File | Where it's used |
|---|---|
| `src/assets/unistyle-logo.png` | Full wordmark logo — shown big in the home page **hero section** |
| `src/assets/unistyle-mark.png` | Small icon-only mark — shown in the **navbar** (top-left) next to the "UniStyle" text |
| `public/favicon.png` | Browser tab icon (favicon) |

### Color palette (pulled from the logo)
We use a **deep teal + gold on warm white** palette. All colors are defined as HSL CSS variables in `src/index.css` so they can be reused everywhere through Tailwind classes (`bg-primary`, `text-accent`, etc.).

| Token | HSL value | Meaning |
|---|---|---|
| `--background` | `40 30% 98%` | Warm off-white page background |
| `--foreground` | `200 60% 12%` | Main text color (near-black teal) |
| `--primary` | `198 75% 18%` | **Deep teal** — buttons, brand text, navbar word |
| `--accent` | `42 70% 55%` | **Gold** — highlights, premium feel |
| `--secondary` | `195 30% 94%` | Soft teal-tinted background for hero/sections |
| `--muted-foreground` | `200 20% 38%` | Subtle helper text |
| `--brand-gradient` | teal → gold linear gradient | Reusable premium gradient |
| `--shadow-brand` | soft teal drop shadow | Reusable elevated shadow |

### Why a design system?
Instead of writing `text-white` or `bg-[#003344]` directly in components, we use **semantic tokens** (`bg-primary`, `text-foreground`). This means:
- Changing one variable in `index.css` instantly re-themes the whole app.
- Light/dark mode work automatically.
- The site stays visually consistent everywhere.

---

## 1. Project Overview

**UniStyle** is a small online store for **unisex clothing and accessories** (men's wear, women's wear, watches, sunglasses, bags, etc.). It is a **college project** designed to teach the basics of building a real-world web application.

### Why was it built?
- To learn how a real ecommerce site (like Amazon, Myntra, Flipkart) works.
- To practice using a database, login system, and shopping cart together.
- To have a complete, working project that can be submitted and explained in viva.

### Real-life example
Imagine a clothing shop in a mall:
- **Shelves with clothes** = the **product list** on the home page.
- **Customer picking items into a basket** = the **add-to-cart** feature.
- **Counter where you pay and give your address** = the **checkout** page.
- **Shop manager adding/removing items from shelves** = the **admin panel**.

---

## 2. Features Explanation

### 🔐 Login & Signup
Just like getting a membership card at a mall — you sign up once, then log in to remember your cart and orders.

### 👕 Product Listing (Home Page)
Like walking around a clothing store and seeing all items on display. You can filter by section: Men, Women, or Accessories.

### 🔍 Product Detail Page
Like picking up a shirt to read its tag — you see a bigger photo, the price, and a short description.

### 🛒 Add to Cart
Like putting items into a shopping basket while you browse. You can change quantity or remove items before paying.

### 💵 Checkout (Cash on Delivery)
Like walking to the counter, telling the cashier your name and address, and confirming the order. You pay in cash when the order arrives.

### 📦 Order History
Like keeping all your shopping receipts in one folder so you can look back at what you bought.

### 🛠️ Admin Panel
Only the **shop manager (admin)** can:
- Add new products to the shelves
- Edit product details (name, price, image)
- Delete products
- View all customer orders and update their status (Pending → Shipped → Delivered)

---

## 3. Folder & File Structure

```
unistyle/
├── DOCUMENTATION.md              ← This file
├── index.html                    ← The single HTML page that loads the React app
├── src/
│   ├── main.tsx                  ← Entry point — starts the React app
│   ├── App.tsx                   ← Defines all the URLs (routes) of the website
│   ├── index.css                 ← Global colors, fonts, theme
│   │
│   ├── components/
│   │   ├── Navbar.tsx            ← Top navigation bar (logo, cart, login button)
│   │   ├── ProductCard.tsx       ← One product tile shown on the home page grid
│   │   └── ProtectedRoute.tsx    ← Blocks pages from non-logged-in users
│   │
│   ├── pages/
│   │   ├── Index.tsx             ← Home page (hero + product grid + filter)
│   │   ├── Auth.tsx              ← Login + Signup form
│   │   ├── ProductDetail.tsx     ← Single product page with Add to Cart
│   │   ├── Cart.tsx              ← Shopping cart page
│   │   ├── Checkout.tsx          ← Place an order (Cash on Delivery)
│   │   ├── Orders.tsx            ← User's past orders
│   │   ├── AdminProducts.tsx     ← Admin: add/edit/delete products
│   │   ├── AdminOrders.tsx       ← Admin: view orders + update status
│   │   └── NotFound.tsx          ← 404 page
│   │
│   ├── hooks/
│   │   └── useAuth.tsx           ← Knows who is logged in + if they are admin
│   │
│   └── integrations/supabase/
│       ├── client.ts             ← Connection to the database
│       └── types.ts              ← Auto-generated database types
│
└── supabase/migrations/          ← SQL files that built the database tables
```

### What does each file do (in plain English)?
| File | What it does |
|---|---|
| `App.tsx` | The “map” of the website — says which page opens at `/cart`, `/auth`, etc. |
| `Navbar.tsx` | The black/white bar at the top with the cart icon and login button. |
| `useAuth.tsx` | A “memory” that remembers if you are logged in. |
| `client.ts` | The “telephone line” to the database. Whenever we need data, we use this. |
| `Index.tsx` | The home page — what you see when you open the website. |
| `Cart.tsx` | Shows what's in your shopping basket and lets you change it. |

---

## 4. Code Explanation (Important Parts)

### a) Connecting to the database (`client.ts`)
```ts
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
```
👉 We create one **`supabase`** object. Anywhere in the app where we need data (products, cart, orders), we use this object. Think of it as a phone — we just dial the database.

### b) Loading products from the database (`Index.tsx`)
```ts
const { data } = await supabase.from("products").select("*");
setProducts(data ?? []);
```
👉 “From the **products** table, give me **all rows**.” The result is stored in a state variable called `products`, which is then displayed on screen.

### c) Add to Cart (`ProductDetail.tsx`)
```ts
await supabase.from("cart_items").insert({
  user_id: user.id,
  product_id: product.id,
  quantity: 1,
});
```
👉 Save a new row in the **cart_items** table that says “User X added Product Y, quantity 1.”

### d) Place Order (`Checkout.tsx`)
We do **3 small steps**:
1. Insert a new row in the **orders** table (with shipping info + total).
2. Insert each cart item into **order_items** (so we remember what was bought even if products change later).
3. Delete everything from the user's **cart_items** (the cart is now empty).

---

## 5. Line-by-Line Explanation of Key Functions

### 🔐 Signup (in `Auth.tsx`)
```ts
const { error } = await supabase.auth.signUp({
  email,                                    // Step 1: send the email
  password,                                 // Step 2: send the password
  options: {
    emailRedirectTo: `${window.location.origin}/`,  // Step 3: where to redirect after confirming email
    data: { name },                         // Step 4: extra info we want to save (the user's name)
  },
});
if (error) throw error;                     // Step 5: show error if anything went wrong
toast({ title: "Account created!" });       // Step 6: success message
navigate("/");                              // Step 7: send them to home page
```
**What happens behind the scenes:** A database trigger we set up automatically creates a row in the `profiles` table and gives them the default role of **'user'**.

### 🛒 Add to Cart (in `ProductDetail.tsx`)
```ts
// 1. If not logged in, send them to login page first
if (!user) { navigate("/auth"); return; }

// 2. Check if this product is already in the cart
const { data: existing } = await supabase
  .from("cart_items")
  .select("id, quantity")
  .eq("user_id", user.id)
  .eq("product_id", product.id)
  .maybeSingle();

// 3a. If yes — just increase the quantity by 1
if (existing) {
  await supabase.from("cart_items")
    .update({ quantity: existing.quantity + 1 })
    .eq("id", existing.id);
}
// 3b. If no — add a brand new row
else {
  await supabase.from("cart_items")
    .insert({ user_id: user.id, product_id: product.id, quantity: 1 });
}

// 4. Show a happy notification
toast({ title: "Added to cart!" });
```

### 📦 Place Order (in `Checkout.tsx`)
```ts
// Step 1: Save the main order
const { data: order } = await supabase.from("orders").insert({
  user_id: user.id,
  total,                       // total price in dollars
  shipping_name: name,         // customer name
  shipping_address: address,   // customer address
  status: "Pending",           // every new order starts as Pending
}).select().single();

// Step 2: Save each item that was in the cart, attached to this order
const orderItems = items.map(i => ({
  order_id: order.id,
  product_id: i.product_id,
  quantity: i.quantity,
  price: i.products.price,
  product_name: i.products.name,
}));
await supabase.from("order_items").insert(orderItems);

// Step 3: Empty the cart (because the order is placed)
await supabase.from("cart_items").delete().eq("user_id", user.id);
```

---

## 6. Database Explanation

### Tables

| Table | What it stores | Real-life analogy |
|---|---|---|
| **profiles** | id, name, email | Membership card with your name |
| **user_roles** | user_id, role ('admin' or 'user') | A separate badge that says "Manager" or "Customer" |
| **products** | id, name, price, description, category, image_url | The price tag on each item |
| **cart_items** | user_id, product_id, quantity | A shopping basket linked to one customer |
| **orders** | id, user_id, total, status, shipping info | The receipt of one full purchase |
| **order_items** | order_id, product_id, quantity, price | The lines printed on the receipt |

### Relationships
```
auth.users  ──┬── profiles       (each user has one profile)
              ├── user_roles     (each user has one or more roles)
              ├── cart_items     (a user has many cart items)
              └── orders         (a user has many orders)
                       └── order_items   (each order has many items)

products  ──── cart_items / order_items  (a product can be in many carts/orders)
```

**Real-life analogy:** Think of a customer (user) who has a membership card (profile), a shopping basket (cart_items), and a folder of past receipts (orders), where each receipt lists multiple bought items (order_items).

### Why is `user_roles` a separate table?
For **security**. If we stored the role inside the profile, a user could potentially trick the system into making themselves an admin. Keeping roles in a separate table, locked down by **Row-Level Security**, prevents that.

---

## 7. System Flow (Story)

> 🧑 **Riya opens UniStyle on her laptop.**
> 1. She lands on the **home page** and sees clothes & accessories.
> 2. She clicks **Login**, signs up with her email + password.
> 3. The database automatically creates her **profile** and gives her the role **'user'**.
> 4. She browses, clicks a **black hoodie**, and hits **Add to Cart**.
> 5. The hoodie is now stored in **cart_items** for her.
> 6. She opens the **Cart** page, increases the quantity, and clicks **Checkout**.
> 7. She fills in her **name and address**, chooses **Cash on Delivery**, and clicks **Place Order**.
> 8. A new row appears in the **orders** table, the items are copied into **order_items**, and her cart is cleared.
> 9. She visits the **Orders** page and sees her receipt with status **Pending**.
> 10. The **admin** logs in, opens **Admin → Orders**, and changes status to **Shipped** → **Delivered**.

---

## 8. Basic Concepts

### What is the frontend?
Everything you **see and click** in the browser — buttons, images, forms. We built the frontend with **React** (a JavaScript library) and **Tailwind CSS** (for styling).

### What is the backend?
Code that runs on a **server**, not in your browser. It handles things like saving data and authenticating users. We use **Lovable Cloud** (which is powered by Supabase) as our backend.

### What is a database?
A giant **organized table** of information. Imagine an Excel sheet with multiple tabs — each tab is a "table" (products, orders, users). We use **PostgreSQL** through Lovable Cloud.

### What is authentication?
The process of **proving who you are** — like showing your ID card. When you log in with email + password, the system gives your browser a special token to remember you.

### What is RLS (Row-Level Security)?
A rule on the database that says "this row can only be seen by user X". Example: your cart can only be viewed by you, not by another customer.

---

## 9. Beginner Learning Section — How It All Connects

```
[ Browser (you) ]
       │
       │  React (the visual UI)
       ▼
[ React Components ]  ← Pages like Home, Cart, Orders
       │
       │  supabase.from("products").select(...)
       ▼
[ Lovable Cloud / Supabase ]  ← Acts as the backend + database
       │
       ▼
[ PostgreSQL Tables ]  ← Real data lives here
```

- You **click** something in the browser.
- A **React component** runs some code.
- That code **talks to Supabase** through the `supabase` client.
- Supabase **reads or writes data** in the database.
- The result comes back to React, which **updates the screen**.

Everything is a loop: **click → code → database → screen**.

---

## 10. Common Viva Questions & Answers

**Q1. What is this project about?**
> UniStyle is an ecommerce website that sells unisex clothing and accessories. Users can sign up, browse products, add them to cart, and place an order with Cash on Delivery.

**Q2. What technologies did you use?**
> React for the frontend, Tailwind CSS for styling, and Lovable Cloud (Supabase) for authentication and the PostgreSQL database.

**Q3. What is a cart?**
> A temporary list of items a user wants to buy before placing the order. We store it in the `cart_items` table.

**Q4. What is a database?**
> A structured place to store information. We use PostgreSQL with tables like products, orders, cart_items.

**Q5. How does login work?**
> The user enters email + password. We send them to Supabase Auth. Supabase verifies them, creates a session, and our React app stores the session token in the browser.

**Q6. What is Row-Level Security (RLS)?**
> Database rules that decide which rows a user can see or change. For example, each user can only see their own cart and orders.

**Q7. How is admin different from a normal user?**
> Admins have a row in the `user_roles` table with role = 'admin'. Only admins can add/edit/delete products and update order status. We check using the `has_role()` SQL function.

**Q8. Why is `user_roles` a separate table?**
> For security — to prevent users from changing their own role to admin (privilege escalation).

**Q9. What happens when I click "Place Order"?**
> 1. A row is added to `orders`. 2. Each cart item is copied into `order_items`. 3. The cart is emptied.

**Q10. Why do we copy product info into `order_items`?**
> So that even if a product is later deleted or its price changes, the old order receipt stays accurate.

**Q11. What is a React component?**
> A reusable piece of UI written as a JavaScript function. Example: `ProductCard` is a component that displays one product.

**Q12. What is `useState`?**
> A React feature that lets a component remember information (like the list of products) between renders.

**Q13. What is `useEffect`?**
> A React feature that runs code at certain times — for example, fetch products **when** the page first loads.

**Q14. What does Cash on Delivery mean?**
> The customer doesn't pay online. They pay in cash when the order is delivered to their door.

**Q15. How can I become admin in this project?**
> Sign up normally with the email you want. Then, in the Lovable Cloud database editor, run:
> ```sql
> UPDATE user_roles SET role = 'admin' WHERE user_id = '<your-user-id>';
> ```
> Refresh the page — the **Admin** link will appear in the navbar.

---

## 11. Conclusion

UniStyle is a **simple but complete** ecommerce website that demonstrates all the key parts of a real-world web app:
- A **frontend** built with React and Tailwind CSS
- A **backend + database** powered by Lovable Cloud (Supabase)
- **Authentication** with email and password
- **Role-based access** for admins
- **Row-Level Security** so users can only see their own data
- A full **shopping flow**: browse → cart → checkout → orders

### Benefits of this project
- Easy to understand and explain
- Uses real industry tools (React, PostgreSQL)
- Clear separation between user side and admin side
- Beginner-friendly code with comments

### How to make yourself admin (for the demo)
1. Sign up with your email through the site.
2. Open Lovable Cloud → SQL editor.
3. Run:
   ```sql
   UPDATE user_roles SET role = 'admin'
   WHERE user_id = (SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL_HERE');
   ```
4. Refresh — you'll see the **Admin** link.

Happy shopping! 🛍️
