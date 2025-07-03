import os
import shutil

# 将 src_dir 指向当前目录
src_dir = os.getcwd()
# 目标根目录：在当前目录下创建 nha-cai/<分类ID> 目录
dst_root = os.path.join(src_dir, 'nha-cai')
cat = '10439'  # 如果你有多个分类，可以改成循环或动态读取

for fname in os.listdir(src_dir):
    # 只处理以 8 位数字开头、以 .html 结尾的文件
    if fname.endswith('.html') and fname[:8].isdigit():
        post_id = fname[:8]
        dst_dir = os.path.join(dst_root, cat)
        os.makedirs(dst_dir, exist_ok=True)
        src_file = os.path.join(src_dir, fname)
        dst_file = os.path.join(dst_dir, f'{post_id}.shtml')
        shutil.copyfile(src_file, dst_file)
        print(f"Copied {src_file} -> {dst_file}")

print("所有 .shtml 文件已生成。")
