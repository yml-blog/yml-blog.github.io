import os
from bs4 import BeautifulSoup
import nltk
from nltk.tokenize import word_tokenize
nltk.download('punkt')

def generate_metadata(content):
    # Count words
    words = word_tokenize(content)
    word_count = len(words)
    
    # Estimate read time (assuming 200 words per minute)
    read_time = max(1, round(word_count / 200))
    
    # Estimate token count (rough estimate)
    token_count = int(word_count * 1.3)
    
    return {
        'read_time': read_time,
        'word_count': word_count,
        'token_count': token_count
    }

def update_blog_metadata(html_file):
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    
    # Extract main content text
    main_content = soup.find('main')
    if main_content:
        text_content = main_content.get_text()
        metadata = generate_metadata(text_content)
        
        # Update or create metadata section
        metadata_div = soup.find('div', class_='article-metadata')
        if not metadata_div:
            metadata_div = soup.new_tag('div', attrs={'class': 'article-metadata'})
            header = soup.find('header')
            header.insert_after(metadata_div)
        
        metadata_div.clear()
        metadata_div.append(f'''
            <span class="read-time"><i class="fa fa-clock-o"></i> {metadata['read_time']} min read</span>
            <span class="word-count"><i class="fa fa-file-text-o"></i> Approx. {metadata['word_count']} words</span>
            <span class="token-count"><i class="fa fa-calculator"></i> Estimated {metadata['token_count']} tokens</span>
        ''')
    
    # Save modified file
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(str(soup.prettify()))

def process_all_blogs_metadata():
    blog_dir = '.'  # Change this to your blog directory path
    
    for filename in os.listdir(blog_dir):
        if filename.endswith('.html') and filename != 'index.html':
            file_path = os.path.join(blog_dir, filename)
            print(f"Updating metadata for {filename}...")
            update_blog_metadata(file_path)
            print(f"Completed {filename}")

if __name__ == "__main__":
    process_all_blogs_metadata() 