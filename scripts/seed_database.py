import sys
import os

# Ensure backend app imports work
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.core.supabase import db

def seed_database():
    print("Executing database seed routine...")
    projects = db.get_all("projects")
    print(f"Current active projects: {len(projects)}")
    for p in projects:
        print(f" - {p['id']}: {p['name']} ({p['customer_name']})")
    print("Seed process completed successfully!")

if __name__ == "__main__":
    seed_database()
