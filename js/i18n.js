(function () {
    'use strict';

    const STORAGE_KEY = 'yangming-site-language';
    const DEFAULT_LANGUAGE = 'en';
    const LANGUAGES = {
        zh: { label: '中文', htmlLang: 'zh-Hans' },
        en: { label: 'English', htmlLang: 'en' },
        fr: { label: 'Français', htmlLang: 'fr' },
        ja: { label: '日本語', htmlLang: 'ja' },
        de: { label: 'Deutsch', htmlLang: 'de' }
    };

    const MESSAGES = {
        en: {
            'language.label': 'Language',
            'nav.home': 'Home',
            'nav.about': 'About',
            'nav.aboutMe': 'About Me',
            'nav.projects': 'Projects',
            'nav.portfolio': 'Portfolio',
            'nav.blog': 'Blog',
            'nav.blogIndex': 'Blog Index',
            'nav.aiEngineering': 'AI Engineering',
            'nav.resume': 'Resume',
            'nav.contact': 'Contact',
            'nav.notes': 'Notes',
            'nav.essays': 'Essays',
            'nav.lab': 'Lab',
            'nav.investing': 'Investing',
            'nav.aiMl': 'AI/ML',
            'nav.product': 'Product',
            'nav.engineering': 'Engineering',
            'nav.subscribe': 'Subscribe to Newsletter',
            'theme.light': 'Light',
            'theme.dark': 'Dark',
            'article.outline': 'Quick Outline',
            'home.skip': 'Skip to main content',
            'home.hero.titleHtml': '<span class="hero-welcome">Welcome, I\'m Yangming Li</span>I design applied AI systems and production-ready AI architecture.',
            'home.hero.role': 'AI Engineer + Product Builder focused on LLM system design, retrieval, evaluation, statistical ML, data engineering, and experiment infrastructure for healthcare, finance, and enterprise teams.',
            'home.hero.intro': 'I work at the intersection of AI engineering, statistical ML, data engineering, and product thinking to design systems teams can actually ship, from retrieval-augmented applications to experiment-ready data platforms.',
            'home.hero.askHtml': '<i class="fa fa-comments"></i> Ask Yangming AI',
            'home.proof.title': 'A faster read on trust, fit, and delivery',
            'home.proof.copy': 'Built for teams that care about adoption, auditability, and production impact, not just model demos. The homepage now keeps the proof points visible and moves side quests into quieter corners.',
            'home.utility.title': 'Lower-priority paths live here',
            'home.utility.copy': 'Study notes, essays, experiments, and certificates still matter, but they no longer lead the homepage story. They now sit behind softer entry points so the main narrative stays focused on work, proof, and outcomes.',
            'home.utility.note': 'This keeps the homepage pointed at collaborators and hiring managers first, while still giving curious visitors a place to explore the side material.',
            'home.selectedWriting': 'Selected Writing',
            'home.blogIntroHtml': 'Browse writing by topic. AI/ML, product, engineering, and investing now live under one blog view. For production AI systems, visit the dedicated <a href="ai-engineering/">AI Engineering</a> column.',
            'home.blog.search': 'Search articles...',
            'home.selectedWork': 'Selected Work',
            'home.portfolioIntro': 'Representative work themes across healthcare, finance, and enterprise teams, centered on production AI systems that move beyond demos.',
            'home.investingTitle': 'Investing',
            'home.investingIntro': 'Notes on capital allocation, market structure, and the quieter parts of long-term decision-making.',
            'home.notesTitle': 'Notes',
            'home.notesIntro': 'Working notes, study artifacts, and lower-priority references that support the main body of work.',
            'home.essaysTitle': 'Essays & References',
            'home.essaysIntro': 'A quieter corner for essays, references, and ideas that inform how I build.',
            'home.labTitle': 'Lab',
            'home.labIntro': 'A smaller corner for interactive prototypes and playful experiments. The slot machine stays here as a lightweight demo, not part of the main positioning story.',
            'home.contactTitle': 'Contact',
            'ask.eyebrowHtml': '<span class="ask-yangming-launcher-dot"></span> Grounded Site Assistant',
            'ask.title': 'Ask Yangming',
            'ask.subtitle': 'A lightweight assistant for site visitors. Best for fit, focus areas, blog recommendations, and contact routing.',
            'ask.placeholder': 'Ask about expertise, relevant posts, project fit, or how to get in touch.',
            'ask.footnote': 'This version embeds local site knowledge directly in the frontend, so it works on a static host without a separate JSON or backend. If you later want live model responses, switch the assistant mode and point it at a deployed API.',
            'ask.clear': 'Clear conversation',
            'ask.close': 'Close assistant',
            'ask.panel': 'Ask Yangming assistant',
            'ask.empty': 'Ask about Yangming\'s focus areas, relevant blog posts, or whether a project is a fit. This version can answer directly from local site knowledge, even on a static host.',
            'ask.prompt.build': 'What do you build?',
            'ask.prompt.posts': 'Which posts should I read if I care about MLOps and LLM systems?',
            'ask.prompt.contact': 'How can I contact you for AI or data work?',
            'about.h1': 'About Yangming Li',
            'about.intro': 'Yangming Li is an AI Engineer and Product Builder focused on applied AI systems and production AI architecture. The site highlights work and notes across LLM system design, retrieval, evaluation, statistical machine learning, data engineering, data products, and experiment infrastructure for healthcare, finance, and enterprise teams.',
            'about.focus': 'Focus Areas',
            'about.focus1': 'LLM systems, copilots, retrieval-augmented generation, and document intelligence.',
            'about.focus2': 'Statistical ML, NLP, topic modeling, and trustworthy machine learning.',
            'about.focus3': 'Data products, analytics systems, and decision-support tools.',
            'about.focus4': 'MLOps, experiment infrastructure, A/B testing, and production delivery.',
            'about.start': 'Start Here',
            'about.startHtml': 'Explore the <a href="/projects.html">projects page</a> for selected work themes, the <a href="/blog/">blog index</a> for technical writing, or the <a href="/resume.html">resume page</a> for a concise professional overview.',
            'projects.h1': 'Projects and portfolio themes',
            'projects.intro': 'Selected work themes across healthcare, finance, and enterprise teams, centered on production AI systems that move beyond demos.',
            'projects.kicker1': 'LLM Systems',
            'projects.title1': 'Applied AI for document and knowledge systems',
            'projects.copy1Html': 'Work around copilots, retrieval-augmented generation, report generation, and AI system integration. Related notes: <a href="/llama-report-guide.html">LlamaReport guide</a>, <a href="/mcp-protocol-guide.html">MCP guide</a>, and <a href="/n8n-ai-workflows.html">AI systems guide</a>.',
            'projects.kicker2': 'Data Products',
            'projects.title2': 'Decision-support products for complex teams',
            'projects.copy2Html': 'Analytics and product experiences that help operational teams move from raw data to better decisions. Related notes: <a href="/building-product-scales-company.html">product strategy</a>, <a href="/product-success-essence.html">product fundamentals</a>, and <a href="/jira-guide.html">delivery systems</a>.',
            'projects.kicker3': 'Experiment Infrastructure',
            'projects.title3': 'From experimentation to production delivery',
            'projects.copy3Html': 'Systems thinking across A/B testing, MLOps, data platforms, and reliable launch measurement. Related notes: <a href="/engineering/ab-test-engineering-guide.html">A/B testing systems</a>, <a href="/mlops-essential-skills.html">MLOps foundations</a>, and <a href="/databricks-comprehensive-guide.html">data platform guide</a>.',
            'resume.h1': 'Resume overview',
            'resume.intro': 'Yangming Li works at the intersection of applied AI, AI system architecture, data science, product systems, and engineering execution. This page summarizes the focus areas already represented across the site.',
            'resume.focus': 'Technical Focus',
            'resume.item1': 'Applied AI systems, LLM architecture, copilots, retrieval, and document intelligence.',
            'resume.item2': 'Statistical machine learning, NLP, topic modeling, and trustworthy ML.',
            'resume.item3': 'Data engineering, data products, MLOps, and experiment infrastructure.',
            'resume.item4': 'Product strategy, analytics systems, decision-support tooling, and production delivery.',
            'resume.credentials': 'Credentials and Learning',
            'resume.credentialsHtml': 'The site references CFA and FRM credentials and includes a <a href="/courses.html">courses and certificates page</a> with supporting learning records.',
            'resume.writing': 'Selected Writing',
            'resume.writingHtml': 'For evidence of technical focus, review the <a href="/blog/">blog index</a>, <a href="/projects.html">project themes</a>, and articles on <a href="/mlops-essential-skills.html">MLOps</a>, <a href="/mcp-protocol-guide.html">MCP</a>, and <a href="/engineering/ab-test-engineering-guide.html">A/B testing systems</a>.',
            'contact.h1': 'Contact Yangming Li',
            'contact.intro': 'For conversations about applied AI systems, AI system architecture, data products, analytics, or technical collaboration, use the contact channels below.',
            'contact.links': 'Contact Links',
            'contact.related': 'Related Pages',
            'contact.relatedHtml': 'Before reaching out, you can review <a href="/projects.html">project themes</a>, <a href="/resume.html">resume focus areas</a>, or <a href="/blog/">technical writing</a>.',
            'blog.h1': 'Articles on applied AI, data science, product systems, and engineering',
            'blog.leadHtml': 'A crawlable index of practical notes by Yangming Li, covering LLM systems, AI system architecture, NLP, MLOps, statistical learning, experimentation, and product thinking. The dedicated <a href="/ai-engineering/">AI Engineering</a> column collects the posts closest to production AI systems.',
            'blog.ai': 'AI Engineering',
            'blog.applied': 'Applied AI and ML',
            'blog.data': 'Data platforms and MLOps',
            'blog.product': 'Product and experimentation',
            'ai.eyebrow': 'Dedicated Column',
            'ai.h1': 'AI Engineering',
            'ai.lead': 'Practical notes on building production AI systems: LLM applications, agent architecture, evaluation, retrieval, MLOps, deployment, observability, and the data platforms underneath them.',
            'ai.llm': 'LLM Systems and Agents',
            'ai.mlops': 'Production ML and MLOps',
            'ai.infrastructure': 'AI Infrastructure',
            'ai.scope': 'Editorial Scope',
            'ai.scopeNote': 'This column is for the engineering layer between AI demos and dependable products: system design, integration, evaluation, reliability, data quality, deployment, and developer tooling. General ML theory still appears in the main blog, while this page collects the posts closest to shipping AI systems.',
            'courses.h1': 'Courses & Certificates',
            'courses.subtitle': 'A collection of completed courses and earned certificates in programming, machine learning, data science, and MLOps.',
            'courses.datacamp': 'DataCamp Courses',
            'courses.coursera': 'Coursera Courses',
            'courses.leetcode': 'LeetCode Problem Solutions (Python)',
            'courses.leetcodeIntro': 'Repository of Python solutions for LeetCode Top 150 interview problems. Each solution includes detailed explanation and optimal approaches.',
            'courses.leetcodeOutro': 'These are sample solutions from a collection of 150+ LeetCode problems I\'ve solved. Each solution includes optimized approaches with time and space complexity analysis. The complete repository contains solutions for array manipulation, linked lists, dynamic programming, trees, graphs, and other common interview topics.',
            'courses.viewRepo': 'View Complete LeetCode Solutions Repository',
            'courses.backHomeHtml': '<i class="fa fa-arrow-left"></i> Back to Home',
            'courses.backHtml': '<i class="fa fa-arrow-left"></i> Back to Certificates',
            'leetcode.problem': 'Problem Description',
            'leetcode.solution': 'Solution Approach',
            'leetcode.example': 'Example:',
            'leetcode.python': 'Python Implementation:',
            'leetcode.time': 'Time Complexity:',
            'leetcode.space': 'Space Complexity:',
            'product.movedTitle': 'Blog index moved',
            'product.movedCopyHtml': 'The article index now lives at <a href="/blog/">https://yangmingli.com/blog/</a>.'
        },
        zh: {
            'language.label': '语言',
            'nav.home': '首页',
            'nav.about': '关于',
            'nav.aboutMe': '关于我',
            'nav.projects': '项目',
            'nav.portfolio': '作品集',
            'nav.blog': '博客',
            'nav.blogIndex': '博客索引',
            'nav.aiEngineering': 'AI 工程',
            'nav.resume': '简历',
            'nav.contact': '联系',
            'nav.notes': '笔记',
            'nav.essays': '随笔',
            'nav.lab': '实验室',
            'nav.investing': '投资',
            'nav.aiMl': 'AI/ML',
            'nav.product': '产品',
            'nav.engineering': '工程',
            'nav.subscribe': '订阅通讯',
            'theme.light': '浅色',
            'theme.dark': '深色',
            'article.outline': '快速目录',
            'home.skip': '跳到主要内容',
            'home.hero.titleHtml': '<span class="hero-welcome">欢迎，我是 Yangming Li</span>我设计可落地的应用 AI 系统和生产级 AI 架构。',
            'home.hero.role': 'AI 工程师 + 产品构建者，专注于 LLM 系统设计、检索、评估、统计机器学习、数据工程，以及面向医疗、金融和企业团队的实验基础设施。',
            'home.hero.intro': '我在 AI 工程、统计机器学习、数据工程和产品思维的交叉处工作，设计团队真正能交付的系统，从检索增强应用到可用于实验的数据平台。',
            'home.hero.askHtml': '<i class="fa fa-comments"></i> 询问 Yangming AI',
            'home.proof.title': '更快判断信任度、匹配度与交付能力',
            'home.proof.copy': '面向重视采用、可审计性和生产影响的团队，而不只是模型演示。首页把证明点放在更显眼的位置，把支线内容收进更安静的入口。',
            'home.utility.title': '低优先级路径放在这里',
            'home.utility.copy': '学习笔记、随笔、实验和证书依然重要，但不再主导首页叙事。它们被放到更柔和的入口后面，让主线继续聚焦工作、证据和结果。',
            'home.utility.note': '这样首页首先服务合作者和招聘经理，同时也让好奇的访客能继续探索旁支材料。',
            'home.selectedWriting': '精选文章',
            'home.blogIntroHtml': '按主题浏览文章。AI/ML、产品、工程和投资现在都在同一个博客视图下；生产 AI 系统相关内容请访问专门的 <a href="ai-engineering/">AI 工程</a> 专栏。',
            'home.blog.search': '搜索文章...',
            'home.selectedWork': '精选作品',
            'home.portfolioIntro': '代表性的工作主题覆盖医疗、金融和企业团队，重点是超越演示、面向生产的 AI 系统。',
            'home.investingTitle': '投资',
            'home.investingIntro': '关于资本配置、市场结构，以及长期决策中更安静部分的笔记。',
            'home.notesTitle': '笔记',
            'home.notesIntro': '工作笔记、学习材料和低优先级参考，用来支撑主要作品。',
            'home.essaysTitle': '随笔与参考',
            'home.essaysIntro': '一个更安静的角落，用来放置影响我构建方式的随笔、参考和想法。',
            'home.labTitle': '实验室',
            'home.labIntro': '放置交互原型和轻量实验的小角落。老虎机作为轻量演示保留在这里，不参与主页的核心定位。',
            'home.contactTitle': '联系',
            'ask.eyebrowHtml': '<span class="ask-yangming-launcher-dot"></span> 基于站点内容的助手',
            'ask.title': '询问 Yangming',
            'ask.subtitle': '面向访客的轻量助手，适合了解匹配度、关注领域、博客推荐和联系方式。',
            'ask.placeholder': '询问专业方向、相关文章、项目匹配度或联系方式。',
            'ask.footnote': '这个版本把本地站点知识直接嵌入前端，因此即使在静态托管上也能工作，不需要额外 JSON 或后端。之后如果想接入实时模型回答，可以切换助手模式并指向已部署的 API。',
            'ask.clear': '清空对话',
            'ask.close': '关闭助手',
            'ask.panel': '询问 Yangming 助手',
            'ask.empty': '可以询问 Yangming 的关注领域、相关博客文章，或某个项目是否匹配。这个版本直接使用本地站点知识回答，即使在静态托管上也能运行。',
            'ask.prompt.build': '你主要构建什么？',
            'ask.prompt.posts': '如果我关注 MLOps 和 LLM 系统，应该读哪些文章？',
            'ask.prompt.contact': '如果想聊 AI 或数据相关工作，怎么联系你？',
            'about.h1': '关于 Yangming Li',
            'about.intro': 'Yangming Li 是一名 AI 工程师和产品构建者，专注于应用 AI 系统和生产级 AI 架构。这个站点展示了他在 LLM 系统设计、检索、评估、统计机器学习、数据工程、数据产品，以及面向医疗、金融和企业团队的实验基础设施方面的工作与笔记。',
            'about.focus': '关注领域',
            'about.focus1': 'LLM 系统、Copilot、检索增强生成和文档智能。',
            'about.focus2': '统计机器学习、NLP、主题建模和可信机器学习。',
            'about.focus3': '数据产品、分析系统和决策支持工具。',
            'about.focus4': 'MLOps、实验基础设施、A/B 测试和生产交付。',
            'about.start': '从这里开始',
            'about.startHtml': '可以先看 <a href="/projects.html">项目页面</a> 了解精选工作主题，访问 <a href="/blog/">博客索引</a> 阅读技术文章，或打开 <a href="/resume.html">简历页面</a> 查看简洁的职业概览。',
            'projects.h1': '项目与作品主题',
            'projects.intro': '精选工作主题覆盖医疗、金融和企业团队，核心是面向生产、超越演示的 AI 系统。',
            'projects.kicker1': 'LLM 系统',
            'projects.title1': '面向文档和知识系统的应用 AI',
            'projects.copy1Html': '围绕 Copilot、检索增强生成、报告生成和 AI 系统集成开展工作。相关笔记包括 <a href="/llama-report-guide.html">LlamaReport 指南</a>、<a href="/mcp-protocol-guide.html">MCP 指南</a> 和 <a href="/n8n-ai-workflows.html">AI 系统指南</a>。',
            'projects.kicker2': '数据产品',
            'projects.title2': '服务复杂团队的决策支持产品',
            'projects.copy2Html': '构建分析与产品体验，帮助运营团队从原始数据走向更好的决策。相关笔记包括 <a href="/building-product-scales-company.html">产品战略</a>、<a href="/product-success-essence.html">产品基本功</a> 和 <a href="/jira-guide.html">交付系统</a>。',
            'projects.kicker3': '实验基础设施',
            'projects.title3': '从实验到生产交付',
            'projects.copy3Html': '围绕 A/B 测试、MLOps、数据平台和可靠发布衡量进行系统化思考。相关笔记包括 <a href="/engineering/ab-test-engineering-guide.html">A/B 测试系统</a>、<a href="/mlops-essential-skills.html">MLOps 基础</a> 和 <a href="/databricks-comprehensive-guide.html">数据平台指南</a>。',
            'resume.h1': '简历概览',
            'resume.intro': 'Yangming Li 的工作位于应用 AI、AI 系统架构、数据科学、产品系统和工程执行的交叉处。本页概括了站点中已经呈现的重点方向。',
            'resume.focus': '技术重点',
            'resume.item1': '应用 AI 系统、LLM 架构、Copilot、检索和文档智能。',
            'resume.item2': '统计机器学习、NLP、主题建模和可信 ML。',
            'resume.item3': '数据工程、数据产品、MLOps 和实验基础设施。',
            'resume.item4': '产品战略、分析系统、决策支持工具和生产交付。',
            'resume.credentials': '证书与学习',
            'resume.credentialsHtml': '站点提到 CFA 和 FRM 证书，并提供 <a href="/courses.html">课程与证书页面</a> 作为学习记录支持。',
            'resume.writing': '精选文章',
            'resume.writingHtml': '想了解技术重点，可以查看 <a href="/blog/">博客索引</a>、<a href="/projects.html">项目主题</a>，以及关于 <a href="/mlops-essential-skills.html">MLOps</a>、<a href="/mcp-protocol-guide.html">MCP</a> 和 <a href="/engineering/ab-test-engineering-guide.html">A/B 测试系统</a> 的文章。',
            'contact.h1': '联系 Yangming Li',
            'contact.intro': '如果想交流应用 AI 系统、AI 系统架构、数据产品、分析或技术协作，可以使用下面的联系方式。',
            'contact.links': '联系方式',
            'contact.related': '相关页面',
            'contact.relatedHtml': '联系之前，你可以先查看 <a href="/projects.html">项目主题</a>、<a href="/resume.html">简历重点</a> 或 <a href="/blog/">技术文章</a>。',
            'blog.h1': '关于应用 AI、数据科学、产品系统和工程的文章',
            'blog.leadHtml': '这是 Yangming Li 的可抓取文章索引，覆盖 LLM 系统、AI 系统架构、NLP、MLOps、统计学习、实验和产品思维。专门的 <a href="/ai-engineering/">AI 工程</a> 专栏收录最接近生产 AI 系统的文章。',
            'blog.ai': 'AI 工程',
            'blog.applied': '应用 AI 与 ML',
            'blog.data': '数据平台与 MLOps',
            'blog.product': '产品与实验',
            'ai.eyebrow': '专门专栏',
            'ai.h1': 'AI 工程',
            'ai.lead': '关于构建生产 AI 系统的实践笔记：LLM 应用、智能体架构、评估、检索、MLOps、部署、可观测性，以及其下的数据平台。',
            'ai.llm': 'LLM 系统与智能体',
            'ai.mlops': '生产 ML 与 MLOps',
            'ai.infrastructure': 'AI 基础设施',
            'ai.scope': '编辑范围',
            'ai.scopeNote': '这个专栏关注 AI 演示和可靠产品之间的工程层：系统设计、集成、评估、可靠性、数据质量、部署和开发者工具。一般 ML 理论仍会出现在主博客，这里集中收录最接近交付 AI 系统的文章。',
            'courses.h1': '课程与证书',
            'courses.subtitle': '编程、机器学习、数据科学和 MLOps 方向已完成课程与证书的集合。',
            'courses.datacamp': 'DataCamp 课程',
            'courses.coursera': 'Coursera 课程',
            'courses.leetcode': 'LeetCode 题解（Python）',
            'courses.leetcodeIntro': 'LeetCode Top 150 面试题的 Python 解法仓库。每道题都包含详细说明和优化思路。',
            'courses.leetcodeOutro': '这些是我完成的 150+ 道 LeetCode 题中的示例解法。每个解法都包含优化思路、时间复杂度和空间复杂度分析。完整仓库覆盖数组、链表、动态规划、树、图以及其他常见面试主题。',
            'courses.viewRepo': '查看完整 LeetCode 题解仓库',
            'courses.backHomeHtml': '<i class="fa fa-arrow-left"></i> 返回首页',
            'courses.backHtml': '<i class="fa fa-arrow-left"></i> 返回证书页面',
            'leetcode.problem': '题目描述',
            'leetcode.solution': '解题思路',
            'leetcode.example': '示例：',
            'leetcode.python': 'Python 实现：',
            'leetcode.time': '时间复杂度：',
            'leetcode.space': '空间复杂度：',
            'product.movedTitle': '博客索引已移动',
            'product.movedCopyHtml': '文章索引现在位于 <a href="/blog/">https://yangmingli.com/blog/</a>。'
        },
        fr: {
            'language.label': 'Langue',
            'nav.home': 'Accueil',
            'nav.about': 'À propos',
            'nav.aboutMe': 'À propos',
            'nav.projects': 'Projets',
            'nav.portfolio': 'Portfolio',
            'nav.blog': 'Blog',
            'nav.blogIndex': 'Index du blog',
            'nav.aiEngineering': 'Ingénierie IA',
            'nav.resume': 'CV',
            'nav.contact': 'Contact',
            'nav.notes': 'Notes',
            'nav.essays': 'Essais',
            'nav.lab': 'Labo',
            'nav.investing': 'Investissement',
            'nav.aiMl': 'IA/ML',
            'nav.product': 'Produit',
            'nav.engineering': 'Ingénierie',
            'nav.subscribe': 'S’abonner',
            'theme.light': 'Clair',
            'theme.dark': 'Sombre',
            'article.outline': 'Plan rapide',
            'home.skip': 'Aller au contenu principal',
            'home.hero.titleHtml': '<span class="hero-welcome">Bienvenue, je suis Yangming Li</span>Je conçois des systèmes d’IA appliquée et des architectures IA prêtes pour la production.',
            'home.hero.role': 'Ingénieur IA + créateur produit, concentré sur les systèmes LLM, la recherche augmentée, l’évaluation, le ML statistique, l’ingénierie des données et l’infrastructure d’expérimentation pour les équipes santé, finance et entreprise.',
            'home.hero.intro': 'Je travaille à l’intersection de l’ingénierie IA, du ML statistique, de l’ingénierie des données et du produit pour concevoir des systèmes que les équipes peuvent réellement livrer.',
            'home.hero.askHtml': '<i class="fa fa-comments"></i> Demander à Yangming AI',
            'home.proof.title': 'Lire plus vite la confiance, l’adéquation et la livraison',
            'home.proof.copy': 'Pensé pour des équipes qui se soucient de l’adoption, de l’auditabilité et de l’impact en production, pas seulement des démos de modèles.',
            'home.utility.title': 'Les chemins secondaires vivent ici',
            'home.utility.copy': 'Notes d’étude, essais, expériences et certificats restent utiles, mais ne dominent plus le récit de la page d’accueil.',
            'home.utility.note': 'La page d’accueil reste orientée vers les collaborateurs et recruteurs, tout en laissant les visiteurs curieux explorer le reste.',
            'home.selectedWriting': 'Articles sélectionnés',
            'home.blogIntroHtml': 'Parcourez les articles par thème. IA/ML, produit, ingénierie et investissement vivent désormais dans une seule vue blog. Pour les systèmes IA de production, visitez la rubrique <a href="ai-engineering/">Ingénierie IA</a>.',
            'home.blog.search': 'Rechercher des articles...',
            'home.selectedWork': 'Travaux sélectionnés',
            'home.portfolioIntro': 'Thèmes représentatifs pour des équipes santé, finance et entreprise, centrés sur des systèmes IA de production qui dépassent la démo.',
            'home.investingTitle': 'Investissement',
            'home.investingIntro': 'Notes sur l’allocation du capital, la structure des marchés et les aspects plus calmes de la décision à long terme.',
            'home.notesTitle': 'Notes',
            'home.notesIntro': 'Notes de travail, ressources d’étude et références secondaires qui soutiennent le travail principal.',
            'home.essaysTitle': 'Essais et références',
            'home.essaysIntro': 'Un coin plus calme pour les idées, essais et références qui influencent ma façon de construire.',
            'home.labTitle': 'Labo',
            'home.labIntro': 'Un petit espace pour prototypes interactifs et expériences légères.',
            'home.contactTitle': 'Contact',
            'ask.eyebrowHtml': '<span class="ask-yangming-launcher-dot"></span> Assistant ancré dans le site',
            'ask.title': 'Demander à Yangming',
            'ask.subtitle': 'Assistant léger pour les visiteurs, utile pour l’adéquation, les domaines de focus, les recommandations de blog et le contact.',
            'ask.placeholder': 'Posez une question sur l’expertise, les articles, l’adéquation projet ou le contact.',
            'ask.footnote': 'Cette version intègre directement la connaissance du site dans le frontend et fonctionne donc sur un hébergement statique.',
            'ask.clear': 'Effacer la conversation',
            'ask.close': 'Fermer l’assistant',
            'ask.panel': 'Assistant Ask Yangming',
            'ask.empty': 'Demandez les domaines de focus de Yangming, des articles pertinents ou si un projet semble adapté.',
            'ask.prompt.build': 'Que construisez-vous ?',
            'ask.prompt.posts': 'Quels articles lire pour MLOps et les systèmes LLM ?',
            'ask.prompt.contact': 'Comment vous contacter pour un travail IA ou data ?',
            'about.h1': 'À propos de Yangming Li',
            'about.intro': 'Yangming Li est ingénieur IA et créateur produit, concentré sur les systèmes d’IA appliquée et l’architecture IA de production.',
            'about.focus': 'Domaines de focus',
            'about.focus1': 'Systèmes LLM, copilotes, génération augmentée par recherche et intelligence documentaire.',
            'about.focus2': 'ML statistique, NLP, modélisation thématique et ML digne de confiance.',
            'about.focus3': 'Produits de données, systèmes analytiques et outils d’aide à la décision.',
            'about.focus4': 'MLOps, infrastructure d’expérimentation, A/B testing et livraison en production.',
            'about.start': 'Commencer ici',
            'about.startHtml': 'Explorez la <a href="/projects.html">page projets</a>, l’<a href="/blog/">index du blog</a> ou le <a href="/resume.html">CV</a>.',
            'projects.h1': 'Projets et thèmes de portfolio',
            'projects.intro': 'Thèmes de travail sélectionnés pour des équipes santé, finance et entreprise, centrés sur des systèmes IA de production.',
            'projects.kicker1': 'Systèmes LLM',
            'projects.title1': 'IA appliquée pour les documents et la connaissance',
            'projects.copy1Html': 'Travail autour des copilotes, de la RAG, de la génération de rapports et de l’intégration de systèmes IA.',
            'projects.kicker2': 'Produits de données',
            'projects.title2': 'Produits d’aide à la décision pour équipes complexes',
            'projects.copy2Html': 'Expériences analytiques et produit qui aident les équipes à passer des données brutes à de meilleures décisions.',
            'projects.kicker3': 'Infrastructure d’expérimentation',
            'projects.title3': 'De l’expérimentation à la production',
            'projects.copy3Html': 'Pensée système autour de l’A/B testing, du MLOps, des plateformes data et de la mesure fiable des lancements.',
            'resume.h1': 'Aperçu du CV',
            'resume.intro': 'Yangming Li travaille à l’intersection de l’IA appliquée, de l’architecture des systèmes IA, de la data science, du produit et de l’ingénierie.',
            'resume.focus': 'Focus technique',
            'resume.item1': 'Systèmes IA appliqués, architecture LLM, copilotes, recherche et intelligence documentaire.',
            'resume.item2': 'ML statistique, NLP, modélisation thématique et ML fiable.',
            'resume.item3': 'Ingénierie des données, produits de données, MLOps et infrastructure d’expérimentation.',
            'resume.item4': 'Stratégie produit, systèmes analytiques, outils d’aide à la décision et livraison.',
            'resume.credentials': 'Certifications et apprentissage',
            'resume.credentialsHtml': 'Le site mentionne CFA et FRM et inclut une <a href="/courses.html">page cours et certificats</a>.',
            'resume.writing': 'Articles sélectionnés',
            'resume.writingHtml': 'Pour voir le focus technique, consultez l’<a href="/blog/">index du blog</a>, les <a href="/projects.html">projets</a> et les articles MLOps, MCP et A/B testing.',
            'contact.h1': 'Contacter Yangming Li',
            'contact.intro': 'Pour échanger sur l’IA appliquée, l’architecture IA, les produits data, l’analytique ou une collaboration technique, utilisez les canaux ci-dessous.',
            'contact.links': 'Liens de contact',
            'contact.related': 'Pages liées',
            'contact.relatedHtml': 'Avant de prendre contact, vous pouvez consulter les <a href="/projects.html">projets</a>, le <a href="/resume.html">CV</a> ou les <a href="/blog/">articles techniques</a>.',
            'blog.h1': 'Articles sur l’IA appliquée, la data science, le produit et l’ingénierie',
            'blog.leadHtml': 'Index consultable des notes pratiques de Yangming Li. La rubrique <a href="/ai-engineering/">Ingénierie IA</a> rassemble les articles les plus proches des systèmes IA de production.',
            'blog.ai': 'Ingénierie IA',
            'blog.applied': 'IA appliquée et ML',
            'blog.data': 'Plateformes data et MLOps',
            'blog.product': 'Produit et expérimentation',
            'ai.eyebrow': 'Rubrique dédiée',
            'ai.h1': 'Ingénierie IA',
            'ai.lead': 'Notes pratiques sur la construction de systèmes IA de production : applications LLM, agents, évaluation, recherche, MLOps, déploiement et observabilité.',
            'ai.llm': 'Systèmes LLM et agents',
            'ai.mlops': 'ML de production et MLOps',
            'ai.infrastructure': 'Infrastructure IA',
            'ai.scope': 'Portée éditoriale',
            'ai.scopeNote': 'Cette rubrique traite de la couche d’ingénierie entre les démos IA et les produits fiables.',
            'courses.h1': 'Cours et certificats',
            'courses.subtitle': 'Collection de cours terminés et de certificats en programmation, ML, data science et MLOps.',
            'courses.datacamp': 'Cours DataCamp',
            'courses.coursera': 'Cours Coursera',
            'courses.leetcode': 'Solutions LeetCode (Python)',
            'courses.leetcodeIntro': 'Dépôt de solutions Python pour les problèmes LeetCode Top 150.',
            'courses.leetcodeOutro': 'Exemples de solutions issues de 150+ problèmes LeetCode résolus, avec complexité temps et espace.',
            'courses.viewRepo': 'Voir le dépôt complet de solutions LeetCode',
            'courses.backHomeHtml': '<i class="fa fa-arrow-left"></i> Retour à l’accueil',
            'courses.backHtml': '<i class="fa fa-arrow-left"></i> Retour aux certificats',
            'leetcode.problem': 'Énoncé du problème',
            'leetcode.solution': 'Approche de solution',
            'leetcode.example': 'Exemple :',
            'leetcode.python': 'Implémentation Python :',
            'leetcode.time': 'Complexité temporelle :',
            'leetcode.space': 'Complexité spatiale :',
            'product.movedTitle': 'Index du blog déplacé',
            'product.movedCopyHtml': 'L’index des articles se trouve maintenant sur <a href="/blog/">https://yangmingli.com/blog/</a>.'
        },
        ja: {
            'language.label': '言語',
            'nav.home': 'ホーム',
            'nav.about': '概要',
            'nav.aboutMe': '自己紹介',
            'nav.projects': 'プロジェクト',
            'nav.portfolio': 'ポートフォリオ',
            'nav.blog': 'ブログ',
            'nav.blogIndex': 'ブログ索引',
            'nav.aiEngineering': 'AI エンジニアリング',
            'nav.resume': '履歴書',
            'nav.contact': '連絡先',
            'nav.notes': 'ノート',
            'nav.essays': 'エッセイ',
            'nav.lab': 'ラボ',
            'nav.investing': '投資',
            'nav.aiMl': 'AI/ML',
            'nav.product': 'プロダクト',
            'nav.engineering': 'エンジニアリング',
            'nav.subscribe': 'ニュースレター登録',
            'theme.light': 'ライト',
            'theme.dark': 'ダーク',
            'article.outline': 'クイック目次',
            'home.skip': 'メインコンテンツへ移動',
            'home.hero.titleHtml': '<span class="hero-welcome">こんにちは、Yangming Li です</span>実運用に耐える応用 AI システムと AI アーキテクチャを設計しています。',
            'home.hero.role': 'LLM システム設計、検索、評価、統計的 ML、データエンジニアリング、実験基盤に取り組む AI エンジニア + プロダクトビルダーです。',
            'home.hero.intro': 'AI エンジニアリング、統計的 ML、データエンジニアリング、プロダクト思考の交差点で、チームが実際に出荷できるシステムを設計しています。',
            'home.hero.askHtml': '<i class="fa fa-comments"></i> Yangming AI に聞く',
            'home.proof.title': '信頼、適合性、提供力をすばやく把握',
            'home.proof.copy': 'モデルのデモだけでなく、採用、監査可能性、本番での影響を重視するチーム向けです。',
            'home.utility.title': '補助的な導線はこちら',
            'home.utility.copy': '学習ノート、エッセイ、実験、証明書は重要ですが、ホームページの主役ではありません。',
            'home.utility.note': 'ホームページは協業相手や採用担当者に向けつつ、興味のある訪問者が周辺資料も探索できるようにしています。',
            'home.selectedWriting': '選定記事',
            'home.blogIntroHtml': 'テーマ別に記事を閲覧できます。AI/ML、プロダクト、エンジニアリング、投資は 1 つのブログビューにまとめました。本番 AI システムについては <a href="ai-engineering/">AI エンジニアリング</a> コラムをご覧ください。',
            'home.blog.search': '記事を検索...',
            'home.selectedWork': '選定実績',
            'home.portfolioIntro': '医療、金融、エンタープライズチームに向けた、本番 AI システム中心の代表的な仕事です。',
            'home.investingTitle': '投資',
            'home.investingIntro': '資本配分、市場構造、長期的意思決定についてのノートです。',
            'home.notesTitle': 'ノート',
            'home.notesIntro': '主要な仕事を支える作業メモ、学習資料、参考情報です。',
            'home.essaysTitle': 'エッセイと参考資料',
            'home.essaysIntro': 'ものづくりへの考え方に影響するエッセイ、参考資料、アイデアを置く静かな場所です。',
            'home.labTitle': 'ラボ',
            'home.labIntro': 'インタラクティブな試作や軽い実験のための小さな場所です。',
            'home.contactTitle': '連絡先',
            'ask.eyebrowHtml': '<span class="ask-yangming-launcher-dot"></span> サイト内容ベースのアシスタント',
            'ask.title': 'Yangming に聞く',
            'ask.subtitle': '訪問者向けの軽量アシスタントです。適合性、重点領域、ブログ推薦、連絡方法に向いています。',
            'ask.placeholder': '専門領域、関連記事、プロジェクト適合性、連絡方法について質問できます。',
            'ask.footnote': 'この版はサイト知識をフロントエンドに埋め込んでいるため、静的ホストでも動作します。',
            'ask.clear': '会話を消去',
            'ask.close': 'アシスタントを閉じる',
            'ask.panel': 'Ask Yangming アシスタント',
            'ask.empty': 'Yangming の重点領域、関連ブログ、プロジェクト適合性について質問できます。',
            'ask.prompt.build': '何を作っていますか？',
            'ask.prompt.posts': 'MLOps と LLM システムに関心がある場合、どの記事を読むべきですか？',
            'ask.prompt.contact': 'AI やデータの仕事について連絡するには？',
            'about.h1': 'Yangming Li について',
            'about.intro': 'Yangming Li は、応用 AI システムと本番 AI アーキテクチャに取り組む AI エンジニア兼プロダクトビルダーです。',
            'about.focus': '重点領域',
            'about.focus1': 'LLM システム、Copilot、RAG、ドキュメントインテリジェンス。',
            'about.focus2': '統計的 ML、NLP、トピックモデリング、信頼できる機械学習。',
            'about.focus3': 'データプロダクト、分析システム、意思決定支援ツール。',
            'about.focus4': 'MLOps、実験基盤、A/B テスト、本番提供。',
            'about.start': 'ここから開始',
            'about.startHtml': '<a href="/projects.html">プロジェクト</a>、<a href="/blog/">ブログ索引</a>、または <a href="/resume.html">履歴書</a> をご覧ください。',
            'projects.h1': 'プロジェクトとポートフォリオテーマ',
            'projects.intro': '医療、金融、エンタープライズチーム向けの、本番 AI システムを中心とした選定テーマです。',
            'projects.kicker1': 'LLM システム',
            'projects.title1': '文書・知識システムのための応用 AI',
            'projects.copy1Html': 'Copilot、RAG、レポート生成、AI システム統合に関する仕事です。',
            'projects.kicker2': 'データプロダクト',
            'projects.title2': '複雑なチームのための意思決定支援プロダクト',
            'projects.copy2Html': '運用チームが生データからより良い意思決定へ進むための分析・プロダクト体験です。',
            'projects.kicker3': '実験基盤',
            'projects.title3': '実験から本番提供へ',
            'projects.copy3Html': 'A/B テスト、MLOps、データ基盤、信頼できるリリース計測に関するシステム思考です。',
            'resume.h1': '履歴書概要',
            'resume.intro': 'Yangming Li は応用 AI、AI システムアーキテクチャ、データサイエンス、プロダクト、エンジニアリング実行の交差点で働いています。',
            'resume.focus': '技術フォーカス',
            'resume.item1': '応用 AI システム、LLM アーキテクチャ、Copilot、検索、ドキュメントインテリジェンス。',
            'resume.item2': '統計的機械学習、NLP、トピックモデリング、信頼できる ML。',
            'resume.item3': 'データエンジニアリング、データプロダクト、MLOps、実験基盤。',
            'resume.item4': 'プロダクト戦略、分析システム、意思決定支援、本番提供。',
            'resume.credentials': '資格と学習',
            'resume.credentialsHtml': 'このサイトでは CFA と FRM に触れ、<a href="/courses.html">コースと証明書ページ</a>も掲載しています。',
            'resume.writing': '選定記事',
            'resume.writingHtml': '技術フォーカスを見るには、<a href="/blog/">ブログ索引</a>、<a href="/projects.html">プロジェクト</a>、MLOps、MCP、A/B テストの記事をご覧ください。',
            'contact.h1': 'Yangming Li への連絡',
            'contact.intro': '応用 AI、AI アーキテクチャ、データプロダクト、分析、技術協業については以下の連絡先をご利用ください。',
            'contact.links': '連絡先リンク',
            'contact.related': '関連ページ',
            'contact.relatedHtml': '連絡前に <a href="/projects.html">プロジェクト</a>、<a href="/resume.html">履歴書</a>、<a href="/blog/">技術記事</a>をご確認いただけます。',
            'blog.h1': '応用 AI、データサイエンス、プロダクト、エンジニアリングの記事',
            'blog.leadHtml': 'Yangming Li の実践ノート索引です。<a href="/ai-engineering/">AI エンジニアリング</a> コラムには本番 AI システムに近い記事を集めています。',
            'blog.ai': 'AI エンジニアリング',
            'blog.applied': '応用 AI と ML',
            'blog.data': 'データ基盤と MLOps',
            'blog.product': 'プロダクトと実験',
            'ai.eyebrow': '専用コラム',
            'ai.h1': 'AI エンジニアリング',
            'ai.lead': '本番 AI システムを構築するための実践ノートです。',
            'ai.llm': 'LLM システムとエージェント',
            'ai.mlops': '本番 ML と MLOps',
            'ai.infrastructure': 'AI インフラ',
            'ai.scope': '編集範囲',
            'ai.scopeNote': 'このコラムは、AI デモと信頼できるプロダクトの間にあるエンジニアリング層を扱います。',
            'courses.h1': 'コースと証明書',
            'courses.subtitle': 'プログラミング、機械学習、データサイエンス、MLOps の修了コースと証明書です。',
            'courses.datacamp': 'DataCamp コース',
            'courses.coursera': 'Coursera コース',
            'courses.leetcode': 'LeetCode 解法（Python）',
            'courses.leetcodeIntro': 'LeetCode Top 150 面接問題の Python 解法集です。',
            'courses.leetcodeOutro': '150 問以上の LeetCode 解法からのサンプルです。時間・空間計算量も含みます。',
            'courses.viewRepo': '完全な LeetCode 解法リポジトリを見る',
            'courses.backHomeHtml': '<i class="fa fa-arrow-left"></i> ホームへ戻る',
            'courses.backHtml': '<i class="fa fa-arrow-left"></i> 証明書へ戻る',
            'leetcode.problem': '問題文',
            'leetcode.solution': '解法アプローチ',
            'leetcode.example': '例：',
            'leetcode.python': 'Python 実装：',
            'leetcode.time': '時間計算量：',
            'leetcode.space': '空間計算量：',
            'product.movedTitle': 'ブログ索引は移動しました',
            'product.movedCopyHtml': '記事索引は <a href="/blog/">https://yangmingli.com/blog/</a> にあります。'
        },
        de: {
            'language.label': 'Sprache',
            'nav.home': 'Start',
            'nav.about': 'Über mich',
            'nav.aboutMe': 'Über mich',
            'nav.projects': 'Projekte',
            'nav.portfolio': 'Portfolio',
            'nav.blog': 'Blog',
            'nav.blogIndex': 'Blog-Index',
            'nav.aiEngineering': 'AI Engineering',
            'nav.resume': 'Lebenslauf',
            'nav.contact': 'Kontakt',
            'nav.notes': 'Notizen',
            'nav.essays': 'Essays',
            'nav.lab': 'Labor',
            'nav.investing': 'Investieren',
            'nav.aiMl': 'AI/ML',
            'nav.product': 'Produkt',
            'nav.engineering': 'Engineering',
            'nav.subscribe': 'Newsletter abonnieren',
            'theme.light': 'Hell',
            'theme.dark': 'Dunkel',
            'article.outline': 'Kurzüberblick',
            'home.skip': 'Zum Hauptinhalt springen',
            'home.hero.titleHtml': '<span class="hero-welcome">Willkommen, ich bin Yangming Li</span>Ich entwerfe angewandte AI-Systeme und produktionsreife AI-Architektur.',
            'home.hero.role': 'AI Engineer + Product Builder mit Fokus auf LLM-Systemdesign, Retrieval, Evaluation, statistisches ML, Data Engineering und Experiment-Infrastruktur.',
            'home.hero.intro': 'Ich arbeite an der Schnittstelle von AI Engineering, statistischem ML, Data Engineering und Produktdenken, um Systeme zu bauen, die Teams wirklich ausliefern können.',
            'home.hero.askHtml': '<i class="fa fa-comments"></i> Yangming AI fragen',
            'home.proof.title': 'Schneller Blick auf Vertrauen, Fit und Lieferung',
            'home.proof.copy': 'Für Teams, denen Adoption, Auditierbarkeit und Produktionswirkung wichtiger sind als reine Modelldemos.',
            'home.utility.title': 'Nebenpfade leben hier',
            'home.utility.copy': 'Studiennotizen, Essays, Experimente und Zertifikate bleiben wichtig, führen aber nicht mehr die Startseite an.',
            'home.utility.note': 'So bleibt die Startseite auf Kollaboratoren und Hiring Manager ausgerichtet und neugierige Besucher können weiter erkunden.',
            'home.selectedWriting': 'Ausgewählte Artikel',
            'home.blogIntroHtml': 'Artikel nach Thema durchsuchen. AI/ML, Produkt, Engineering und Investieren liegen jetzt in einer Blog-Ansicht. Für produktionsnahe AI-Systeme besuchen Sie die Rubrik <a href="ai-engineering/">AI Engineering</a>.',
            'home.blog.search': 'Artikel suchen...',
            'home.selectedWork': 'Ausgewählte Arbeiten',
            'home.portfolioIntro': 'Repräsentative Arbeitsthemen für Healthcare-, Finance- und Enterprise-Teams, rund um AI-Systeme jenseits der Demo.',
            'home.investingTitle': 'Investieren',
            'home.investingIntro': 'Notizen zu Kapitalallokation, Marktstruktur und den ruhigeren Teilen langfristiger Entscheidungen.',
            'home.notesTitle': 'Notizen',
            'home.notesIntro': 'Arbeitsnotizen, Lernmaterialien und Referenzen, die die Hauptarbeit unterstützen.',
            'home.essaysTitle': 'Essays & Referenzen',
            'home.essaysIntro': 'Ein ruhigerer Ort für Essays, Referenzen und Ideen, die meine Bauweise prägen.',
            'home.labTitle': 'Labor',
            'home.labIntro': 'Ein kleiner Bereich für interaktive Prototypen und leichte Experimente.',
            'home.contactTitle': 'Kontakt',
            'ask.eyebrowHtml': '<span class="ask-yangming-launcher-dot"></span> Site-basierter Assistent',
            'ask.title': 'Yangming fragen',
            'ask.subtitle': 'Ein leichter Assistent für Besucher: Fit, Fokusbereiche, Blog-Empfehlungen und Kontakt.',
            'ask.placeholder': 'Fragen Sie nach Expertise, passenden Artikeln, Projekt-Fit oder Kontakt.',
            'ask.footnote': 'Diese Version bettet lokales Site-Wissen direkt im Frontend ein und funktioniert daher auch auf statischem Hosting.',
            'ask.clear': 'Konversation löschen',
            'ask.close': 'Assistent schließen',
            'ask.panel': 'Ask-Yangming-Assistent',
            'ask.empty': 'Fragen Sie nach Yangmings Fokusbereichen, relevanten Blogposts oder ob ein Projekt passt.',
            'ask.prompt.build': 'Was bauen Sie?',
            'ask.prompt.posts': 'Welche Artikel sollte ich zu MLOps und LLM-Systemen lesen?',
            'ask.prompt.contact': 'Wie kann ich Sie zu AI- oder Data-Arbeit kontaktieren?',
            'about.h1': 'Über Yangming Li',
            'about.intro': 'Yangming Li ist AI Engineer und Product Builder mit Fokus auf angewandte AI-Systeme und produktionsreife AI-Architektur.',
            'about.focus': 'Fokusbereiche',
            'about.focus1': 'LLM-Systeme, Copilots, RAG und Dokumentenintelligenz.',
            'about.focus2': 'Statistisches ML, NLP, Topic Modeling und vertrauenswürdiges ML.',
            'about.focus3': 'Datenprodukte, Analytics-Systeme und Entscheidungstools.',
            'about.focus4': 'MLOps, Experiment-Infrastruktur, A/B-Testing und Produktion.',
            'about.start': 'Hier starten',
            'about.startHtml': 'Sehen Sie die <a href="/projects.html">Projektseite</a>, den <a href="/blog/">Blog-Index</a> oder den <a href="/resume.html">Lebenslauf</a>.',
            'projects.h1': 'Projekte und Portfolio-Themen',
            'projects.intro': 'Ausgewählte Arbeitsthemen für Healthcare-, Finance- und Enterprise-Teams, fokussiert auf produktionsnahe AI-Systeme.',
            'projects.kicker1': 'LLM-Systeme',
            'projects.title1': 'Angewandte AI für Dokument- und Wissenssysteme',
            'projects.copy1Html': 'Arbeit rund um Copilots, RAG, Berichtsgenerierung und AI-Systemintegration.',
            'projects.kicker2': 'Datenprodukte',
            'projects.title2': 'Entscheidungsprodukte für komplexe Teams',
            'projects.copy2Html': 'Analytics- und Produkterlebnisse, die Teams von Rohdaten zu besseren Entscheidungen bringen.',
            'projects.kicker3': 'Experiment-Infrastruktur',
            'projects.title3': 'Von Experimenten zur Produktion',
            'projects.copy3Html': 'Systemdenken rund um A/B-Testing, MLOps, Datenplattformen und verlässliche Launch-Messung.',
            'resume.h1': 'Lebenslauf-Überblick',
            'resume.intro': 'Yangming Li arbeitet an der Schnittstelle von angewandter AI, AI-Systemarchitektur, Data Science, Produktsystemen und Engineering.',
            'resume.focus': 'Technischer Fokus',
            'resume.item1': 'Angewandte AI-Systeme, LLM-Architektur, Copilots, Retrieval und Dokumentenintelligenz.',
            'resume.item2': 'Statistisches Machine Learning, NLP, Topic Modeling und vertrauenswürdiges ML.',
            'resume.item3': 'Data Engineering, Datenprodukte, MLOps und Experiment-Infrastruktur.',
            'resume.item4': 'Produktstrategie, Analytics-Systeme, Entscheidungstools und Lieferung.',
            'resume.credentials': 'Zertifikate und Lernen',
            'resume.credentialsHtml': 'Die Site verweist auf CFA und FRM und enthält eine <a href="/courses.html">Kurs- und Zertifikatsseite</a>.',
            'resume.writing': 'Ausgewählte Artikel',
            'resume.writingHtml': 'Für technische Evidenz sehen Sie den <a href="/blog/">Blog-Index</a>, <a href="/projects.html">Projekte</a> und Artikel zu MLOps, MCP und A/B-Testing.',
            'contact.h1': 'Yangming Li kontaktieren',
            'contact.intro': 'Für Gespräche über angewandte AI, AI-Architektur, Datenprodukte, Analytics oder technische Zusammenarbeit nutzen Sie die Kanäle unten.',
            'contact.links': 'Kontaktlinks',
            'contact.related': 'Verwandte Seiten',
            'contact.relatedHtml': 'Vor der Kontaktaufnahme können Sie <a href="/projects.html">Projekte</a>, den <a href="/resume.html">Lebenslauf</a> oder <a href="/blog/">technische Artikel</a> ansehen.',
            'blog.h1': 'Artikel über angewandte AI, Data Science, Produkt und Engineering',
            'blog.leadHtml': 'Ein durchsuchbarer Index praktischer Notizen von Yangming Li. Die Rubrik <a href="/ai-engineering/">AI Engineering</a> sammelt die produktionsnahesten Beiträge.',
            'blog.ai': 'AI Engineering',
            'blog.applied': 'Angewandte AI und ML',
            'blog.data': 'Datenplattformen und MLOps',
            'blog.product': 'Produkt und Experimente',
            'ai.eyebrow': 'Eigene Rubrik',
            'ai.h1': 'AI Engineering',
            'ai.lead': 'Praktische Notizen zum Bau produktionsnaher AI-Systeme.',
            'ai.llm': 'LLM-Systeme und Agenten',
            'ai.mlops': 'Produktions-ML und MLOps',
            'ai.infrastructure': 'AI-Infrastruktur',
            'ai.scope': 'Redaktioneller Rahmen',
            'ai.scopeNote': 'Diese Rubrik behandelt die Engineering-Schicht zwischen AI-Demos und verlässlichen Produkten.',
            'courses.h1': 'Kurse und Zertifikate',
            'courses.subtitle': 'Abgeschlossene Kurse und Zertifikate in Programmierung, ML, Data Science und MLOps.',
            'courses.datacamp': 'DataCamp-Kurse',
            'courses.coursera': 'Coursera-Kurse',
            'courses.leetcode': 'LeetCode-Lösungen (Python)',
            'courses.leetcodeIntro': 'Repository mit Python-Lösungen für LeetCode Top 150 Interviewprobleme.',
            'courses.leetcodeOutro': 'Beispiellösungen aus 150+ gelösten LeetCode-Problemen mit Zeit- und Speicherkomplexität.',
            'courses.viewRepo': 'Vollständiges LeetCode-Repository ansehen',
            'courses.backHomeHtml': '<i class="fa fa-arrow-left"></i> Zurück zur Startseite',
            'courses.backHtml': '<i class="fa fa-arrow-left"></i> Zurück zu Zertifikaten',
            'leetcode.problem': 'Problembeschreibung',
            'leetcode.solution': 'Lösungsansatz',
            'leetcode.example': 'Beispiel:',
            'leetcode.python': 'Python-Implementierung:',
            'leetcode.time': 'Zeitkomplexität:',
            'leetcode.space': 'Speicherkomplexität:',
            'product.movedTitle': 'Blog-Index verschoben',
            'product.movedCopyHtml': 'Der Artikelindex befindet sich jetzt unter <a href="/blog/">https://yangmingli.com/blog/</a>.'
        }
    };

    const EXACT_TEXT_KEYS = {
        'Home': 'nav.home',
        'About': 'nav.about',
        'About Me': 'nav.aboutMe',
        'Projects': 'nav.projects',
        'Portfolio': 'nav.portfolio',
        'Blog': 'nav.blog',
        'Blog Index': 'nav.blogIndex',
        'AI Engineering': 'nav.aiEngineering',
        'Resume': 'nav.resume',
        'Contact': 'nav.contact',
        'Notes': 'nav.notes',
        'Essays': 'nav.essays',
        'Lab': 'nav.lab',
        'Investing': 'nav.investing',
        'AI/ML': 'nav.aiMl',
        'Product': 'nav.product',
        'Engineering': 'nav.engineering',
        'Subscribe to Newsletter': 'nav.subscribe',
        'Light': 'theme.light',
        'Dark': 'theme.dark',
        'Quick Outline': 'article.outline',
        'All': 'nav.all',
        'What do you build?': 'ask.prompt.build',
        'Which posts should I read if I care about MLOps and LLM systems?': 'ask.prompt.posts',
        'How can I contact you for AI or data work?': 'ask.prompt.contact',
        'Ask about Yangming\'s focus areas, relevant blog posts, or whether a project is a fit. This version can answer directly from local site knowledge, even on a static host.': 'ask.empty'
    };

    MESSAGES.en['nav.all'] = 'All';
    MESSAGES.zh['nav.all'] = '全部';
    MESSAGES.fr['nav.all'] = 'Tout';
    MESSAGES.ja['nav.all'] = 'すべて';
    MESSAGES.de['nav.all'] = 'Alle';

    const EXACT_SELECTOR = [
        'nav a',
        '.nav-tabs .nav-link',
        '.desktop-menu > li > a',
        '.mobile-menu a',
        '.dropdown-toggle',
        '.mobile-dropdown-toggle',
        '.subscribe-link',
        '.blog-topic-btn',
        '.theme-switch-wrapper > span',
        '.generated-article-toc-kicker',
        '.ask-yangming-launcher span:not(.ask-yangming-launcher-dot)',
        '.ask-yangming-chip',
        '.ask-yangming-empty'
    ].join(',');

    const GLOBAL_RULES = [
        { selector: '.ask-yangming-eyebrow', key: 'ask.eyebrowHtml', html: true },
        { selector: '.ask-yangming-title', key: 'ask.title' },
        { selector: '.ask-yangming-subtitle', key: 'ask.subtitle' },
        { selector: '.ask-yangming-input', key: 'ask.placeholder', attr: 'placeholder' },
        { selector: '.ask-yangming-footnote', key: 'ask.footnote' },
        { selector: '[data-ask-yangming-reset]', key: 'ask.clear', attr: 'aria-label' },
        { selector: '[data-ask-yangming-close]', key: 'ask.close', attr: 'aria-label' },
        { selector: '[data-ask-yangming-panel]', key: 'ask.panel', attr: 'aria-label' }
    ];

    const PAGE_RULES = {
        home: [
            { selector: '.skip-link', key: 'home.skip' },
            { selector: '.header .content h1', key: 'home.hero.titleHtml', html: true },
            { selector: '.typing-line', key: 'home.hero.role', typed: true },
            { selector: '.hero-intro .typing-block', key: 'home.hero.intro', typed: true },
            { selector: '.ask-yangming-hero-trigger', key: 'home.hero.askHtml', html: true },
            { selector: '.proof-header .about-card-title', key: 'home.proof.title' },
            { selector: '.proof-header-copy', key: 'home.proof.copy' },
            { selector: '.about-utility-card .about-card-title', key: 'home.utility.title' },
            { selector: '.about-utility-copy', key: 'home.utility.copy' },
            { selector: '.about-utility-note', key: 'home.utility.note' },
            { selector: '#blog .blog-section-title h2', key: 'home.selectedWriting' },
            { selector: '#blog .blog-intro', key: 'home.blogIntroHtml', html: true },
            { selector: '#blog-search-box', key: 'home.blog.search', attr: 'placeholder' },
            { selector: '#portfolio .section-title h2', key: 'home.selectedWork' },
            { selector: '.portfolio-intro', key: 'home.portfolioIntro' },
            { selector: '#investing .section-title h2', key: 'home.investingTitle' },
            { selector: '#investing .blog-intro', key: 'home.investingIntro' },
            { selector: '#reading .section-title h2', key: 'home.notesTitle' },
            { selector: '#reading .blog-intro', key: 'home.notesIntro' },
            { selector: '#thoughts .section-title h2', key: 'home.essaysTitle' },
            { selector: '#thoughts .blog-intro', key: 'home.essaysIntro' },
            { selector: '#fun .section-title h2', key: 'home.labTitle' },
            { selector: '#fun .section-title + p, #fun .lab-intro', key: 'home.labIntro' },
            { selector: '#contact .section-title h2', key: 'home.contactTitle' }
        ],
        about: [
            { selector: 'main > h1', key: 'about.h1' },
            { selector: 'main > p:first-of-type', key: 'about.intro' },
            { selector: 'main > h2:nth-of-type(1)', key: 'about.focus' },
            { selector: 'main > ul li:nth-child(1)', key: 'about.focus1' },
            { selector: 'main > ul li:nth-child(2)', key: 'about.focus2' },
            { selector: 'main > ul li:nth-child(3)', key: 'about.focus3' },
            { selector: 'main > ul li:nth-child(4)', key: 'about.focus4' },
            { selector: 'main > h2:nth-of-type(2)', key: 'about.start' },
            { selector: 'main > p:last-of-type', key: 'about.startHtml', html: true }
        ],
        projects: [
            { selector: 'main > h1', key: 'projects.h1' },
            { selector: 'main > p', key: 'projects.intro' },
            { selector: '.grid article:nth-child(1) .kicker', key: 'projects.kicker1' },
            { selector: '.grid article:nth-child(1) h2', key: 'projects.title1' },
            { selector: '.grid article:nth-child(1) p', key: 'projects.copy1Html', html: true },
            { selector: '.grid article:nth-child(2) .kicker', key: 'projects.kicker2' },
            { selector: '.grid article:nth-child(2) h2', key: 'projects.title2' },
            { selector: '.grid article:nth-child(2) p', key: 'projects.copy2Html', html: true },
            { selector: '.grid article:nth-child(3) .kicker', key: 'projects.kicker3' },
            { selector: '.grid article:nth-child(3) h2', key: 'projects.title3' },
            { selector: '.grid article:nth-child(3) p', key: 'projects.copy3Html', html: true }
        ],
        resume: [
            { selector: 'main > h1', key: 'resume.h1' },
            { selector: 'main > p:first-of-type', key: 'resume.intro' },
            { selector: 'main > h2:nth-of-type(1)', key: 'resume.focus' },
            { selector: 'main > ul li:nth-child(1)', key: 'resume.item1' },
            { selector: 'main > ul li:nth-child(2)', key: 'resume.item2' },
            { selector: 'main > ul li:nth-child(3)', key: 'resume.item3' },
            { selector: 'main > ul li:nth-child(4)', key: 'resume.item4' },
            { selector: 'main > h2:nth-of-type(2)', key: 'resume.credentials' },
            { selector: 'main > h2:nth-of-type(2) + p', key: 'resume.credentialsHtml', html: true },
            { selector: 'main > h2:nth-of-type(3)', key: 'resume.writing' },
            { selector: 'main > h2:nth-of-type(3) + p', key: 'resume.writingHtml', html: true }
        ],
        contact: [
            { selector: 'main > h1', key: 'contact.h1' },
            { selector: 'main > p:first-of-type', key: 'contact.intro' },
            { selector: 'main > h2:nth-of-type(1)', key: 'contact.links' },
            { selector: 'main > h2:nth-of-type(2)', key: 'contact.related' },
            { selector: 'main > h2:nth-of-type(2) + p', key: 'contact.relatedHtml', html: true }
        ],
        blog: [
            { selector: '.seo-hero h1', key: 'blog.h1' },
            { selector: '.seo-hero .lead', key: 'blog.leadHtml', html: true },
            { selector: 'main > h2:nth-of-type(1)', key: 'blog.ai' },
            { selector: 'main > h2:nth-of-type(2)', key: 'blog.applied' },
            { selector: 'main > h2:nth-of-type(3)', key: 'blog.data' },
            { selector: 'main > h2:nth-of-type(4)', key: 'blog.product' }
        ],
        ai: [
            { selector: '.hero .eyebrow', key: 'ai.eyebrow' },
            { selector: '.hero h1', key: 'ai.h1' },
            { selector: '.hero .lead', key: 'ai.lead' },
            { selector: 'main > h2:nth-of-type(1)', key: 'ai.llm' },
            { selector: 'main > h2:nth-of-type(2)', key: 'ai.mlops' },
            { selector: 'main > h2:nth-of-type(3)', key: 'ai.infrastructure' },
            { selector: 'main > h2:nth-of-type(4)', key: 'ai.scope' },
            { selector: '.note', key: 'ai.scopeNote' }
        ],
        courses: [
            { selector: '.header-section h1', key: 'courses.h1' },
            { selector: '.header-section p', key: 'courses.subtitle' },
            { selector: 'body > .container > .back-button', key: 'courses.backHomeHtml', html: true },
            { selector: 'body > .container > .certificate-section:nth-of-type(1) h2', key: 'courses.datacamp' },
            { selector: 'body > .container > .certificate-section:nth-of-type(2) h2', key: 'courses.coursera' },
            { selector: 'body > .container > .certificate-section:nth-of-type(3) h2', key: 'courses.leetcode' },
            { selector: 'body > .container > .certificate-section:nth-of-type(3) > p:first-of-type', key: 'courses.leetcodeIntro' },
            { selector: 'body > .container > .certificate-section:nth-of-type(3) > p:nth-last-of-type(2)', key: 'courses.leetcodeOutro' },
            { selector: 'body > .container > .certificate-section:nth-of-type(3) .btn-primary', key: 'courses.viewRepo' }
        ],
        leetcode: [
            { selector: '.back-button', key: 'courses.backHtml', html: true },
            { selector: '.solution-section:nth-of-type(1) h2', key: 'leetcode.problem' },
            { selector: '.solution-section:nth-of-type(2) h2', key: 'leetcode.solution' },
            { selector: '.example h3', key: 'leetcode.example' },
            { selector: '.solution-section h3:last-of-type', key: 'leetcode.python' }
        ],
        productMoved: [
            { selector: 'main h1', key: 'product.movedTitle' },
            { selector: 'main p', key: 'product.movedCopyHtml', html: true }
        ]
    };

    const ROUTE_META = {
        about: { title: 'about.h1' },
        projects: { title: 'projects.h1' },
        resume: { title: 'resume.h1' },
        contact: { title: 'contact.h1' },
        blog: { title: 'nav.blog' },
        ai: { title: 'ai.h1' },
        courses: { title: 'courses.h1' }
    };

    let currentLanguage = DEFAULT_LANGUAGE;
    let isApplying = false;
    let observerStarted = false;

    function message(key, lang) {
        const language = LANGUAGES[lang] ? lang : DEFAULT_LANGUAGE;
        return (MESSAGES[language] && MESSAGES[language][key]) || MESSAGES.en[key] || '';
    }

    function normalizeText(text) {
        return String(text || '').replace(/\s+/g, ' ').trim();
    }

    function getRouteKey() {
        const path = window.location.pathname.replace(/\\/g, '/').toLowerCase();
        if (path === '/' || path.endsWith('/index.html')) {
            if (path.includes('/blog/')) return 'blog';
            if (path.includes('/ai-engineering/')) return 'ai';
            if (path.includes('/product/')) return 'productMoved';
            return 'home';
        }
        if (path.endsWith('/about.html')) return 'about';
        if (path.endsWith('/projects.html')) return 'projects';
        if (path.endsWith('/resume.html')) return 'resume';
        if (path.endsWith('/contact.html')) return 'contact';
        if (path.endsWith('/courses.html')) return 'courses';
        if (path.includes('/leetcode-solutions/')) return 'leetcode';
        if (path.includes('/blog/')) return 'blog';
        if (path.includes('/ai-engineering/')) return 'ai';
        if (path.includes('/product/')) return 'productMoved';
        return null;
    }

    function getStoredLanguage() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (LANGUAGES[saved]) {
                return saved;
            }
        } catch (error) {
            return null;
        }
        return null;
    }

    function getBrowserLanguage() {
        const source = (navigator.languages && navigator.languages[0]) || navigator.language || '';
        const lower = source.toLowerCase();
        if (lower.startsWith('zh')) return 'zh';
        if (lower.startsWith('fr')) return 'fr';
        if (lower.startsWith('ja')) return 'ja';
        if (lower.startsWith('de')) return 'de';
        return DEFAULT_LANGUAGE;
    }

    function getInitialLanguage() {
        return getStoredLanguage() || getBrowserLanguage();
    }

    function saveLanguage(lang) {
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (error) {
            return;
        }
    }

    function injectStyles() {
        if (document.getElementById('site-language-switcher-style')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'site-language-switcher-style';
        style.textContent = `
            .site-language-switcher {
                position: fixed;
                right: 24px;
                bottom: 24px;
                z-index: 1300;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 8px 10px;
                border: 1px solid rgba(15, 23, 42, 0.14);
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.94);
                box-shadow: 0 12px 32px rgba(15, 23, 42, 0.16);
                color: #172033;
                font: 700 13px/1.2 Hind, Arial, sans-serif;
                backdrop-filter: blur(14px);
            }
            .site-language-switcher label {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                margin: 0;
            }
            .site-language-switcher select {
                min-width: 112px;
                border: 1px solid rgba(15, 23, 42, 0.18);
                border-radius: 7px;
                background: #ffffff;
                color: #172033;
                padding: 6px 28px 6px 8px;
                font: 700 13px/1.2 Hind, Arial, sans-serif;
            }
            .site-language-switcher.site-language-cta {
                position: static;
                right: auto;
                bottom: auto;
                z-index: auto;
                padding: 6px 12px;
                background: #ffffff;
                box-shadow: none;
                backdrop-filter: none;
                color: #333333;
                font: inherit;
            }
            .site-language-switcher.site-language-cta label {
                cursor: pointer;
                gap: 7px;
            }
            .site-language-switcher-icon {
                flex-shrink: 0;
            }
            .site-language-switcher.site-language-cta select {
                min-width: auto;
                width: auto;
                max-width: 112px;
                border: 0;
                background: transparent;
                color: inherit;
                padding: 0 2px;
                font: inherit;
                font-weight: 700;
                cursor: pointer;
                box-shadow: none;
                outline: none;
            }
            .site-language-switcher.site-language-cta .site-language-switcher-label {
                position: absolute;
                width: 1px;
                height: 1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
            }
            body.dark-mode .site-language-switcher {
                border-color: rgba(255, 255, 255, 0.18);
                background: rgba(28, 28, 30, 0.94);
                color: #f5f5f5;
            }
            body.dark-mode .site-language-switcher select {
                border-color: rgba(255, 255, 255, 0.22);
                background: #252525;
                color: #f5f5f5;
            }
            body.dark-mode .site-language-switcher.site-language-cta {
                border-color: #cccccc;
                background: #ffffff;
                color: #333333;
            }
            body.dark-mode .site-language-switcher.site-language-cta select {
                border-color: transparent;
                background: transparent;
                color: inherit;
            }
            @media (max-width: 768px) {
                .site-language-switcher {
                    right: 14px;
                    bottom: 14px;
                    padding: 7px 8px;
                }
                .site-language-switcher-label {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    white-space: nowrap;
                }
                .site-language-switcher select {
                    min-width: 96px;
                }
                .site-language-switcher.site-language-cta {
                    padding: 6px 10px;
                }
                .site-language-switcher.site-language-cta select {
                    min-width: auto;
                    max-width: 92px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function placeSwitcherInHeroCta(switcher) {
        if (getRouteKey() !== 'home' || !switcher) {
            return false;
        }

        const heroCta = document.querySelector('.hero-cta');
        if (!heroCta) {
            return false;
        }

        const askButton = heroCta.querySelector('[data-ask-yangming-open]');
        switcher.classList.add('btn', 'btn-default', 'site-language-cta');

        if (askButton && askButton.nextSibling !== switcher) {
            askButton.after(switcher);
        } else if (!askButton && switcher.parentElement !== heroCta) {
            heroCta.appendChild(switcher);
        }

        return true;
    }

    function ensureSwitcher(lang) {
        injectStyles();

        const existingSwitcher = document.querySelector('[data-site-language-switcher]');
        if (existingSwitcher) {
            placeSwitcherInHeroCta(existingSwitcher);
            return;
        }

        const switcher = document.createElement('div');
        switcher.className = 'site-language-switcher';
        switcher.setAttribute('data-site-language-switcher', '');
        switcher.innerHTML = `
            <label>
                <i class="fa fa-globe site-language-switcher-icon" aria-hidden="true"></i>
                <span class="site-language-switcher-label"></span>
                <select aria-label=""></select>
            </label>
        `;

        const select = switcher.querySelector('select');
        Object.keys(LANGUAGES).forEach((code) => {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = LANGUAGES[code].label;
            select.appendChild(option);
        });

        select.value = lang;
        select.addEventListener('change', function () {
            setLanguage(this.value);
        });

        document.body.appendChild(switcher);
        placeSwitcherInHeroCta(switcher);
    }

    function setElementText(element, key, lang) {
        const value = message(key, lang);
        if (!value) return;
        element.dataset.i18nKey = key;
        element.textContent = value;
    }

    function setElementHtml(element, key, lang) {
        const value = message(key, lang);
        if (!value) return;
        element.dataset.i18nKey = key;
        element.innerHTML = value;
    }

    function setElementAttr(element, attr, key, lang) {
        const value = message(key, lang);
        if (!value) return;
        element.dataset[`i18nAttr${attr.replace(/[^a-z0-9]/gi, '')}`] = key;
        element.setAttribute(attr, value);
    }

    function setTypedText(element, key, lang) {
        const value = message(key, lang);
        if (!value) return;
        element.dataset.i18nKey = key;
        element.dataset.typedText = value;
        element.setAttribute('aria-label', value);
        element.textContent = value;
    }

    function applyRule(rule, lang) {
        document.querySelectorAll(rule.selector).forEach((element) => {
            if (rule.attr) {
                setElementAttr(element, rule.attr, rule.key, lang);
            } else if (rule.typed) {
                setTypedText(element, rule.key, lang);
            } else if (rule.html) {
                setElementHtml(element, rule.key, lang);
            } else {
                setElementText(element, rule.key, lang);
            }
        });
    }

    function applyRules(lang) {
        GLOBAL_RULES.forEach((rule) => applyRule(rule, lang));

        const route = getRouteKey();
        if (route && PAGE_RULES[route]) {
            PAGE_RULES[route].forEach((rule) => applyRule(rule, lang));
        }

        if (route && ROUTE_META[route]) {
            const title = message(ROUTE_META[route].title, lang);
            if (title) {
                document.title = title + ' | Yangming Li';
            }
        }
    }

    function applyExactBindings(lang) {
        document.querySelectorAll(EXACT_SELECTOR).forEach((element) => {
            let key = element.dataset.i18nExactKey;
            if (!key) {
                key = EXACT_TEXT_KEYS[normalizeText(element.textContent)];
                if (key) {
                    element.dataset.i18nExactKey = key;
                }
            }
            if (key) {
                setElementText(element, key, lang);
            }
        });
    }

    function formatSections(lang, count) {
        if (lang === 'zh') return `${count} 个章节`;
        if (lang === 'fr') return `${count} section${count > 1 ? 's' : ''}`;
        if (lang === 'ja') return `${count} セクション`;
        if (lang === 'de') return `${count} Abschnitt${count === 1 ? '' : 'e'}`;
        return `${count} ${count === 1 ? 'section' : 'sections'}`;
    }

    function applyGeneratedCounts(lang) {
        document.querySelectorAll('.generated-article-toc-count').forEach((element) => {
            const found = element.dataset.i18nCount || (element.textContent.match(/\d+/) || [])[0];
            if (!found) return;
            element.dataset.i18nCount = found;
            element.textContent = formatSections(lang, Number(found));
        });
    }

    function applySwitcherLabels(lang) {
        const label = document.querySelector('.site-language-switcher-label');
        const select = document.querySelector('.site-language-switcher select');
        const text = message('language.label', lang);
        if (label) {
            label.textContent = text;
        }
        if (select) {
            select.value = lang;
            select.setAttribute('aria-label', text);
        }
    }

    function applyDynamicBindings(lang) {
        applyExactBindings(lang);
        applyGeneratedCounts(lang);
        applySwitcherLabels(lang);
    }

    function applyTranslations(lang, options) {
        const language = LANGUAGES[lang] ? lang : DEFAULT_LANGUAGE;
        currentLanguage = language;
        isApplying = true;
        document.documentElement.lang = LANGUAGES[language].htmlLang;
        if (!options || options.full !== false) {
            ensureSwitcher(language);
            applyRules(language);
        }
        applyDynamicBindings(language);
        isApplying = false;
    }

    function setLanguage(lang) {
        const language = LANGUAGES[lang] ? lang : DEFAULT_LANGUAGE;
        saveLanguage(language);
        applyTranslations(language);
        document.dispatchEvent(new CustomEvent('yangming:languagechange', {
            detail: { language }
        }));
    }

    function startObserver() {
        if (observerStarted || !document.body || !('MutationObserver' in window)) {
            return;
        }
        observerStarted = true;
        let queued = false;
        const observer = new MutationObserver(function () {
            if (isApplying || queued) {
                return;
            }
            queued = true;
            requestAnimationFrame(function () {
                queued = false;
                applyTranslations(currentLanguage, { full: false });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function init() {
        const lang = getInitialLanguage();
        applyTranslations(lang);
        startObserver();
    }

    window.YangmingI18n = {
        apply: function () {
            applyTranslations(currentLanguage || getInitialLanguage());
        },
        setLanguage,
        getLanguage: function () {
            return currentLanguage;
        },
        message: function (key) {
            return message(key, currentLanguage);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
