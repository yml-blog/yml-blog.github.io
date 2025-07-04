#!/usr/bin/env python3
"""
向所有HTML文件添加或更新规范链接标签的脚本。
确保每个页面都正确地指向其自身的规范URL。
"""

import os
from pathlib import Path
import re
from urllib.parse import urljoin

# 站点基础URL
BASE_URL = "https://yangmingli.com"
WWW_BASE_URL = "https://www.yangmingli.com"  # 如果也需要支持www域名

# 需要排除的目录
EXCLUDE_DIRS = {"admin", "private", ".git"}

def is_excluded(path):
    """检查路径是否应该被排除"""
    return any(part in EXCLUDE_DIRS for part in path.parts)

def add_or_update_canonical(file_path, base_url=BASE_URL):
    """为HTML文件添加或更新规范链接标签"""
    print(f"处理文件: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 生成规范URL
    rel_path = file_path.relative_to(Path('.'))
    
    if rel_path.name == "index.html":
        if rel_path.parent == Path('.'):
            # 主页特殊处理
            canonical_url = f"{base_url}/"
        else:
            # 目录首页
            parent_path = rel_path.parent.as_posix()
            canonical_url = f"{base_url}/{parent_path}/"
    else:
        # 普通页面
        canonical_url = f"{base_url}/{rel_path.as_posix()}"
    
    # 检查是否已有规范链接标签
    canonical_regex = re.compile(r'<link\s+rel=["\']canonical["\']\s+href=["\'](.*?)["\'].*?>')
    canonical_match = canonical_regex.search(content)
    
    if canonical_match:
        # 更新现有规范链接
        print(f"  更新规范链接: {canonical_match.group(1)} -> {canonical_url}")
        new_content = canonical_regex.sub(f'<link rel="canonical" href="{canonical_url}">', content)
    else:
        # 添加新的规范链接标签到head部分
        print(f"  添加新规范链接: {canonical_url}")
        head_end_tag = re.search(r'</head>', content, re.IGNORECASE)
        if head_end_tag:
            # 在</head>标签前插入
            pos = head_end_tag.start()
            new_content = content[:pos] + f'  <!-- Canonical URL -->\n  <link rel="canonical" href="{canonical_url}">\n  ' + content[pos:]
        else:
            print(f"  警告: 在文件 {file_path} 中未找到</head>标签")
            return False
    
    # 写回文件
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    return True

def main():
    """主函数"""
    processed = 0
    failed = 0
    
    # 处理所有HTML文件
    for file_path in Path('.').rglob("*.html"):
        if is_excluded(file_path):
            continue
        
        try:
            if add_or_update_canonical(file_path):
                processed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"  处理文件 {file_path} 时出错: {e}")
            failed += 1
    
    print(f"\n完成处理 {processed} 个文件，{failed} 个文件失败")

if __name__ == "__main__":
    main() 