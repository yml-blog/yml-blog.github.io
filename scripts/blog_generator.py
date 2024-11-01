import os
import re
from bs4 import BeautifulSoup

def modify_blog_template(html_file):
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    
    # Add required CSS and JS files if not present
    head = soup.find('head')
    if not head.find('link', href='css/blog_post.css'):
        head.append(soup.new_tag('link', href='css/blog_post.css', rel='stylesheet'))
    
    # Add sidebar.js if not present
    body = soup.find('body')
    if not body.find('script', src='js/sidebar.js'):
        sidebar_script = soup.new_tag('script', src='js/sidebar.js')
        body.append(sidebar_script)
    
    # Wrap main content in proper structure
    main = soup.find('main')
    if main and not main.find_parent(class_='blog-container'):
        # Create blog container
        blog_container = soup.new_tag('div', attrs={'class': 'blog-container'})
        main.wrap(blog_container)
    
    # Save modified file
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(str(soup.prettify()))

def process_all_blogs():
    # Directory containing blog HTML files
    blog_dir = '.'  # Change this to your blog directory path
    
    # Process all HTML files
    for filename in os.listdir(blog_dir):
        if filename.endswith('.html') and filename != 'index.html':
            file_path = os.path.join(blog_dir, filename)
            print(f"Processing {filename}...")
            modify_blog_template(file_path)
            print(f"Completed {filename}")

if __name__ == "__main__":
    process_all_blogs() 