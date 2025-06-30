import os
import re
import sys
import math
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
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

def estimate_reading_time(content: str) -> int:
    """
    Estimate reading time in minutes based on word count
    Average reading speed: ~200 words per minute
    """
    # Remove HTML tags for word counting
    clean_content = re.sub(r'<.*?>', '', content)
    word_count = len(clean_content.split())
    # Return minutes, minimum 1
    return max(1, math.ceil(word_count / 200))

def generate_blog_html(
    title: str,
    description: str,
    content: str,
    keywords: List[str],
    category: str,
    url: str,
    tldr_en: str = "",
    tldr_zh: str = "",
    highlights: List[str] = None,
    related_articles: List[Dict[str, str]] = None,
    publish_date: str = None,
    modified_date: str = None
) -> str:
    """
    Generate a complete HTML blog post from the template
    """
    # Set defaults
    if highlights is None:
        highlights = ["Key point about this article"] * 4
    else:
        # Ensure we have exactly 4 highlights
        while len(highlights) < 4:
            highlights.append("Additional key point")
        highlights = highlights[:4]
    
    if related_articles is None:
        related_articles = []
    
    # Set dates if not provided
    if not publish_date:
        publish_date = datetime.now().strftime("%Y-%m-%d")
    if not modified_date:
        modified_date = publish_date
    
    # Load template
    template_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "templates", "blog_template.html")
    with open(template_path, "r", encoding="utf-8") as f:
        template = f.read()
    
    # Calculate word count for metadata
    clean_content = re.sub(r'<.*?>', '', content)
    word_count = str(len(clean_content.split()))
    
    # Calculate reading time
    reading_time = estimate_reading_time(content)
    
    # Generate related articles HTML
    related_html = ""
    if related_articles:
        for article in related_articles:
            related_html += f"""
            <div class="related-article">
                <img src="{article.get('image', 'img/Logo.png')}" alt="{article.get('title', '')}" loading="lazy">
                <div class="related-article-content">
                    <h4><a href="{article.get('url', '#')}">{article.get('title', '')}</a></h4>
                    <p>{article.get('description', '')}</p>
                </div>
            </div>
            """
    
    # Replace placeholders
    template = template.replace("{{TITLE}}", title)
    template = template.replace("{{DESCRIPTION}}", description)
    template = template.replace("{{KEYWORDS}}", ", ".join(keywords))
    template = template.replace("{{CATEGORY}}", category)
    template = template.replace("{{CATEGORY_URL}}", category.lower().replace(" ", "-"))
    template = template.replace("{{URL}}", url)
    template = template.replace("{{PUBLISH_DATE}}", publish_date)
    template = template.replace("{{MODIFIED_DATE}}", modified_date)
    template = template.replace("{{WORD_COUNT}}", word_count)
    template = template.replace("{{READING_TIME}}", str(reading_time))
    template = template.replace("{{TLDR_EN}}", tldr_en)
    template = template.replace("{{TLDR_ZH}}", tldr_zh)
    template = template.replace("{{HIGHLIGHT_1}}", highlights[0])
    template = template.replace("{{HIGHLIGHT_2}}", highlights[1])
    template = template.replace("{{HIGHLIGHT_3}}", highlights[2])
    template = template.replace("{{HIGHLIGHT_4}}", highlights[3])
    template = template.replace("{{RELATED_ARTICLES}}", related_html)
    
    # Place content
    content_marker = "<!-- Content goes here -->"
    template = template.replace(content_marker, content)
    
    return template

def save_blog(html: str, output_path: str) -> None:
    """
    Save the generated blog HTML to a file
    """
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Blog saved to {output_path}")

def generate_from_json(json_path: str, output_path: Optional[str] = None) -> None:
    """
    Generate a blog post from a JSON file
    """
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    if not output_path:
        # Generate output path from URL if not provided
        output_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            data["url"] if data["url"].endswith(".html") else f"{data['url']}.html"
        )
    
    html = generate_blog_html(
        title=data["title"],
        description=data["description"],
        content=data["content"],
        keywords=data["keywords"],
        category=data["category"],
        url=data["url"],
        tldr_en=data.get("tldr_en", ""),
        tldr_zh=data.get("tldr_zh", ""),
        highlights=data.get("highlights", None),
        related_articles=data.get("related_articles", None),
        publish_date=data.get("publish_date", None),
        modified_date=data.get("modified_date", None)
    )
    
    save_blog(html, output_path)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python blog_generator.py <json_file> [output_path]")
        sys.exit(1)
    
    json_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None
    
    generate_from_json(json_path, output_path) 