document.addEventListener('DOMContentLoaded', function() {
    const nav = document.createElement('nav');
    nav.className = 'nav-menu';
    nav.innerHTML = `
        <div class="nav-container">
            <div class="hamburger-menu">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <a href="index.html" class="logo-link">Yangming Li</a>
            <ul class="desktop-menu">
                <li><a href="index.html">Home</a></li>
                <li class="dropdown">
                    <a href="#" class="dropdown-toggle">AI/ML</a>
                    <ul class="dropdown-menu">
                        <li><a href="trust-worth-machine-learning-1.html">Trustworthy Machine Learning</a></li>
                        <li><a href="ray_explanation.html">Ray Framework</a></li>
                        <li><a href="sentiment-analysis-fine-tune-with-bert.html">BERT Fine-tuning</a></li>
                        <li><a href="decoder-only-architectures.html">Decoder Architectures in LLMs</a></li>
                        <li><a href="mlops-essential-skills.html">MLOps Essential Skills</a></li>
                        <li><a href="docker-in-ml.html">Docker for ML</a></li>
                        <li><a href="random-forest-guide.html">Random Forest Guide</a></li>
                        <li><a href="llama-report-guide.html">LlamaReport AI Agent</a></li>
                        <li><a href="n8n-ai-workflows.html">n8n AI Workflows</a></li>
                        <li><a href="uqlm-teaching-guide.html">LLM Uncertainty Quantification</a></li>
                    </ul>
                </li>
                <li class="dropdown">
                    <a href="#" class="dropdown-toggle">Product</a>
                    <ul class="dropdown-menu">
                        <li><a href="product-success-essence.html">Product Success Essence</a></li>
                        <li><a href="building-product-scales-company.html">Building Products That Scale</a></li>
                        <li><a href="jira-guide.html">Jira for Product Teams</a></li>
                        <li><a href="building-high-impact-value-propositions.html">Value Propositions</a></li>
                    </ul>
                </li>
                <li class="dropdown">
                    <a href="#" class="dropdown-toggle">Engineering</a>
                    <ul class="dropdown-menu">
                        <li><a href="key-statistical-tests-survey-analysis.html">Statistical Tests</a></li>
                        <li><a href="databricks-comprehensive-guide.html">Databricks Guide</a></li>
                        <li><a href="kubernetes-guide.html">Kubernetes Guide</a></li>
                        <li><a href="polars-guide.html">Polars Guide</a></li>
                        <li><a href="jax-guide.html">JAX Guide</a></li>
                        <li><a href="glm-overview.html">GLM Overview</a></li>
                    </ul>
                </li>
                <li><a href="mailto:yangmingml@yahoo.com" class="contact-link">Contact</a></li>
            </ul>
            <div class="mobile-menu">
                <div class="mobile-menu-header">
                    <span class="close-menu">×</span>
                </div>
                <ul>
                    <li><a href="index.html">Home</a></li>
                    <li class="mobile-dropdown">
                        <a href="#" class="mobile-dropdown-toggle">AI/ML</a>
                        <ul class="mobile-dropdown-menu">
                            <li><a href="trust-worth-machine-learning-1.html">Trustworthy Machine Learning</a></li>
                            <li><a href="ray_explanation.html">Ray Framework</a></li>
                            <li><a href="sentiment-analysis-fine-tune-with-bert.html">BERT Fine-tuning</a></li>
                            <li><a href="decoder-only-architectures.html">Decoder Architectures in LLMs</a></li>
                            <li><a href="mlops-essential-skills.html">MLOps Essential Skills</a></li>
                            <li><a href="docker-in-ml.html">Docker for ML</a></li>
                            <li><a href="random-forest-guide.html">Random Forest Guide</a></li>
                            <li><a href="llama-report-guide.html">LlamaReport AI Agent</a></li>
                            <li><a href="n8n-ai-workflows.html">n8n AI Workflows</a></li>
                            <li><a href="uqlm-teaching-guide.html">LLM Uncertainty Quantification</a></li>
                        </ul>
                    </li>
                    <li class="mobile-dropdown">
                        <a href="#" class="mobile-dropdown-toggle">Product</a>
                        <ul class="mobile-dropdown-menu">
                            <li><a href="product-success-essence.html">Product Success Essence</a></li>
                            <li><a href="building-product-scales-company.html">Building Products That Scale</a></li>
                            <li><a href="jira-guide.html">Jira for Product Teams</a></li>
                            <li><a href="building-high-impact-value-propositions.html">Value Propositions</a></li>
                        </ul>
                    </li>
                    <li class="mobile-dropdown">
                        <a href="#" class="mobile-dropdown-toggle">Engineering</a>
                        <ul class="mobile-dropdown-menu">
                            <li><a href="key-statistical-tests-survey-analysis.html">Statistical Tests</a></li>
                            <li><a href="databricks-comprehensive-guide.html">Databricks Guide</a></li>
                            <li><a href="kubernetes-guide.html">Kubernetes Guide</a></li>
                            <li><a href="polars-guide.html">Polars Guide</a></li>
                            <li><a href="jax-guide.html">JAX Guide</a></li>
                            <li><a href="glm-overview.html">GLM Overview</a></li>
                        </ul>
                    </li>
                    <li><a href="mailto:yangmingml@yahoo.com" class="contact-link">Contact</a></li>
                    <li><a href="#" class="subscribe-link">Subscribe to Newsletter</a></li>
                </ul>
            </div>
        </div>
    `;
    document.body.insertBefore(nav, document.body.firstChild);

    // Add CSS for mobile menu
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

    // Make sure all dropdowns are closed initially
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('show');
    });

    // Add click event listeners to dropdown toggles
    const dropdowns = document.querySelectorAll('.dropdown-toggle');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const menu = this.nextElementSibling;
            // Close all other dropdowns
            document.querySelectorAll('.dropdown-menu').forEach(item => {
                if (item !== menu) item.classList.remove('show');
            });
            // Toggle current dropdown
            menu.classList.toggle('show');
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });

    // Mobile menu toggle
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

    // Mobile dropdown toggles
    const mobileDropdowns = document.querySelectorAll('.mobile-dropdown-toggle');
    mobileDropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const menu = this.nextElementSibling;
            menu.classList.toggle('show');
        });
    });
}); 