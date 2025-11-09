/*
  # StyleSync E-commerce Database Schema

  ## Overview
  Complete database schema for StyleSync AI-powered fashion platform including user profiles, products, orders, saved outfits, and gamification features.

  ## Tables Created
  
  ### 1. profiles
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `avatar_url` (text) - Profile picture URL
  - `style_score` (integer) - Gamification score
  - `body_type` (text) - AI-detected body type
  - `color_tone` (text) - AI-detected color preferences
  - `created_at` (timestamptz) - Account creation timestamp
  
  ### 2. products
  - `id` (uuid, primary key)
  - `name` (text) - Product name
  - `description` (text) - Product description
  - `price` (decimal) - Product price
  - `category` (text) - Category (tops, bottoms, shoes, accessories, etc.)
  - `image_url` (text) - Product image
  - `stock` (integer) - Available stock
  - `tags` (text array) - Style tags for AI matching
  - `created_at` (timestamptz)
  
  ### 3. orders
  - `id` (uuid, primary key)
  - `user_id` (uuid) - References profiles
  - `items` (jsonb) - Order items with quantities
  - `total_amount` (decimal) - Total order value
  - `status` (text) - Order status (pending, completed, shipped)
  - `shipping_address` (jsonb) - Shipping details
  - `stripe_payment_id` (text) - Stripe payment reference
  - `created_at` (timestamptz)
  
  ### 4. saved_outfits
  - `id` (uuid, primary key)
  - `user_id` (uuid) - References profiles
  - `outfit_name` (text) - User-given outfit name
  - `product_ids` (uuid array) - Array of product IDs in outfit
  - `ai_score` (integer) - AI-generated style score
  - `event_type` (text) - Occasion (party, casual, office, etc.)
  - `created_at` (timestamptz)
  
  ### 5. style_recommendations
  - `id` (uuid, primary key)
  - `user_id` (uuid) - References profiles
  - `uploaded_image_url` (text) - User's uploaded selfie
  - `recommended_products` (uuid array) - AI-recommended product IDs
  - `ai_analysis` (jsonb) - AI analysis data (body type, colors, etc.)
  - `created_at` (timestamptz)
  
  ### 6. leaderboard
  - `user_id` (uuid, primary key) - References profiles
  - `style_score` (integer) - Current style score
  - `rank` (integer) - Calculated rank
  - `updated_at` (timestamptz) - Last score update
  
  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Users can only access their own data
  - Public read access for products
  - Admin role checking for product management
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  style_score integer DEFAULT 0,
  body_type text,
  color_tone text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  category text NOT NULL,
  image_url text NOT NULL,
  stock integer DEFAULT 0,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  items jsonb NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending',
  shipping_address jsonb,
  stripe_payment_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE TABLE IF NOT EXISTS saved_outfits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  outfit_name text NOT NULL,
  product_ids uuid[] NOT NULL,
  ai_score integer DEFAULT 0,
  event_type text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE saved_outfits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved outfits"
  ON saved_outfits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved outfits"
  ON saved_outfits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved outfits"
  ON saved_outfits FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS style_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  uploaded_image_url text,
  recommended_products uuid[] DEFAULT '{}',
  ai_analysis jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE style_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations"
  ON style_recommendations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations"
  ON style_recommendations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS leaderboard (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  style_score integer DEFAULT 0,
  rank integer,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own leaderboard entry"
  ON leaderboard FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify own leaderboard entry"
  ON leaderboard FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
