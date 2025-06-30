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

This script also updates the sitemap.xml file with current dates
and ensures all blog posts are properly included.
"""

import os
import glob
import re
import json
from bs4 import BeautifulSoup
from datetime import datetime
import xml.etree.ElementTree as ET
from xml.dom import minidom
from typing import List, Dict, Optional

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

def find_all_html_files():
    """Find all HTML files in the root directory excluding certain folders."""
    excluded_dirs = ['templates', 'email-templates']
    html_files = []
    
    for file in glob.glob('*.html'):
        html_files.append(file)
    
    return html_files

def extract_metadata_from_html(filepath):
    """Extract title, description, and other metadata from HTML files."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        soup = BeautifulSoup(content, 'html.parser')
        
        # Get title
        title_tag = soup.find('title')
        title = title_tag.text if title_tag else os.path.basename(filepath)
        
        # Get description
        meta_desc = soup.find('meta', {'name': 'description'})
        description = meta_desc.get('content') if meta_desc else ''
        
        # Get priority based on filepath
        if filepath == 'index.html':
            priority = '1.0'
        elif any(keyword in filepath for keyword in ['ml', 'ai', 'machine-learning']):
            priority = '0.8'
        else:
            priority = '0.7'
            
        # Get category
        category = 'AI/ML'
        if any(keyword in filepath for keyword in ['product', 'jira']):
            category = 'Product'
        elif any(keyword in filepath for keyword in ['kubernetes', 'docker', 'databricks']):
            category = 'Engineering'
            
        return {
            'loc': f'https://yangmingli.com/{filepath}',
            'lastmod': datetime.now().strftime('%Y-%m-%d'),
            'changefreq': 'monthly',
            'priority': priority,
            'title': title,
            'description': description,
            'category': category
        }
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return None

def update_sitemap(root_dir: str) -> None:
    """
    Update sitemap.xml with all HTML files and their last modification dates
    """
    # Define base URL
    base_url = "https://yangmingli.com/"
    
    # Create urlset element
    urlset = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
    
    # Add homepage
    homepage_url = ET.SubElement(urlset, "url")
    ET.SubElement(homepage_url, "loc").text = base_url
    ET.SubElement(homepage_url, "lastmod").text = datetime.now().strftime("%Y-%m-%d")
    ET.SubElement(homepage_url, "changefreq").text = "weekly"
    ET.SubElement(homepage_url, "priority").text = "1.0"
    
    # Categorize pages
    ai_ml_pages = []
    product_pages = []
    engineering_pages = []
    other_pages = []
    
    # Find all HTML files
    for file in os.listdir(root_dir):
        if file.endswith(".html") and file != "index.html" and not file.startswith("email-templates/"):
            file_path = os.path.join(root_dir, file)
            last_mod = datetime.fromtimestamp(os.path.getmtime(file_path)).strftime("%Y-%m-%d")
            
            # Categorize by content if possible
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    
                soup = BeautifulSoup(content, "html.parser")
                title = soup.title.string if soup.title else file
                
                page_info = {
                    "file": file,
                    "lastmod": last_mod,
                    "title": title
                }
                
                # Categorize based on filename or content
                if any(x in file.lower() for x in ["ml", "ai", "bert", "ray", "llm", "llama", "model"]):
                    ai_ml_pages.append(page_info)
                elif any(x in file.lower() for x in ["product", "jira", "management"]):
                    product_pages.append(page_info)
                elif any(x in file.lower() for x in ["engineering", "data", "kubernetes", "statistical", "databricks"]):
                    engineering_pages.append(page_info)
                else:
                    other_pages.append(page_info)
                    
            except Exception as e:
                print(f"Error processing {file}: {e}")
                other_pages.append({
                    "file": file,
                    "lastmod": last_mod,
                    "title": file
                })
    
    # Add pages to sitemap by category
    add_category_to_sitemap(urlset, ai_ml_pages, "AI/ML Blogs", base_url)
    add_category_to_sitemap(urlset, product_pages, "Product Blogs", base_url)
    add_category_to_sitemap(urlset, engineering_pages, "Engineering Blogs", base_url)
    add_category_to_sitemap(urlset, other_pages, "Self-Learning", base_url)
    
    # Create XML tree and write to file
    tree = ET.ElementTree(urlset)
    
    # Add XML declaration and format
    xml_declaration = '<?xml version="1.0" encoding="UTF-8"?>\n'
    
    # Convert to string with proper formatting
    rough_string = ET.tostring(urlset, 'utf-8')
    
    # Format XML with newlines and indentation
    import xml.dom.minidom
    pretty_xml = xml.dom.minidom.parseString(rough_string).toprettyxml(indent="   ")
    
    # Write to file
    sitemap_path = os.path.join(root_dir, "sitemap.xml")
    with open(sitemap_path, "w", encoding="utf-8") as f:
        f.write(xml_declaration + pretty_xml.split('<?xml version="1.0" ?>')[1])
    
    print(f"Sitemap updated at {sitemap_path}")

