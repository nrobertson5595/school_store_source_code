import requests
import json

# Test the store API endpoint
print("Testing Store API...")
print("-" * 50)

# First, let's login as a student
login_url = "http://localhost:5000/api/auth/login"  # Correct endpoint
login_data = {
    "username": "alex_s",  # Valid student from seed data
    "password": "student123"  # Password from seed data
}

session = requests.Session()

# Try to login
print("1. Attempting to login as student...")
try:
    response = session.post(login_url, json=login_data)
    print(f"   Login response status: {response.status_code}")
    if response.ok:
        print(f"   Login response: {response.json()}")
    else:
        print(f"   Login failed: {response.text}")
except Exception as e:
    print(f"   Login error: {e}")

# Now try to get store items
print("\n2. Fetching store items...")
items_url = "http://localhost:5000/api/store/items"
try:
    response = session.get(items_url)
    print(f"   Store items response status: {response.status_code}")

    if response.ok:
        data = response.json()
        print(f"   Response type: {type(data)}")
        print(f"   Is list?: {isinstance(data, list)}")
        print(f"   Is dict?: {isinstance(data, dict)}")

        if isinstance(data, dict):
            print(f"   Dict keys: {data.keys()}")
            print(f"   Has 'success' key?: {'success' in data}")
            print(f"   Has 'items' key?: {'items' in data}")
        elif isinstance(data, list):
            print(f"   Number of items: {len(data)}")
            if data:
                print(f"   First item: {json.dumps(data[0], indent=2)}")

        print(f"\n   Full response (first 500 chars):")
        print(f"   {str(data)[:500]}")
    else:
        print(f"   Failed to fetch items: {response.text}")
except Exception as e:
    print(f"   Error fetching items: {e}")

print("\n" + "=" * 50)
print("DIAGNOSIS:")
print(
    "The backend returns a list directly, but the frontend expects {success: true, items: [...]}")
print("This mismatch causes the frontend to not display any items.")
