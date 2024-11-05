document.addEventListener('DOMContentLoaded', function() {
    const nav = document.createElement('nav');
    nav.className = 'nav-menu';
    nav.innerHTML = `
        <div class="nav-container">
            <ul>
                <li><a href="index.html">Home</a></li>
                <li class="dropdown">
                    <a href="#" class="dropdown-toggle">AI/ML</a>
                    <ul class="dropdown-menu">
                        <li><a href="trust-worth-machine-learning-1.html">Trustworthy Machine Learning</a></li>
                        <li><a href="ray_explanation.html">Ray Framework</a></li>
                        <li><a href="sentiment-analysis-fine-tune-with-bert.html">BERT Fine-tuning Part 1</a></li>
                        <li><a href="sentiment-analysis-fine-tune-with-bert2.html">BERT Fine-tuning Part 2</a></li>
                        <li><a href="decoder-only-architectures.html">Decoder Architectures in LLMs</a></li>
                        <li><a href="key-statistical-tests-survey-analysis.html">Statistical Tests for Survey Analysis</a></li>
                    </ul>
                </li>
                <li class="dropdown">
                    <a href="#" class="dropdown-toggle">Business Intelligence</a>
                    <ul class="dropdown-menu">
                        <li><a href="business-intelligence-1.html">BI Introduction</a></li>
                        <li><a href="data-visualization.html">Data Visualization</a></li>
                        <li><a href="business-analytics.html">Business Analytics</a></li>
                    </ul>
                </li>
                <li><a href="mailto:yangmingml@yahoo.com" class="contact-link">Contact</a></li>
            </ul>
        </div>
    `;
    document.body.insertBefore(nav, document.body.firstChild);

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
}); 