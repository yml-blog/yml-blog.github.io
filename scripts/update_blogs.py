#!/usr/bin/env python3
"""
Update Blog Posts Script

This script automatically updates all blog HTML files with:
1. Dark mode toggle functionality
2. Social sharing buttons
3. SEO meta tags (if missing)

The script scans all HTML files in the root directory that match blog post patterns
and updates them to have consistent styling and functionality.
"""

import os
import re
import glob
from bs4 import BeautifulSoup

# Blog post files to update
BLOG_FILES_PATTERN = "*.html"
EXCLUDE_FILES = ["index.html", "readme.htm"]

# CSS for dark mode and social sharing buttons
DARK_MODE_CSS = """
        /* Dark mode toggle styles */
        .theme-switch-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 20px 0;
        }
        .theme-switch {
            display: inline-block;
            height: 24px;
            position: relative;
            width: 50px;
            margin: 0 10px;
        }
        .theme-switch input {
            display: none;
        }
        .slider {
            background-color: #ccc;
            bottom: 0;
            cursor: pointer;
            left: 0;
            position: absolute;
            right: 0;
            top: 0;
            transition: .4s;
        }
        .slider:before {
            background-color: #fff;
            bottom: 4px;
            content: "";
            height: 16px;
            left: 4px;
            position: absolute;
            transition: .4s;
            width: 16px;
        }
        input:checked + .slider {
            background-color: #f1780e;
        }
        input:checked + .slider:before {
            transform: translateX(26px);
        }
        .slider.round {
            border-radius: 34px;
        }
        .slider.round:before {
            border-radius: 50%;
        }
        
        /* Dark mode colors */
        body.dark-mode {
            background-color: #1a1a1a;
            color: #f5f5f5;
        }
        body.dark-mode .header .content h1,
        body.dark-mode .header .content p {
            color: #f5f5f5;
        }
        body.dark-mode .article-metadata {
            color: #dddddd;
        }
        body.dark-mode h2, 
        body.dark-mode h3, 
        body.dark-mode h4 {
            color: #f1780e;
        }
        body.dark-mode pre code {
            background-color: #2d2d2d;
            color: #f5f5f5;
        }
        body.dark-mode .technical-box {
            background-color: #2d2d2d;
            border-color: #3d3d3d;
        }
        body.dark-mode .key-aspects-table .table {
            color: #f5f5f5;
            background-color: #2a2a2a;
            border-color: #444;
        }
        body.dark-mode .key-aspects-table th {
            background-color: #333;
            color: #f5f5f5;
            border-color: #444;
        }
        body.dark-mode .key-aspects-table td {
            border-color: #444;
        }
        body.dark-mode .nav-menu {
            background-color: #252525;
        }
        
        /* Social sharing buttons */
        .blog-share-buttons {
            margin-top: 20px;
            margin-bottom: 30px;
            display: flex;
            gap: 15px;
        }
        .blog-share-buttons a {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 8px 16px;
            border-radius: 4px;
            color: #fff;
            text-decoration: none;
            transition: all 0.3s ease;
            font-weight: 500;
        }
        .blog-share-buttons .twitter {
            background-color: #1DA1F2;
        }
        .blog-share-buttons .linkedin {
            background-color: #0A66C2;
        }
        .blog-share-buttons .email {
            background-color: #D44638;
        }
        .blog-share-buttons a:hover {
            opacity: 0.9;
            transform: translateY(-2px);
        }
        .blog-share-buttons i {
            margin-right: 8px;
        }
"""

# Dark mode toggle HTML
DARK_MODE_TOGGLE = """
            <!-- Dark mode toggle -->
            <div class="theme-switch-wrapper">
                <span>Light</span>
                <label class="theme-switch" for="checkbox">
                    <input type="checkbox" id="checkbox" />
                    <div class="slider round"></div>
                </label>
                <span>Dark</span>
            </div>
"""

