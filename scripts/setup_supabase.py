#!/usr/bin/env python3
"""
Script to set up Supabase resources using REST API.
This script uses the Supabase service role key to perform administrative operations.
"""

import os
import sys
import json
import uuid
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).parent.parent / '.env'
if not env_path.exists():
    print(f"Error: .env file not found at {env_path}")
    sys.exit(1)

load_dotenv(dotenv_path=env_path)

# Supabase connection details
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not all([SUPABASE_URL, SUPABASE_KEY]):
    print("Error: Missing required environment variables. Make sure you have set:")
    print("  - SUPABASE_URL")
    print("  - SUPABASE_SERVICE_ROLE_KEY")
    sys.exit(1)

def check_supabase_connection():
    """Verify connection to Supabase and check available endpoints."""
    headers = {
        "apiKey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        # Try to access a known endpoint
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/",
            headers=headers
        )
        
        if response.status_code == 200:
            print("Successfully connected to Supabase REST API")
            return True
        else:
            print(f"Error connecting to Supabase REST API: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"Exception connecting to Supabase: {e}")
        return False

def ensure_profiles_table_exists():
    """Ensure the profiles table exists by checking or creating it."""
    # We will use the Supabase REST API to check for table existence
    # And if it doesn't exist, we'll try to create it
    
    headers = {
        "apiKey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    # First, try to access the profiles table to see if it exists
    try:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/profiles?select=id&limit=1",
            headers=headers
        )
        
        # If we can access it, it exists
        if response.status_code == 200:
            count = response.headers.get('content-range', '').split('/')[1] if '/' in response.headers.get('content-range', '') else '0'
            print(f"Profiles table exists with approximately {count} records")
            return True
        
        # Check if error is specifically about the table not existing
        if '"message":"relation \\"public.profiles\\" does not exist"' in response.text or "42P01" in response.text:
            print("Profiles table does not exist, will attempt to create it")
            
            # Try to create the profiles table
            print("Creating profiles table...")
            
            # We can't use the SQL API directly yet, so let's check if we can access auth.users
            # to verify our permissions
            auth_check = requests.get(f"{SUPABASE_URL}/rest/v1/auth/users?limit=1", headers=headers)
            print(f"Auth check status: {auth_check.status_code}")
            if auth_check.status_code != 200:
                print(f"Error accessing auth API: {auth_check.text}")
                print("Cannot create profiles table automatically.")
                print("Please create the profiles table manually in the Supabase dashboard with:")
                print("""
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    name TEXT,
    description TEXT,
    image_url TEXT,
    active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    connectome JSONB DEFAULT '{}'::jsonb,
    personality JSONB DEFAULT '{}'::jsonb,
    memory_id UUID
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profiles" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profiles" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profiles" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profiles" 
ON public.profiles FOR DELETE 
USING (auth.uid() = id);
                """)
                return False
        else:
            print(f"Unexpected error checking profiles table: {response.text}")
            return False
    except Exception as e:
        print(f"Exception ensuring profiles table: {e}")
        return False

def create_storage_bucket():
    """Create a storage bucket if it doesn't exist."""
    headers = {
        "apiKey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    # Check if bucket exists
    response = requests.get(
        f"{SUPABASE_URL}/storage/v1/bucket/images",
        headers=headers
    )
    
    if response.status_code == 200:
        print("Images bucket already exists")
        return True
    
    # Create bucket if it doesn't exist
    bucket_data = {
        "id": "images",
        "name": "images",
        "public": False,
        "file_size_limit": 10485760  # 10MB limit
    }
    
    response = requests.post(
        f"{SUPABASE_URL}/storage/v1/bucket",
        headers=headers,
        json=bucket_data
    )
    
    if response.status_code == 200:
        print("Images bucket created successfully")
        return True
    else:
        print(f"Error creating images bucket: {response.text}")
        print("Please create the 'images' bucket manually in the Supabase dashboard")
        return False

def main():
    print("Setting up Supabase resources...")
    
    # First check if we can connect to Supabase
    if not check_supabase_connection():
        print("Failed to connect to Supabase API. Please check your credentials and try again.")
        sys.exit(1)
    
    # Ensure profiles table exists
    ensure_profiles_table_exists()
    
    # Create storage bucket
    create_storage_bucket()
    
    print("\nSetup completed.")
    print("\nIMPORTANT: You may need to manually create the profiles table and set storage policies")
    print("through the Supabase dashboard, as the REST API doesn't provide full SQL access.")
    print("Please see the SQL commands in the script for guidance.")

if __name__ == "__main__":
    main() 