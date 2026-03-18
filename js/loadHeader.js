function getSitePrefix() {
    const path = window.location.pathname.replace(/\\/g, '/');
    const nestedSections = ['/engineering/', '/leetcode-solutions/', '/product/'];
    return nestedSections.some(section => path.includes(section)) ? '../' : '';
}

function slugifyHeading(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/&/g, 'and')
        .replace(/['"`]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'section';
}

function inferArticleSection() {
    const metaSection = document.querySelector('meta[property="article:section"]');
    if (metaSection && metaSection.content) {
        return metaSection.content.trim();
    }

    const path = window.location.pathname.toLowerCase();
    if (path.includes('/engineering/')) {
        return 'Engineering';
    }
    if (path.includes('/product/')) {
        return 'Product';
    }
    if (path.includes('taste-in-science') || path.includes('thought')) {
        return 'Thoughts';
    }
    if (path.includes('jira') || path.includes('building-product') || path.includes('product-success')) {
        return 'Product';
    }
    if (path.includes('mit-') || path.includes('cmu-') || path.includes('course')) {
        return 'Learning';
    }
    return 'AI/ML';
}

function buildGeneratedOutline(articleBody) {
    if (
        !articleBody ||
        articleBody.querySelector('.toc-container, .generated-article-toc') ||
        articleBody.closest('.solution-section')
    ) {
        return;
    }

    const seenIds = new Set();
    Array.from(document.querySelectorAll('[id]')).forEach(element => seenIds.add(element.id));

    const headings = Array.from(articleBody.querySelectorAll('h2, h3')).filter(heading => {
        const text = heading.textContent.trim();
        return text && !heading.closest('.comments-section') && !heading.closest('.related-posts');
    });

    if (headings.length < 3) {
        return;
    }

    headings.forEach((heading, index) => {
        if (!heading.id) {
            let candidate = slugifyHeading(heading.textContent);
            if (seenIds.has(candidate)) {
                candidate = `${candidate}-${index + 1}`;
            }
            seenIds.add(candidate);
            heading.id = candidate;
        }
    });

    const outline = document.createElement('div');
    outline.className = 'generated-article-toc';
    outline.innerHTML = `
        <div class="generated-article-toc-header">
            <span class="generated-article-toc-kicker">Quick Outline</span>
            <span class="generated-article-toc-count">${headings.length} sections</span>
        </div>
        <ul class="generated-article-toc-list"></ul>
    `;

    const list = outline.querySelector('.generated-article-toc-list');
    const linkMap = new Map();

    headings.forEach(heading => {
        const item = document.createElement('li');
        item.className = `toc-depth-${heading.tagName.toLowerCase() === 'h3' ? '3' : '2'}`;

        const link = document.createElement('a');
        link.href = `#${heading.id}`;
        link.textContent = heading.textContent.trim();

        item.appendChild(link);
        list.appendChild(item);
        linkMap.set(heading.id, link);
    });

    articleBody.insertBefore(outline, articleBody.firstChild);

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const relatedLink = linkMap.get(entry.target.id);
            if (!relatedLink || !entry.isIntersecting) {
                return;
            }

            linkMap.forEach(link => link.classList.remove('is-active'));
            relatedLink.classList.add('is-active');
        });
    }, {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0.15
    });

    headings.forEach(heading => observer.observe(heading));
}

