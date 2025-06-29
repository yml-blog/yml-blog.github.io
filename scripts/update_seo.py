#!/usr/bin/env python3
"""
SEO Update Script

This script updates all blog HTML files with proper SEO elements:
1. Optimized <title> tags (≤ 60 characters)
2. Meta descriptions (150-160 characters)
3. Open Graph and Twitter Card tags
4. JSON-LD structured data
5. Canonical URLs

The script ensures all blog posts follow SEO best practices.
"""

import os
import glob
import re
import json
from bs4 import BeautifulSoup

# Blog post files to update
BLOG_FILES_PATTERN = "*.html"
EXCLUDE_FILES = ["index.html", "readme.htm"]
BASE_URL = "https://yangmingli.com/"

# JSON-LD template for blog posts (as a Python dictionary)
BLOG_JSON_LD_TEMPLATE = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "{title}",
  "description": "{description}",
  "image": "https://yangmingli.com/img/Logo.png",
  "author": {
    "@type": "Person",
    "name": "Yangming Li"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Yangming Li Blog",
    "logo": {
      "@type": "ImageObject",
      "url": "https://yangmingli.com/img/Logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://yangmingli.com/{url}"
  }
}

def optimize_title(title):
    """Optimize title for SEO (≤ 60 characters)"""
    # Remove any "| Yangming Li" or similar suffix if present
    title = re.sub(r'\s*\|.*$', '', title)
    
    # If title is too long, truncate it
    if len(title) > 55:
        title = title[:52] + "..."
    
    # Add author name
    return f"{title} | Yangming Li"

def optimize_description(description):
    """Optimize meta description (150-160 characters)"""
    if not description:
        return "Yangming Li's insights on AI/ML, product development, and engineering. Practical guides and tutorials for data professionals and product managers."
    
    # Trim description if too long
    if len(description) > 155:
        description = description[:152] + "..."
    
    return description

def update_blog_seo(file_path):
    """Update SEO elements for a single blog post"""
    print(f"Processing {file_path}...")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Parse HTML with BeautifulSoup
        soup = BeautifulSoup(content, 'html.parser')
        
        # Get current title and description
        current_title = soup.title.string if soup.title else ""
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        current_description = meta_desc['content'] if meta_desc else ""
        
        # Optimize title and description
        optimized_title = optimize_title(current_title)
        optimized_description = optimize_description(current_description)
        
        # Update title
        if soup.title:
            soup.title.string = optimized_title
        
        # Update or add meta description
        if meta_desc:
            meta_desc['content'] = optimized_description
        else:
            new_meta_desc = soup.new_tag('meta')
            new_meta_desc['name'] = 'description'
            new_meta_desc['content'] = optimized_description
            soup.head.append(new_meta_desc)
        
        # Add language attribute to html tag if missing
        html_tag = soup.find('html')
        if html_tag and not html_tag.get('lang'):
            html_tag['lang'] = 'en'
        
        # Add canonical URL if missing
        rel_canonical = soup.find('link', attrs={'rel': 'canonical'})
        if not rel_canonical:
            canonical_url = BASE_URL + os.path.basename(file_path)
            new_canonical = soup.new_tag('link')
            new_canonical['rel'] = 'canonical'
            new_canonical['href'] = canonical_url
            soup.head.append(new_canonical)
        
        # Add robots meta if missing
        robots_meta = soup.find('meta', attrs={'name': 'robots'})
        if not robots_meta:
            new_robots = soup.new_tag('meta')
            new_robots['name'] = 'robots'
            new_robots['content'] = 'index,follow,max-image-preview:large'
            soup.head.append(new_robots)
        
        # Add Open Graph tags if missing
        og_title = soup.find('meta', attrs={'property': 'og:title'})
        if not og_title:
            # Add Open Graph tags
            og_tags = [
                ('og:type', 'article'),
                ('og:title', optimized_title),
                ('og:description', optimized_description),
                ('og:url', BASE_URL + os.path.basename(file_path)),
                ('og:image', BASE_URL + 'img/Logo.png')
            ]
            
            for tag_name, tag_content in og_tags:
                new_tag = soup.new_tag('meta')
                new_tag['property'] = tag_name
                new_tag['content'] = tag_content
                soup.head.append(new_tag)
        
        # Add Twitter Card tags if missing
        twitter_card = soup.find('meta', attrs={'name': 'twitter:card'})
        if not twitter_card:
            # Add Twitter Card tags
            twitter_tags = [
                ('twitter:card', 'summary_large_image'),
                ('twitter:title', optimized_title),
                ('twitter:description', optimized_description),
                ('twitter:image', BASE_URL + 'img/Logo.png')
            ]
            
            for tag_name, tag_content in twitter_tags:
                new_tag = soup.new_tag('meta')
                new_tag['name'] = tag_name
                new_tag['content'] = tag_content
                soup.head.append(new_tag)
        
        # Add JSON-LD structured data if missing
        json_ld = soup.find('script', attrs={'type': 'application/ld+json'})
        if not json_ld:
            # Create a copy of the template and fill in the placeholders
            json_ld_data = BLOG_JSON_LD_TEMPLATE.copy()
            json_ld_data["headline"] = optimized_title
            json_ld_data["description"] = optimized_description
            json_ld_data["mainEntityOfPage"]["@id"] = BASE_URL + os.path.basename(file_path)
            
            # Convert to JSON string
            json_ld_content = json.dumps(json_ld_data, ensure_ascii=False)
            
            # Create and add the script tag
            new_json_ld = soup.new_tag('script')
            new_json_ld['type'] = 'application/ld+json'
            new_json_ld.string = json_ld_content
            soup.head.append(new_json_ld)
        
        # Save changes
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(str(soup))
        print(f"✓ Updated SEO for {file_path}")
            
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
    
    print(f"Found {len(blog_files)} blog files to process.")
    
    # Update each blog file
    for file in blog_files:
        update_blog_seo(file)
    
    print(f"Process completed. Updated SEO for {len(blog_files)} blog posts.")

if __name__ == "__main__":
    main() 