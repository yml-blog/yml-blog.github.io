#!/usr/bin/env python3
"""
Image Optimization Script

This script optimizes all images in HTML files by:
1. Adding loading="lazy" attribute for better performance
2. Adding alt attributes for accessibility
3. Ensuring proper width and height attributes where possible

The script processes all blog HTML files in the root directory.
"""

import os
import glob
import re
from bs4 import BeautifulSoup
import mimetypes

# Blog post files to update
BLOG_FILES_PATTERN = "*.html"
EXCLUDE_FILES = ["readme.htm"]

def generate_alt_text(img_src, page_title=""):
    """Generate alt text based on image filename and page context"""
    # Extract filename without extension
    filename = os.path.basename(img_src).split('.')[0]
    
    # Replace underscores and hyphens with spaces
    alt_text = re.sub(r'[-_]', ' ', filename)
    
    # Capitalize first letter of each word
    alt_text = ' '.join(word.capitalize() for word in alt_text.split())
    
    # If page title is available, add context
    if page_title:
        if not alt_text.lower() in page_title.lower():
            alt_text = f"{alt_text} - {page_title}"
    
    return alt_text

def optimize_images(file_path):
    """Optimize images in a single HTML file"""
    print(f"Processing images in {file_path}...")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Parse HTML with BeautifulSoup
        soup = BeautifulSoup(content, 'html.parser')
        
        # Get page title for context
        title_tag = soup.find('title')
        page_title = title_tag.string if title_tag else ""
        
        # Find all images
        images = soup.find_all('img')
        modified = False
        
        for img in images:
            # Add loading="lazy" if not present
            if not img.get('loading'):
                img['loading'] = 'lazy'
                modified = True
            
            # Add alt text if missing
            if not img.get('alt') or img['alt'].strip() == '':
                img_src = img.get('src', '')
                img['alt'] = generate_alt_text(img_src, page_title)
                modified = True
            
            # Ensure width and height attributes if possible
            # This helps prevent layout shifts during page load
            if not (img.get('width') and img.get('height')):
                # We can't determine actual dimensions here without loading the image
                # But we can add placeholder attributes for certain common images
                if 'logo' in img.get('src', '').lower():
                    if not img.get('width'):
                        img['width'] = '200'
                    if not img.get('height'):
                        img['height'] = '60'
                    modified = True
        
        # Save changes if modified
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(str(soup))
            print(f"✓ Optimized images in {file_path}")
        else:
            print(f"✓ No image optimizations needed for {file_path}")
            
    except Exception as e:
        print(f"Error processing {file_path}: {str(e)}")

def main():
    """Process all blog posts in the directory."""
    # Get the script's directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Change to the parent directory (project root)
    os.chdir(os.path.join(script_dir, '..'))
    
    # Find all HTML files in the root directory
    blog_files = glob.glob(BLOG_FILES_PATTERN)
    
    # Filter out files to exclude
    blog_files = [f for f in blog_files if f not in EXCLUDE_FILES]
    
    print(f"Found {len(blog_files)} files to process.")
    
    # Update each file
    for file in blog_files:
        optimize_images(file)
    
    print(f"Process completed. Optimized images in {len(blog_files)} files.")

if __name__ == "__main__":
    main() 