"""
Database connection and operations for Supabase.
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import Optional

# Load environment variables
load_dotenv()

class Database:
    _instance: Optional[Client] = None
    
    @classmethod
    def get_client(cls) -> Client:
        """Get or create Supabase client."""
        if cls._instance is None:
            url = os.getenv("SUPABASE_URL")
            key = os.getenv("SUPABASE_KEY")
            
            if not url or not key:
                raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in environment")
            
            cls._instance = create_client(url, key)
        
        return cls._instance

# Convenience function
def get_db() -> Client:
    return Database.get_client()