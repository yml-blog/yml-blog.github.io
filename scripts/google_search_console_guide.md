# 向Google Search Console提交您的网站

要确保Google正确索引您的网站，请按照以下步骤在Google Search Console中提交您的网站：

## 1. 在Google Search Console中验证网站所有权

1. 访问 [Google Search Console](https://search.google.com/search-console/welcome)
2. 输入您的域名 `yangmingli.com`
3. 选择"域名"验证方式（推荐）或者"URL前缀"验证方式
4. 按照提示验证您对网站的所有权:
   - **域名验证**: 需要在您的DNS配置中添加TXT记录
   - **URL前缀验证**: 可以通过上传HTML文件或添加HTML标记验证

## 2. 提交您的主页和重要页面进行索引

### 方法一: 使用"检查URL"功能

1. 在Search Console中点击左上角的搜索栏
2. 输入您要提交的URL，例如 `https://yangmingli.com/`
3. 点击"索引"标签
4. 点击"申请编入索引"

### 方法二: 提交网站地图

1. 在Search Console左侧菜单中点击"站点地图"
2. 在"添加新的站点地图"中输入 `sitemap.xml`
3. 点击"提交"

## 3. 监控索引状态

1. 在左侧菜单中点击"覆盖率"
2. 检查"错误"、"有效"、"已排除"和"已发现 - 未编入索引"等部分
3. 特别关注任何被标记为"已排除"的页面，查看排除原因

## 4. 检查是否有noindex标签

如果您的页面没有被索引，请检查页面是否包含 `noindex` 标签。可以通过以下方法检查：

1. 查看页面的HTML源代码
2. 搜索 `<meta name="robots"` 或 `<meta name="googlebot"`
3. 确保没有 `content="noindex"` 标签，或者将其替换为 `content="index,follow"`

## 5. 修复常见索引问题

### 规范链接问题

确保所有页面都有正确的规范链接标签，指向页面的首选URL。例如：

```html
<!-- 主页的规范标签 -->
<link rel="canonical" href="https://yangmingli.com/">

<!-- 产品页面的规范标签 -->
<link rel="canonical" href="https://yangmingli.com/product/">
```

### 内容质量和重复内容

1. 确保网站内容是原创、有价值的
2. 避免重复内容
3. 每个页面应有独特的标题、描述和内容

### 网站性能优化

1. 确保网站加载速度快
2. 优化移动端体验
3. 使用HTTPS加密

## 6. 重新抓取特定URL

如果您修改了网站，想要Google重新抓取特定URL：

1. 在Search Console中使用"检查URL"功能
2. 输入要重新抓取的URL
3. 点击"测试实时版本"
4. 如果测试成功，点击"申请编入索引"

## 注意事项

- Google抓取和索引网站需要时间，可能需要几天到几周
- 优先确保您的主页、主要产品页面和博客文章被正确索引
- 定期检查Search Console中的覆盖率报告和性能报告
- 解决任何发现的爬行和索引问题 