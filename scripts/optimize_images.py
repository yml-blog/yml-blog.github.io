#!/usr/bin/env python3
"""
Image Optimization Script for Better SEO
This script optimizes images by:
1. Compressing them to reduce file size
2. Converting to WebP format
3. Adding proper dimensions for HTML
4. Generating responsive versions
"""

import os
import glob
from PIL import Image
import argparse

def optimize_image(image_path, output_dir=None, quality=85, convert_to_webp=True):
    """Optimize a single image."""
    try:
        # Open the image
        img = Image.open(image_path)
        
        # Get the file name and extension
        file_name = os.path.basename(image_path)
        file_base = os.path.splitext(file_name)[0]
        
        # Set output directory
        if output_dir is None:
            output_dir = os.path.dirname(image_path)
        
        os.makedirs(output_dir, exist_ok=True)
        
        # Get original dimensions
        width, height = img.size
        
        # Convert to WebP if requested
        if convert_to_webp:
            webp_path = os.path.join(output_dir, f"{file_base}.webp")
            img.save(webp_path, "WEBP", quality=quality)
            print(f"Saved WebP image: {webp_path}")
            print(f"Original size: {os.path.getsize(image_path)}, WebP size: {os.path.getsize(webp_path)}")
            print(f"HTML tag: <img src=\"{webp_path}\" alt=\"{file_base}\" width=\"{width}\" height=\"{height}\" loading=\"lazy\">")
            
            # Calculate size reduction percentage
            original_size = os.path.getsize(image_path)
            webp_size = os.path.getsize(webp_path)
            reduction = ((original_size - webp_size) / original_size) * 100
            print(f"Size reduction: {reduction:.2f}%")
        
        # Always save an optimized version of the original format
        optimized_path = os.path.join(output_dir, f"{file_base}_optimized{os.path.splitext(file_name)[1]}")
        img.save(optimized_path, quality=quality, optimize=True)
        print(f"Saved optimized image: {optimized_path}")
        
        # If image is large, create a smaller version for mobile
        if width > 800:
            ratio = height / width
            new_width = 800
            new_height = int(new_width * ratio)
            img_resized = img.resize((new_width, new_height), Image.LANCZOS)
            
            # Save resized image
            resized_path = os.path.join(output_dir, f"{file_base}_800{os.path.splitext(file_name)[1]}")
            img_resized.save(resized_path, quality=quality, optimize=True)
            print(f"Saved resized image: {resized_path}")
            
            # Save WebP version of resized image
            if convert_to_webp:
                webp_resized_path = os.path.join(output_dir, f"{file_base}_800.webp")
                img_resized.save(webp_resized_path, "WEBP", quality=quality)
                print(f"Saved resized WebP image: {webp_resized_path}")
        
        return True
    
    except Exception as e:
        print(f"Error optimizing {image_path}: {e}")
        return False

def get_html_tag_for_responsive_image(image_path, convert_to_webp=True):
    """Generate HTML tag for responsive image."""
    try:
        img = Image.open(image_path)
        width, height = img.size
        file_name = os.path.basename(image_path)
        file_base = os.path.splitext(file_name)[0]
        file_ext = os.path.splitext(file_name)[1]
        
        # For simplicity, assuming files are saved in the same structure
        output_dir = os.path.dirname(image_path)
        
        if convert_to_webp:
            html = f"""<picture>
    <source srcset="{file_base}.webp" type="image/webp">
    <source srcset="{file_base}{file_ext}" type="image/{file_ext[1:]}">
    <img src="{file_base}{file_ext}" alt="{file_base}" width="{width}" height="{height}" loading="lazy">
</picture>"""
        else:
            html = f'<img src="{file_name}" alt="{file_base}" width="{width}" height="{height}" loading="lazy">'
        
        return html
    
    except Exception as e:
        print(f"Error generating HTML tag for {image_path}: {e}")
        return ""

def process_all_images(image_dir, output_dir=None, quality=85, convert_to_webp=True):
    """Process all images in a directory."""
    # Get all image files
    image_files = []
    for ext in ['*.jpg', '*.jpeg', '*.png', '*.gif']:
        image_files.extend(glob.glob(os.path.join(image_dir, ext)))
    
    print(f"Found {len(image_files)} images to process")
    
    # Process each image
    success_count = 0
    for image_path in image_files:
        print(f"Processing: {image_path}")
        if optimize_image(image_path, output_dir, quality, convert_to_webp):
            success_count += 1
    
    print(f"Successfully processed {success_count} of {len(image_files)} images")

def main():
    """Main function."""
    parser = argparse.ArgumentParser(description="Optimize images for web and SEO.")
    parser.add_argument("--input", "-i", help="Input directory or file", required=True)
    parser.add_argument("--output", "-o", help="Output directory", default=None)
    parser.add_argument("--quality", "-q", help="JPEG/WebP quality (1-100)", type=int, default=85)
    parser.add_argument("--no-webp", help="Don't convert to WebP format", action="store_true")
    
    args = parser.parse_args()
    
    if os.path.isdir(args.input):
        process_all_images(args.input, args.output, args.quality, not args.no_webp)
    elif os.path.isfile(args.input):
        optimize_image(args.input, args.output, args.quality, not args.no_webp)
    else:
        print(f"Error: {args.input} is not a valid file or directory")

if __name__ == "__main__":
    main() 