# Social sharing buttons HTML
SOCIAL_SHARING_BUTTONS = """
            <!-- Social sharing buttons -->
            <div class="blog-share-buttons">
                <a href="#" class="twitter" onclick="window.open('https://twitter.com/intent/tweet?url=' + encodeURIComponent(window.location.href) + '&text=' + encodeURIComponent(document.title), 'twitter-share', 'width=550,height=435'); return false;">
                    <i class="fa fa-twitter"></i> Share on Twitter
                </a>
                <a href="#" class="linkedin" onclick="window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(window.location.href), 'linkedin-share', 'width=550,height=435'); return false;">
                    <i class="fa fa-linkedin"></i> Share on LinkedIn
                </a>
                <a href="#" class="email" onclick="window.location.href = 'mailto:?subject=' + encodeURIComponent(document.title) + '&body=' + encodeURIComponent('Check out this article: ' + window.location.href); return false;">
                    <i class="fa fa-envelope"></i> Share via Email
                </a>
            </div>
"""

# Dark mode JS
DARK_MODE_JS = """
    <script>
        // Check for saved theme preference
        const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;
        
        // Apply saved theme on page load
        if (currentTheme) {
            document.body.classList.add(currentTheme);
            
            // Update toggle position if dark mode
            if (currentTheme === 'dark-mode') {
                document.getElementById('checkbox').checked = true;
            }
        }
        
        // Toggle theme when switch is clicked
        document.getElementById('checkbox').addEventListener('change', function(e) {
            if (e.target.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('theme', '');
            }
        });
    </script>
"""

def update_blog_post(file_path):
    """Update a single blog post with dark mode and social sharing features."""
    print(f"Processing {file_path}...")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Parse HTML with BeautifulSoup
        soup = BeautifulSoup(content, 'html.parser')
        
        # Check if dark mode already exists
        dark_mode_exists = bool(soup.select('.theme-switch-wrapper'))
        social_buttons_exist = bool(soup.select('.blog-share-buttons'))
        
        modified = False
        
        # Add dark mode CSS if not already present
        if not dark_mode_exists:
            # Find the head tag
            head = soup.find('head')
            if head:
                # Add CSS to the head
                style_tag = soup.new_tag('style')
                style_tag.string = DARK_MODE_CSS
                head.append(style_tag)
                modified = True
        
        # Add dark mode toggle and social buttons if not already present
        if not dark_mode_exists or not social_buttons_exist:
            # Find the article metadata section
            article_metadata = soup.select('.article-metadata')
            if article_metadata:
                metadata = article_metadata[0]
                
                # Add dark mode toggle before metadata if not exists
                if not dark_mode_exists:
                    toggle_soup = BeautifulSoup(DARK_MODE_TOGGLE, 'html.parser')
                    metadata.insert_before(toggle_soup)
                    modified = True
                
                # Add social buttons after metadata if not exists
                if not social_buttons_exist:
                    buttons_soup = BeautifulSoup(SOCIAL_SHARING_BUTTONS, 'html.parser')
                    metadata.insert_after(buttons_soup)
                    modified = True
        
        # Add dark mode JavaScript if not already present
        if not dark_mode_exists:
            # Find the last script tag before closing body
            body = soup.find('body')
            if body:
                # Add JS just before the end of body
                script_tag = BeautifulSoup(DARK_MODE_JS, 'html.parser')
                body.append(script_tag)
                modified = True
        
        # Add meta description if missing
        if not soup.find('meta', attrs={'name': 'description'}):
            # Generate a description from the first paragraph or heading
            first_paragraph = soup.find('p')
            description_text = ""
            if first_paragraph:
                description_text = first_paragraph.text[:160] + "..."
            else:
                # If no paragraph, try to use a heading
                first_heading = soup.find(['h1', 'h2', 'h3'])
                if first_heading:
                    description_text = first_heading.text[:160] + "..."
            
            if description_text:
                meta_tag = soup.new_tag('meta')
                meta_tag['name'] = 'description'
                meta_tag['content'] = description_text
                soup.find('head').append(meta_tag)
                modified = True
        
        # Save changes if modified
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(str(soup))
            print(f"✓ Updated {file_path}")
        else:
            print(f"✓ No changes needed for {file_path}")
            
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
        update_blog_post(file)
    
    print(f"Process completed. Updated {len(blog_files)} blog posts.")

if __name__ == "__main__":
    main() 