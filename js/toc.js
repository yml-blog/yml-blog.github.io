/**
 * Table of Contents Generator
 * Automatically creates a table of contents from h2, h3 and h4 headings
 */
document.addEventListener('DOMContentLoaded', function() {
    const articleContent = document.querySelector('.article-content');
    const keyPoints = document.querySelector('.key-points');
    
    // Only generate TOC if we have an article with headings
    if (articleContent) {
        const headings = articleContent.querySelectorAll('h2, h3, h4');
        
        // Only create TOC if we have headings
        if (headings.length > 0) {
            // Create TOC container
            const tocContainer = document.createElement('div');
            tocContainer.className = 'toc-container';
            tocContainer.innerHTML = '<div class="toc-title">Table of Contents</div>';
            
            // Create TOC list
            const tocList = document.createElement('ul');
            tocList.className = 'toc-list';
            
            // Process each heading
            headings.forEach((heading, index) => {
                // Add ID to heading if it doesn't have one
                if (!heading.id) {
                    heading.id = 'heading-' + index;
                }
                
                // Create list item
                const listItem = document.createElement('li');
                
                // Create link
                const link = document.createElement('a');
                link.href = '#' + heading.id;
                link.textContent = heading.textContent;
                link.className = 'toc-' + heading.tagName.toLowerCase();
                
                // Add link to list item
                listItem.appendChild(link);
                tocList.appendChild(listItem);
            });
            
            // Add list to container
            tocContainer.appendChild(tocList);
            
            // Insert after key points or at the beginning of article
            if (keyPoints) {
                keyPoints.after(tocContainer);
            } else {
                articleContent.prepend(tocContainer);
            }
            
            // Add scroll highlight functionality
            window.addEventListener('scroll', highlightTOC);
        }
    }
    
    // Highlight current section in TOC
    function highlightTOC() {
        const scrollPosition = window.scrollY || document.documentElement.scrollTop;
        
        // Get all headings with IDs
        const headings = document.querySelectorAll('.article-content h2[id], .article-content h3[id], .article-content h4[id]');
        const tocLinks = document.querySelectorAll('.toc-list a');
        
        // Reset all TOC links
        tocLinks.forEach(link => link.classList.remove('toc-active'));
        
        // Find the current heading
        for (let i = 0; i < headings.length; i++) {
            const heading = headings[i];
            const nextHeading = headings[i + 1];
            
            const headingTop = heading.offsetTop - 100; // Offset for fixed header
            const nextHeadingTop = nextHeading ? nextHeading.offsetTop - 100 : document.body.scrollHeight;
            
            if (scrollPosition >= headingTop && scrollPosition < nextHeadingTop) {
                // Find and highlight corresponding TOC link
                const correspondingLink = document.querySelector(`.toc-list a[href="#${heading.id}"]`);
                if (correspondingLink) {
                    correspondingLink.classList.add('toc-active');
                }
                break;
            }
        }
    }
}); 