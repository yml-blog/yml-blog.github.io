from blog_generator import process_all_blogs
from metadata_generator import process_all_blogs_metadata

def update_all_blogs():
    print("Starting blog updates...")
    
    print("\nStep 1: Updating blog templates...")
    process_all_blogs()
    
    print("\nStep 2: Updating blog metadata...")
    process_all_blogs_metadata()
    
    print("\nAll updates completed!")

if __name__ == "__main__":
    update_all_blogs() 