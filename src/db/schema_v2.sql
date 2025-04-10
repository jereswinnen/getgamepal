/**
 * GamePal Database Schema
 * 
 * This schema defines the structure for the GamePal application's
 * Supabase database. It includes:
 * 
 * - A custom 'users' table that extends Supabase's auth.users
 * - Game collection management
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
CREATE TABLE IF NOT EXISTS users (
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

-- Create a trigger for new user signup if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END
$$;

/**
 * Row Level Security
 * 
 * These settings control who can access which rows in the users table.
 * We enable RLS and then define specific policies below.
 */
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public user profiles are viewable by everyone.'
  ) THEN
    CREATE POLICY "Public user profiles are viewable by everyone." 
      ON users 
      FOR SELECT 
      USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own profile.'
  ) THEN
    CREATE POLICY "Users can update their own profile." 
      ON users
      FOR UPDATE 
      USING (auth.uid() = id);
  END IF;
END
$$;

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

-- Create trigger for users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at'
  ) THEN
    CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION update_modified_column();
  END IF;
END
$$;

/**
 * Game Status Enum
 * 
 * Defines the possible statuses for games in the user's collection,
 * matching the enum values from the iOS app.
 */
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'game_status') THEN
    CREATE TYPE game_status AS ENUM (
      'Wishlisted', 'Not Started', 'Playing', 'Revisit', 'Abandoned', 
      'Finished', 'Finished 100%'
    );
  END IF;
END
$$;

/**
 * Ownership Type Enum
 * 
 * Defines the possible ownership types for games in the user's collection,
 * matching the enum values from the iOS app.
 */
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ownership_type') THEN
    CREATE TYPE ownership_type AS ENUM (
      'Physical', 'Physical with Case', 'Digital', 'Subscription', 'Not Owned'
    );
  END IF;
END
$$;

/**
 * Games Table
 * 
 * Stores the user's game collection, including game metadata,
 * user ratings, and play status.
 */
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  igdb_id INTEGER,
  title TEXT NOT NULL,
  platforms TEXT,
  status game_status,
  ownership_type ownership_type,
  total_play_time FLOAT DEFAULT 0, -- in seconds
  genres TEXT[], -- Array of genre strings
  is_hall_of_fame BOOLEAN DEFAULT FALSE,
  hall_of_fame_date TIMESTAMPTZ,
  is_featured BOOLEAN DEFAULT FALSE,
  featured_date TIMESTAMPTZ,
  igdb_cover_id TEXT, -- Just store the cover ID from IGDB
  rating FLOAT,
  user_review TEXT,
  user_review_added_date TIMESTAMPTZ,
  user_review_last_edited_date TIMESTAMPTZ,
  first_release_date TIMESTAMPTZ,
  note TEXT,
  date_added TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Create a unique constraint to prevent duplicate games for a user
  UNIQUE(user_id, igdb_id)
);

-- Create indexes for performance if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_games_user_id') THEN
    CREATE INDEX idx_games_user_id ON games(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_games_igdb_id') THEN
    CREATE INDEX idx_games_igdb_id ON games(igdb_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_games_hall_of_fame') THEN
    CREATE INDEX idx_games_hall_of_fame ON games(is_hall_of_fame) WHERE is_hall_of_fame = TRUE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_games_title') THEN
    CREATE INDEX idx_games_title ON games(title);
  END IF;
END
$$;

-- Enable Row Level Security on games table
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Create policy for games table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can only access their own games'
  ) THEN
    CREATE POLICY "Users can only access their own games" 
      ON games FOR ALL 
      USING (auth.uid() = user_id);
  END IF;
END
$$;

/**
 * Games Timestamp Update Function
 * 
 * Automatically updates the 'updated_at' timestamp for games
 * whenever a record is modified.
 */
CREATE OR REPLACE FUNCTION update_games_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for games table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_games_updated_at_trigger'
  ) THEN
    CREATE TRIGGER update_games_updated_at_trigger
      BEFORE UPDATE ON games
      FOR EACH ROW EXECUTE FUNCTION update_games_updated_at();
  END IF;
END
$$; 