def add_category_to_sitemap(urlset: ET.Element, pages: List[Dict[str, str]], 
                          category_name: str, base_url: str) -> None:
    """Add a category of pages to the sitemap with a comment header"""
    
    # Sort pages by lastmod date, newest first
    pages.sort(key=lambda x: x["lastmod"], reverse=True)
    
    # Add category comment
    urlset.append(ET.Comment(f" {category_name} "))
    
    # Add each page in the category
    for page in pages:
        url_element = ET.SubElement(urlset, "url")
        ET.SubElement(url_element, "loc").text = f"{base_url}{page['file']}"
        ET.SubElement(url_element, "lastmod").text = page["lastmod"]
        ET.SubElement(url_element, "changefreq").text = "monthly"
        ET.SubElement(url_element, "priority").text = "0.8"

def update_meta_tags(root_dir: str, html_file: str) -> None:
    """
    Update meta tags in an HTML file for better SEO
    """
    file_path = os.path.join(root_dir, html_file)
    
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        soup = BeautifulSoup(content, "html.parser")
        
        # Get existing meta values
        title_tag = soup.title.string if soup.title else ""
        desc_meta = soup.find("meta", attrs={"name": "description"})
        desc_content = desc_meta["content"] if desc_meta else ""
        
        # Ensure canonical link exists
        canonical = soup.find("link", attrs={"rel": "canonical"})
        if not canonical:
            canonical = soup.new_tag("link", rel="canonical")
            canonical["href"] = f"https://yangmingli.com/{html_file}"
            soup.head.append(canonical)
        
        # Ensure Open Graph tags exist
        og_tags = {
            "og:title": title_tag,
            "og:description": desc_content,
            "og:url": f"https://yangmingli.com/{html_file}",
            "og:type": "article",
            "og:image": "https://yangmingli.com/img/Logo.png"
        }
        
        for og_prop, og_content in og_tags.items():
            og_meta = soup.find("meta", attrs={"property": og_prop})
            if not og_meta:
                og_meta = soup.new_tag("meta", property=og_prop)
                og_meta["content"] = og_content
                soup.head.append(og_meta)
        
        # Add Twitter Card tags if missing
        twitter_tags = {
            "twitter:card": "summary_large_image",
            "twitter:title": title_tag,
            "twitter:description": desc_content,
            "twitter:image": "https://yangmingli.com/img/Logo.png"
        }
        
        for tw_prop, tw_content in twitter_tags.items():
            tw_meta = soup.find("meta", attrs={"name": tw_prop})
            if not tw_meta:
                tw_meta = soup.new_tag("meta", name=tw_prop)
                tw_meta["content"] = tw_content
                soup.head.append(tw_meta)
        
        # Write updated HTML back to file
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(str(soup))
        
        print(f"Updated meta tags for {html_file}")
    
    except Exception as e:
        print(f"Error updating meta tags for {html_file}: {e}")

def update_all_meta_tags(root_dir: str) -> None:
    """
    Update meta tags for all HTML files in the directory
    """
    for file in os.listdir(root_dir):
        if file.endswith(".html") and not file.startswith("email-templates/"):
            update_meta_tags(root_dir, file)

def ensure_alt_text_for_images(root_dir: str) -> None:
    """
    Ensure all images have alt text for better accessibility and SEO
    """
    for file in os.listdir(root_dir):
        if file.endswith(".html") and not file.startswith("email-templates/"):
            file_path = os.path.join(root_dir, file)
            
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                soup = BeautifulSoup(content, "html.parser")
                images = soup.find_all("img")
                
                changes_made = False
                for img in images:
                    if not img.get("alt") or img["alt"].strip() == "":
                        # Generate alt text from surrounding context or filename
                        parent_heading = img.find_previous(["h1", "h2", "h3", "h4", "h5", "h6"])
                        if parent_heading and parent_heading.text.strip():
                            alt_text = f"Image related to {parent_heading.text.strip()}"
                        elif img.get("src"):
                            file_name = os.path.basename(img["src"]).split(".")[0]
                            alt_text = " ".join(file_name.split("_")).title()
                        else:
                            alt_text = "Descriptive image"
                        
                        img["alt"] = alt_text
                        changes_made = True
                
                if changes_made:
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(str(soup))
                    
                    print(f"Added missing alt text to images in {file}")
            
            except Exception as e:
                print(f"Error processing images in {file}: {e}")

def ping_search_engines(sitemap_url: str) -> None:
    """
    Ping search engines to notify them of sitemap updates
    """
    import requests
    
    search_engines = {
        "Google": f"https://www.google.com/ping?sitemap={sitemap_url}",
        "Bing": f"https://www.bing.com/ping?sitemap={sitemap_url}"
    }
    
    for engine, ping_url in search_engines.items():
        try:
            response = requests.get(ping_url)
            if response.status_code == 200:
                print(f"Successfully pinged {engine}")
            else:
                print(f"Failed to ping {engine}: {response.status_code}")
        except Exception as e:
            print(f"Error pinging {engine}: {e}")

def main():
    # Get the project root directory
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Update sitemap
    update_sitemap(root_dir)
    
    # Update meta tags
    update_all_meta_tags(root_dir)
    
    # Ensure all images have alt text
    ensure_alt_text_for_images(root_dir)
    
    # Ping search engines
    sitemap_url = "https://yangmingli.com/sitemap.xml"
    ping_search_engines(sitemap_url)
    
    print("SEO update complete!")

if __name__ == "__main__":
    main() 