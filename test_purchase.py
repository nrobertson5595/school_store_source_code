import requests
import json

# Test credentials
BASE_URL = "http://localhost:5173/api"

# Login as a student first
login_data = {
    "username": "student1",
    "password": "password123"
}

session = requests.Session()

# Login
print("Logging in...")
response = session.post(f"{BASE_URL}/auth/login", json=login_data)
if response.ok:
    print(f"✓ Logged in successfully as {response.json()['user']['username']}")
    print(f"  User ID: {response.json()['user']['id']}")
    print(f"  Points balance: {response.json()['user']['points_balance']}")
else:
    print(f"✗ Login failed: {response.status_code} - {response.text}")
    exit(1)

# Get available items
print("\nFetching store items...")
response = session.get(f"{BASE_URL}/store/items")
if response.ok:
    items = response.json()
    print(f"✓ Found {len(items)} items")
    if items:
        test_item = items[0]
        print(
            f"  Testing with item: {test_item['name']} (ID: {test_item['id']})")
        print(f"  Available sizes: {test_item['available_sizes']}")
        print(f"  Prices: {test_item['size_pricing']}")
else:
    print(f"✗ Failed to fetch items: {response.status_code} - {response.text}")
    exit(1)

# Test purchase
if items and test_item['available_sizes']:
    size = test_item['available_sizes'][0]
    purchase_data = {
        "item_id": test_item['id'],
        "size": size,
        "quantity": 1
    }

    print(f"\nTesting purchase...")
    print(f"  Sending: {json.dumps(purchase_data, indent=2)}")

    response = session.post(f"{BASE_URL}/store/purchase", json=purchase_data)

    if response.ok:
        print(f"✓ Purchase successful!")
        result = response.json()
        print(f"  Response: {json.dumps(result, indent=2)}")
    else:
        print(f"✗ Purchase failed: {response.status_code}")
        try:
            error_data = response.json()
            print(f"  Error: {json.dumps(error_data, indent=2)}")
        except:
            print(f"  Response: {response.text}")

print("\nTest complete!")
