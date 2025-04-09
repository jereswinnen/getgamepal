/**
 * GamePal Database Schema
 * 
 * This schema defines the structure for the GamePal application's
 * Supabase database. It includes:
 * 
 * - A custom 'users' table that extends Supabase's auth.users
 * - Automatic user profile creation via triggers
 * - Row-level security policies
 * - Automatic timestamp management
 */

-- Enable the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

/**
 * Users Table
 * 
 * This table stores application-specific user data that extends
 * beyond what's available in the default auth.users table.
 * The id column references the auth.users id for seamless integration.
 */
CREATE TABLE users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

/**
 * New User Handler
 * 
 * This function automatically creates a record in our users table
 * whenever a new user signs up through Supabase Auth.
 */
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

/**
 * Row Level Security
 * 
 * These settings control who can access which rows in the users table.
 * We enable RLS and then define specific policies below.
 */
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies (allow users to read any profile but only update their own)
CREATE POLICY "Public user profiles are viewable by everyone." 
  ON users 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile." 
  ON users
  FOR UPDATE 
  USING (auth.uid() = id);

/**
 * Automatic Timestamp Updates
 * 
 * This trigger automatically updates the 'updated_at' timestamp
 * whenever a user record is modified.
 */
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_modified_column(); 