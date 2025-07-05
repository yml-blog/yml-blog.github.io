const blogList = [
    {
        title: "Why Decoder-Only Architectures Dominate Modern LLMs",
        displayTitle: "Why Are Decoder-Only Architectures Taking Over the LLM World?",
        url: "decoder-only-architectures.html",
        category: "Machine Learning"
    },
    {
        title: "Sentiment Analysis with BERT (Part 1)",
        displayTitle: "5-Step Guide to Fine-tuning BERT for Sentiment Analysis",
        url: "sentiment-analysis-fine-tune-with-bert.html",
        category: "NLP"
    },
    {
        title: "Sentiment Analysis with BERT (Part 2)",
        displayTitle: "Advanced BERT Fine-tuning: Beyond the Basics",
        url: "sentiment-analysis-fine-tune-with-bert2.html",
        category: "NLP"
    },
    {
        title: "Trustworthy Machine Learning",
        displayTitle: "7 Principles for Building Trustworthy Machine Learning Systems",
        url: "trust-worth-machine-learning-1.html",
        category: "Machine Learning"
    },
    {
        title: "Choosing the Right Statistical Test for Survey Analysis",
        displayTitle: "How to Choose the Perfect Statistical Test for Your Survey Data",
        url: "key-statistical-tests-survey-analysis.html",
        category: "Statistics"
    },
    {
        title: "Deep Learning Engineering with JAX",
        displayTitle: "JAX: The Future of High-Performance Deep Learning?",
        url: "jax-guide.html",
        category: "Machine Learning"
    }
];

// Filter blogs based on search query and category
function filterBlogs(searchQuery, category) {
    const query = searchQuery.toLowerCase();
    return blogList.filter(blog => {
        const matchesSearch = blog.title.toLowerCase().includes(query) || 
                             (blog.displayTitle && blog.displayTitle.toLowerCase().includes(query));
        const matchesCategory = category === 'all' || blog.category === category;
        return matchesSearch && matchesCategory;
    });
}

// Initialize search and filter functionality
function initSearchAndFilter() {
    const searchBox = document.getElementById('aiml-search-box');
    const filterSelect = document.getElementById('aiml-filter');
    const blogListElement = document.getElementById('aiml-blog-list');
    
    if (!searchBox || !filterSelect || !blogListElement) return;
    
    // Populate filter dropdown with unique categories
    const categories = ['all', ...new Set(blogList.map(blog => blog.category))];
    filterSelect.innerHTML = categories.map(cat => 
        `<option value="${cat === 'all' ? 'all' : cat}">${cat === 'all' ? 'All Categories' : cat}</option>`
    ).join('');
    
    // Function to update the displayed blog list
    function updateBlogList() {
        const query = searchBox.value;
        const category = filterSelect.value;
        const filteredBlogs = filterBlogs(query, category);
        
        if (filteredBlogs.length === 0) {
            blogListElement.innerHTML = '<li class="no-results">No blogs match your search criteria</li>';
        } else {
            blogListElement.innerHTML = filteredBlogs.map(blog => `
                <li>
                    <a href="${blog.url}">
                        <span class="blog-category">${blog.category}</span>
                        <span class="blog-title">${blog.displayTitle || blog.title}</span>
                    </a>
                </li>
            `).join('');
        }
    }
    
    // Add event listeners for real-time filtering
    searchBox.addEventListener('input', updateBlogList);
    filterSelect.addEventListener('change', updateBlogList);
    
    // Initial display
    updateBlogList();
}

function createBlogPanel() {
    // Get current page URL
    const currentPage = window.location.pathname.split('/').pop();
    
    // Filter out current page from recommendations
    const otherBlogs = blogList.filter(blog => blog.url !== currentPage);
    
    // Randomly select 3 blogs
    const randomBlogs = otherBlogs.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    // Create panel HTML
    const panelHTML = `
        <div class="blog-panel">
            <h3>Related Articles</h3>
            <ul class="blog-links">
                ${randomBlogs.map(blog => `
                    <li>
                        <a href="${blog.url}">
                            <span class="blog-category">${blog.category}</span>
                            <span class="blog-title">${blog.displayTitle || blog.title}</span>
                        </a>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
    
    // Create wrapper for content
    const container = document.querySelector('.container');
    if (!container) return; // Exit if container not found
    
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'content-wrapper';
    
    // Save the footer to reposition it later
    const footer = container.querySelector('footer.footer');
    let savedFooter = null;
    if (footer) {
        savedFooter = footer.cloneNode(true);
        footer.parentNode.removeChild(footer);
    }
    
    // Move all content except the panel into the wrapper
    while (container.firstChild) {
        contentWrapper.appendChild(container.firstChild);
    }
    
    // Create flex container
    const flexContainer = document.createElement('div');
    flexContainer.className = 'flex-container';
    
    // Add panel and content wrapper to flex container
    flexContainer.innerHTML = panelHTML;
    flexContainer.appendChild(contentWrapper);
    
    // Add flex container to main container
    container.appendChild(flexContainer);
    
    // Add the footer back at the container level
    if (savedFooter) {
        container.appendChild(savedFooter);
    }
}

// Add CSS styles
const styles = `
    .container {
        max-width: 1400px !important;
        padding: 20px !important;
    }

    .flex-container {
        display: flex;
        gap: 30px;
        position: relative;
    }

    .blog-panel {
        flex: 0 0 300px;
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        position: sticky;
        top: 20px;
        height: fit-content;
        margin-top: 20px;
    }

    .content-wrapper {
        flex: 1;
        max-width: 800px;
    }

    .blog-panel h3 {
        color: #333;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 2px solid #e9ecef;
    }

    .blog-links {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .blog-links li {
        margin-bottom: 15px;
    }

    .blog-links a {
        display: block;
        text-decoration: none;
        padding: 10px;
        border-radius: 4px;
        transition: background-color 0.3s;
    }

    .blog-links a:hover {
        background-color: #e9ecef;
    }

    .blog-category {
        display: block;
        color: #6c757d;
        font-size: 0.9em;
        margin-bottom: 5px;
    }

    .blog-title {
        display: block;
        color: #2a54f5;
        font-weight: 500;
    }

    @media (max-width: 768px) {
        .flex-container {
            flex-direction: column;
        }
        
        .blog-panel {
            position: static;
            width: 100%;
        }
        
        .content-wrapper {
            width: 100%;
        }
    }
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    createBlogPanel();
    initSearchAndFilter();
});