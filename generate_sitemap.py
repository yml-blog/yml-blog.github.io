import os
from pathlib import Path
from datetime import datetime, timezone

# 站点根目录（脚本放根目录即可用 .）
ROOT = Path('.')
# 站点基础URL（请根据实际情况修改）
BASE_URL = "https://yangmingli.com"
# WWW_BASE_URL = "https://www.yangmingli.com"  # Commented out as we only want non-www version

# 需要排除的目录
EXCLUDE_DIRS = {"admin", "private"}

def is_excluded(path):
    return any(part in EXCLUDE_DIRS for part in path.parts)

def get_lastmod(file_path):
    mtime = os.path.getmtime(file_path)
    dt = datetime.fromtimestamp(mtime, tz=timezone.utc)
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")

def main():
    urls = []
    for file_path in ROOT.rglob("*.html"):
        if is_excluded(file_path):
            continue
        # 生成相对URL，并把 index.html 转为目录形式
        rel_path = file_path.relative_to(ROOT).as_posix()
        lastmod = get_lastmod(file_path)
        
        # 生成非www版本URL
        if rel_path == "index.html":
            non_www_url = f"{BASE_URL}/"
        elif rel_path == "product.html":
            non_www_url = f"{BASE_URL}/product/"
        elif rel_path.endswith("/index.html"):
            non_www_url = f"{BASE_URL}/{rel_path[:-len('index.html')]}"
        else:
            non_www_url = f"{BASE_URL}/{rel_path}"
        urls.append((non_www_url, lastmod))
        
        # 生成www版本URL - Removed to only include non-www version
        # if rel_path == "index.html":
        #     www_url = f"{WWW_BASE_URL}/"
        # elif rel_path == "product.html":
        #     www_url = f"{WWW_BASE_URL}/product/"
        # elif rel_path.endswith("/index.html"):
        #     www_url = f"{WWW_BASE_URL}/{rel_path[:-len('index.html')]}"
        # else:
        #     www_url = f"{WWW_BASE_URL}/{rel_path}"
        # urls.append((www_url, lastmod))

    # 生成 sitemap.xml 内容
    sitemap = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]
    for url, lastmod in sorted(urls):
        sitemap.append("  <url>")
        sitemap.append(f"    <loc>{url}</loc>")
        sitemap.append(f"    <lastmod>{lastmod}</lastmod>")
        sitemap.append("  </url>")
    sitemap.append("</urlset>")

    # 写入根目录
    with open(ROOT / "sitemap.xml", "w", encoding="utf-8") as f:
        f.write("\n".join(sitemap))

    print(f"已生成 {len(urls)} 条目到 sitemap.xml")

if __name__ == "__main__":
    main()
