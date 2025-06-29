#!/usr/bin/env python3
"""
Semantic HTML Enhancement Script

This script enhances HTML files with proper semantic tags:
1. Replaces generic divs with semantic elements where appropriate
2. Ensures proper document structure with header, main, article, section tags
3. Improves accessibility and SEO through better HTML semantics

The script processes all blog HTML files in the root directory.
"""

import os
import glob
import re
from bs4 import BeautifulSoup

# Blog post files to update
BLOG_FILES_PATTERN = "*.html"
EXCLUDE_FILES = ["readme.htm"]

def enhance_semantics(file_path):
    """Enhance semantic structure of a single HTML file"""
    print(f"Processing semantic structure in {file_path}...")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Parse HTML with BeautifulSoup
        soup = BeautifulSoup(content, 'html.parser')
        modified = False
        
        # Check if main tag exists, if not, wrap content in main tag
        main_tag = soup.find('main')
        if not main_tag:
            # Look for the main content container
            content_container = None
            
            # Try to find main content by common patterns
            for selector in ['.container', '.content', '.main-content', '#content', '#main']:
                container = soup.select_one(selector)
                if container and not container.find_parent('header') and not container.find_parent('footer'):
                    content_container = container
                    break
            
            if content_container and content_container.name == 'div':
                # Wrap the content in a main tag
                content_container.wrap(soup.new_tag('main'))
                modified = True
        
        # Convert blog post sections to proper section tags
        for div in soup.find_all('div', class_=lambda c: c and ('section' in c or 'content-block' in c)):
            if div.name == 'div' and not div.find_parent('section'):
                # Create a new section tag
                section_tag = soup.new_tag('section')
                section_tag['class'] = div.get('class', [])
                section_tag['id'] = div.get('id', '')
                
                # Move all children to the new section tag
                for child in list(div.children):
                    section_tag.append(child)
                
                # Replace the div with the section tag
                div.replace_with(section_tag)
                modified = True
        
        # Convert blog post content to article tag if appropriate
        blog_content = soup.find('div', class_=lambda c: c and any(x in c for x in ['blog-content', 'post-content', 'article-content']))
        if blog_content and blog_content.name == 'div':
            # Create a new article tag
            article_tag = soup.new_tag('article')
            article_tag['class'] = blog_content.get('class', [])
            article_tag['id'] = blog_content.get('id', '')
            
            # Move all children to the new article tag
            for child in list(blog_content.children):
                article_tag.append(child)
            
            # Replace the div with the article tag
            blog_content.replace_with(article_tag)
            modified = True
        
        # Ensure nav elements are properly tagged
        nav_elements = soup.find_all('div', class_=lambda c: c and ('nav' in c or 'menu' in c or 'navigation' in c))
        for nav_div in nav_elements:
            if nav_div.name == 'div' and not nav_div.find_parent('nav'):
                # Create a new nav tag
                nav_tag = soup.new_tag('nav')
                nav_tag['class'] = nav_div.get('class', [])
                nav_tag['id'] = nav_div.get('id', '')
                
                # Move all children to the new nav tag
                for child in list(nav_div.children):
                    nav_tag.append(child)
                
                # Replace the div with the nav tag
                nav_div.replace_with(nav_tag)
                modified = True
        
        # Save changes if modified
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(str(soup))
            print(f"✓ Enhanced semantic structure in {file_path}")
        else:
            print(f"✓ No semantic enhancements needed for {file_path}")
            
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
        enhance_semantics(file)
    
    print(f"Process completed. Enhanced semantic structure in {len(blog_files)} files.")

if __name__ == "__main__":
    main() 