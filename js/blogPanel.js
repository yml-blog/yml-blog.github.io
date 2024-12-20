const blogList = [
    {
        title: "Decoder-Only Architectures in LLMs",
        url: "decoder-only-architectures.html",
        category: "Machine Learning"
    },
    {
        title: "Sentiment Analysis with BERT (Part 1)",
        url: "sentiment-analysis-fine-tune-with-bert.html",
        category: "NLP"
    },
    {
        title: "Sentiment Analysis with BERT (Part 2)",
        url: "sentiment-analysis-fine-tune-with-bert2.html",
        category: "NLP"
    },
    {
        title: "Trustworthy Machine Learning",
        url: "trust-worth-machine-learning-1.html",
        category: "Machine Learning"
    },
    {
        title: "Choosing the Right Statistical Test for Survey Analysis",
        url: "key-statistical-tests-survey-analysis.html",
        category: "Statistics"
    },
    {
        title: "Deep Learning Engineering with JAX",
        url: "jax-guide.html",
        category: "Machine Learning"
    }
];

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
                            <span class="blog-title">${blog.title}</span>
                        </a>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
    
    // Create wrapper for content
    const container = document.querySelector('.container');
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'content-wrapper';
    
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
document.addEventListener('DOMContentLoaded', createBlogPanel);