function initArticleProgress(articleBody) {
    if (!articleBody || document.querySelector('.article-progress-bar')) {
        return;
    }

    const progressBar = document.createElement('div');
    progressBar.className = 'article-progress-bar';
    progressBar.innerHTML = '<span></span>';
    document.body.appendChild(progressBar);

    const progressFill = progressBar.querySelector('span');

    const updateProgress = () => {
        const articleTop = articleBody.getBoundingClientRect().top + window.scrollY;
        const articleHeight = Math.max(articleBody.offsetHeight - window.innerHeight * 0.6, 1);
        const progress = Math.min(Math.max((window.scrollY - articleTop) / articleHeight, 0), 1);
        progressFill.style.transform = `scaleX(${progress})`;
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
}

function enhanceArticlePage() {
    const articleRoot =
        document.querySelector('.main-content .container') ||
        document.querySelector('body > .container.mt-5') ||
        document.querySelector('body > .blog-container');

    if (!articleRoot) {
        return;
    }

    const headerHost =
        articleRoot.querySelector('.header .content') ||
        articleRoot.querySelector('.blog-header') ||
        articleRoot.querySelector('.header-section .container');

    const title =
        articleRoot.querySelector('.header .content h1') ||
        articleRoot.querySelector('.blog-header h1') ||
        articleRoot.querySelector('.header-section h1') ||
        articleRoot.querySelector('.blog-title');

    const articleBody =
        articleRoot.querySelector('main') ||
        articleRoot.querySelector('.blog-content');

    if (!headerHost || !title || !articleBody) {
        return;
    }

    document.body.classList.add('blog-post-page');
    if (!document.querySelector('.main-content')) {
        document.body.classList.add('blog-post-no-main-content');
    }

    articleRoot.classList.add('article-page-container');
    articleBody.classList.add('article-prose-surface');

    const hero = title.closest('.header, .blog-header, .header-section') || headerHost;
    hero.classList.add('article-hero');

    const themeSwitch = articleRoot.querySelector('.theme-switch-wrapper');
    const metadata = articleRoot.querySelector('.article-metadata, .blog-meta');
    const shareButtons = articleRoot.querySelector('.blog-share-buttons, .share-buttons');

    if (themeSwitch) {
        themeSwitch.classList.add('article-theme-surface');
    }
    if (metadata) {
        metadata.classList.add('article-meta-surface');
    }
    if (shareButtons) {
        shareButtons.classList.add('article-share-surface');
    }

    if (!headerHost.querySelector('.article-kicker-row')) {
        const kickerRow = document.createElement('div');
        kickerRow.className = 'article-kicker-row';

        const sectionPill = document.createElement('span');
        sectionPill.className = 'article-kicker';
        sectionPill.textContent = inferArticleSection();
        kickerRow.appendChild(sectionPill);

        const readTime = articleRoot.querySelector('.article-metadata .read-time');
        if (readTime) {
            const readPill = document.createElement('span');
            readPill.className = 'article-kicker article-kicker-muted';
            readPill.textContent = readTime.textContent.trim();
            kickerRow.appendChild(readPill);
        }

        headerHost.insertBefore(kickerRow, title);
    }

    buildGeneratedOutline(articleBody);
    initArticleProgress(articleBody);
}

document.addEventListener('DOMContentLoaded', function() {
    const sitePrefix = getSitePrefix();
    const link = (path) => `${sitePrefix}${path}`;

    const nav = document.createElement('nav');
    nav.className = 'nav-menu';
    nav.innerHTML = `
        <div class="nav-container">
            <div class="hamburger-menu">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <a href="${link('index.html')}" class="logo-link">Yangming Li</a>
            <ul class="desktop-menu">
                <li><a href="${link('index.html')}">Home</a></li>
                <li class="dropdown">
                    <a href="#" class="dropdown-toggle">AI/ML</a>
                    <ul class="dropdown-menu">
                        <li><a href="${link('trust-worth-machine-learning-1.html')}">Trustworthy Machine Learning</a></li>
                        <li><a href="${link('ray_explanation.html')}">Ray Framework</a></li>
                        <li><a href="${link('sentiment-analysis-fine-tune-with-bert.html')}">BERT Fine-tuning</a></li>
                        <li><a href="${link('decoder-only-architectures.html')}">Decoder Architectures in LLMs</a></li>
                        <li><a href="${link('mlops-essential-skills.html')}">MLOps Essential Skills</a></li>
                        <li><a href="${link('docker-in-ml.html')}">Docker for ML</a></li>
                        <li><a href="${link('random-forest-guide.html')}">Random Forest Guide</a></li>
                        <li><a href="${link('llama-report-guide.html')}">LlamaReport AI Agent</a></li>
                        <li><a href="${link('n8n-ai-workflows.html')}">n8n AI Workflows</a></li>
                        <li><a href="${link('uqlm-teaching-guide.html')}">LLM Uncertainty Quantification</a></li>
                    </ul>
                </li>
                <li class="dropdown">
                    <a href="#" class="dropdown-toggle">Product</a>
                    <ul class="dropdown-menu">
                        <li><a href="${link('product-success-essence.html')}">Product Success Essence</a></li>
                        <li><a href="${link('building-product-scales-company.html')}">Building Products That Scale</a></li>
                        <li><a href="${link('jira-guide.html')}">Jira for Product Teams</a></li>
                        <li><a href="${link('building-high-impact-value-propositions.html')}">Value Propositions</a></li>
                    </ul>
                </li>
                <li class="dropdown">
                    <a href="#" class="dropdown-toggle">Engineering</a>
                    <ul class="dropdown-menu">
                        <li><a href="${link('key-statistical-tests-survey-analysis.html')}">Statistical Tests</a></li>
                        <li><a href="${link('databricks-comprehensive-guide.html')}">Databricks Guide</a></li>
                        <li><a href="${link('kubernetes-guide.html')}">Kubernetes Guide</a></li>
                        <li><a href="${link('polars-guide.html')}">Polars Guide</a></li>
                        <li><a href="${link('jax-guide.html')}">JAX Guide</a></li>
                        <li><a href="${link('glm-overview.html')}">GLM Overview</a></li>
                    </ul>
                </li>
                <li><a href="mailto:yangmingml@yahoo.com" class="contact-link">Contact</a></li>
            </ul>
            <div class="mobile-menu">
                <div class="mobile-menu-header">
                    <span class="close-menu">&times;</span>
                </div>
                <ul>
                    <li><a href="${link('index.html')}">Home</a></li>
                    <li class="mobile-dropdown">
                        <a href="#" class="mobile-dropdown-toggle">AI/ML</a>
                        <ul class="mobile-dropdown-menu">
                            <li><a href="${link('trust-worth-machine-learning-1.html')}">Trustworthy Machine Learning</a></li>
                            <li><a href="${link('ray_explanation.html')}">Ray Framework</a></li>
                            <li><a href="${link('sentiment-analysis-fine-tune-with-bert.html')}">BERT Fine-tuning</a></li>
                            <li><a href="${link('decoder-only-architectures.html')}">Decoder Architectures in LLMs</a></li>
                            <li><a href="${link('mlops-essential-skills.html')}">MLOps Essential Skills</a></li>
                            <li><a href="${link('docker-in-ml.html')}">Docker for ML</a></li>
                            <li><a href="${link('random-forest-guide.html')}">Random Forest Guide</a></li>
                            <li><a href="${link('llama-report-guide.html')}">LlamaReport AI Agent</a></li>
                            <li><a href="${link('n8n-ai-workflows.html')}">n8n AI Workflows</a></li>
                            <li><a href="${link('uqlm-teaching-guide.html')}">LLM Uncertainty Quantification</a></li>
                        </ul>
                    </li>
                    <li class="mobile-dropdown">
                        <a href="#" class="mobile-dropdown-toggle">Product</a>
                        <ul class="mobile-dropdown-menu">
                            <li><a href="${link('product-success-essence.html')}">Product Success Essence</a></li>
                            <li><a href="${link('building-product-scales-company.html')}">Building Products That Scale</a></li>
                            <li><a href="${link('jira-guide.html')}">Jira for Product Teams</a></li>
                            <li><a href="${link('building-high-impact-value-propositions.html')}">Value Propositions</a></li>
                        </ul>
                    </li>
                    <li class="mobile-dropdown">
                        <a href="#" class="mobile-dropdown-toggle">Engineering</a>
                        <ul class="mobile-dropdown-menu">
                            <li><a href="${link('key-statistical-tests-survey-analysis.html')}">Statistical Tests</a></li>
                            <li><a href="${link('databricks-comprehensive-guide.html')}">Databricks Guide</a></li>
                            <li><a href="${link('kubernetes-guide.html')}">Kubernetes Guide</a></li>
                            <li><a href="${link('polars-guide.html')}">Polars Guide</a></li>
                            <li><a href="${link('jax-guide.html')}">JAX Guide</a></li>
                            <li><a href="${link('glm-overview.html')}">GLM Overview</a></li>
                        </ul>
                    </li>
                    <li><a href="mailto:yangmingml@yahoo.com" class="contact-link">Contact</a></li>
                    <li><a href="#" class="subscribe-link">Subscribe to Newsletter</a></li>
                </ul>
            </div>
        </div>
    `;
    document.body.insertBefore(nav, document.body.firstChild);

    const mobileStyle = document.createElement('style');
    mobileStyle.textContent = `
        .nav-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 20px;
        }
        .hamburger-menu {
            display: none;
            flex-direction: column;
            justify-content: space-between;
            width: 30px;
            height: 22px;
            cursor: pointer;
            z-index: 1000;
        }
        .hamburger-menu span {
            display: block;
            height: 3px;
            width: 100%;
            background-color: #333;
            transition: all 0.3s ease;
        }
        body.dark-mode .hamburger-menu span {
            background-color: #f5f5f5;
        }
        .mobile-menu {
            display: none;
            position: fixed;
            top: 0;
            left: -100%;
            width: 80%;
            height: 100%;
            background-color: #fff;
            box-shadow: 4px 0 10px rgba(0,0,0,0.1);
            z-index: 1000;
            transition: left 0.3s ease;
            overflow-y: auto;
        }
        body.dark-mode .mobile-menu {
            background-color: #252525;
        }
        .mobile-menu.active {
            left: 0;
        }
        .mobile-menu-header {
            display: flex;
            justify-content: flex-end;
            padding: 20px;
        }
        .close-menu {
            font-size: 30px;
            cursor: pointer;
        }
        .mobile-menu ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .mobile-menu li {
            border-bottom: 1px solid #eee;
        }
        body.dark-mode .mobile-menu li {
            border-bottom: 1px solid #333;
        }
        .mobile-menu a {
            display: block;
            padding: 15px 20px;
            color: #333;
            text-decoration: none;
        }
        body.dark-mode .mobile-menu a {
            color: #f5f5f5;
        }
        .mobile-dropdown-menu {
            display: none;
            padding-left: 20px;
            background-color: #f9f9f9;
        }
        body.dark-mode .mobile-dropdown-menu {
            background-color: #2a2a2a;
        }
        .mobile-dropdown-menu.show {
            display: block;
        }
        .subscribe-link {
            background-color: #f1780e;
            color: white !important;
            text-align: center;
            margin: 20px;
            border-radius: 4px;
        }

        @media (max-width: 768px) {
            .desktop-menu {
                display: none;
            }
            .hamburger-menu {
                display: flex;
            }
        }
    `;
    document.head.appendChild(mobileStyle);

    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('show');
    });

    const dropdowns = document.querySelectorAll('.dropdown-toggle');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const menu = this.nextElementSibling;
            document.querySelectorAll('.dropdown-menu').forEach(item => {
                if (item !== menu) {
                    item.classList.remove('show');
                }
            });
            menu.classList.toggle('show');
        });
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });

    const hamburger = document.querySelector('.hamburger-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeMenu = document.querySelector('.close-menu');

    hamburger.addEventListener('click', function() {
        mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    closeMenu.addEventListener('click', function() {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    });

    const mobileDropdowns = document.querySelectorAll('.mobile-dropdown-toggle');
    mobileDropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const menu = this.nextElementSibling;
            menu.classList.toggle('show');
        });
    });

    mobileMenu.querySelectorAll('a').forEach(linkElement => {
        linkElement.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    enhanceArticlePage();
});
