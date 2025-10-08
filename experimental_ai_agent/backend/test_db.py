from dotenv import load_dotenv
load_dotenv()  # Add this line at the top

from app.core.database import get_db

def test_connection():
    try:
        db = get_db()
        
        # Test query
        result = db.table('companies').select("*").limit(1).execute()
        
        print("✅ Database connection successful!")
        print(f"Companies table exists and has {len(result.data)} rows")
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")

if __name__ == "__main__":
    test_connection()