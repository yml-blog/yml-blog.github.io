#!/usr/bin/env python3
"""
Performance Optimization Script

This script optimizes HTML files for better performance:
1. Adds defer attribute to non-critical JavaScript
2. Adds preload for critical resources
3. Optimizes resource loading priorities
4. Improves Core Web Vitals metrics

The script processes all blog HTML files in the root directory.
"""

import os
import glob
import re
from bs4 import BeautifulSoup

# Blog post files to update
BLOG_FILES_PATTERN = "*.html"
EXCLUDE_FILES = ["readme.htm"]

# Critical CSS that should be inlined (minimal set for initial render)
CRITICAL_CSS = """
body {
  margin: 0;
  padding: 0;
  font-family: 'Hind', sans-serif;
  line-height: 1.6;
}
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}
.header {
  text-align: center;
  padding: 2rem 0;
}
h1 {
  margin-top: 0;
}
"""

def optimize_performance(file_path):
    """Optimize performance of a single HTML file"""
    print(f"Optimizing performance in {file_path}...")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Parse HTML with BeautifulSoup
        soup = BeautifulSoup(content, 'html.parser')
        modified = False
        
        # Add defer attribute to non-critical scripts
        scripts = soup.find_all('script', src=True)
        for script in scripts:
            # Skip scripts that are already deferred or async
            if script.get('defer') or script.get('async'):
                continue
                
            # Skip critical scripts that shouldn't be deferred
            critical_patterns = ['loadHeader.js', 'jquery']
            if any(pattern in script['src'] for pattern in critical_patterns):
                continue
                
            # Add defer attribute
            script['defer'] = ''
            modified = True
        
        # Add preload for critical resources
        head = soup.find('head')
        if head:
            # Check if we need to add preload for fonts
            font_links = soup.find_all('link', attrs={'href': lambda href: href and 'fonts.googleapis.com' in href})
            if font_links:
                # Add preload for Google Fonts
                preload_tag = soup.new_tag('link')
                preload_tag['rel'] = 'preconnect'
                preload_tag['href'] = 'https://fonts.googleapis.com'
                head.insert(0, preload_tag)
                
                preload_tag2 = soup.new_tag('link')
                preload_tag2['rel'] = 'preconnect'
                preload_tag2['href'] = 'https://fonts.gstatic.com'
                preload_tag2['crossorigin'] = ''
                head.insert(1, preload_tag2)
                
                modified = True
            
            # Add preload for critical CSS files
            css_links = soup.find_all('link', attrs={'rel': 'stylesheet'})
            critical_css_files = [link for link in css_links if 'style.css' in link.get('href', '') or 'bootstrap.min.css' in link.get('href', '')]
            
            for css_link in critical_css_files[:1]:  # Only preload the most critical CSS
                preload_tag = soup.new_tag('link')
                preload_tag['rel'] = 'preload'
                preload_tag['href'] = css_link['href']
                preload_tag['as'] = 'style'
                head.insert(0, preload_tag)
                modified = True
            
            # Add inline critical CSS if not already present
            if not soup.find('style', string=lambda s: s and 'body {' in s and 'margin: 0;' in s):
                style_tag = soup.new_tag('style')
                style_tag.string = CRITICAL_CSS
                head.insert(0, style_tag)
                modified = True
        
        # Add loading="lazy" to iframes if not already present
        iframes = soup.find_all('iframe')
        for iframe in iframes:
            if not iframe.get('loading'):
                iframe['loading'] = 'lazy'
                modified = True
        
        # Save changes if modified
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(str(soup))
            print(f"✓ Optimized performance in {file_path}")
        else:
            print(f"✓ No performance optimizations needed for {file_path}")
            
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
        optimize_performance(file)
    
    print(f"Process completed. Optimized performance in {len(blog_files)} files.")

if __name__ == "__main__":
    main() 