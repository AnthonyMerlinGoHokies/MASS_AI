import os
from dotenv import load_dotenv

load_dotenv()

api_keys = {
    "ENRICH_LAYER": os.getenv("ENRICH_LAYER"),
    "HUNTER_IO_API_KEY": os.getenv("HUNTER_IO_API_KEY"),
    "MISTRAL_API_KEY": os.getenv("MISTRAL_API_KEY"),
    "APOLLO_API_KEY": os.getenv("APOLLO_API_KEY"),
    "CORESIGNAL_API_KEY": os.getenv("CORESIGNAL_API_KEY"),
    "SERPER_API_KEY": os.getenv("SERPER_API_KEY")
}

print("Environment Variables Check:")
print("-" * 50)
for key, value in api_keys.items():
    status = "✓ Found" if value else "✗ Missing"
    masked = value[:8] + "..." if value else "None"
    print(f"{status} {key}: {masked}")