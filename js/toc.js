/**
 * Table of Contents Generator
 * Automatically creates a table of contents from h2, h3 and h4 headings
 */
document.addEventListener('DOMContentLoaded', function() {
    const articleContent = document.querySelector('.article-content');
    const tocDiv = document.getElementById('toc');
    
    // Only generate TOC if we have an article with headings and a TOC container
    if (articleContent && tocDiv) {
        const headings = articleContent.querySelectorAll('h2, h3');
        
        // Only create TOC if we have headings
        if (headings.length > 0) {
            // Create TOC list
            const tocList = document.createElement('ul');
            let currentLevel = 0;
            let counter = {h2: 0, h3: 0};
            let currentList = tocList;
            let previousList = null;
            let previousLevel = null;
            
            // Process each heading
            headings.forEach((heading, index) => {
                // Add ID to heading if it doesn't have one
                if (!heading.id) {
                    heading.id = 'heading-' + index;
                }
                
                const level = parseInt(heading.tagName.substring(1));
                
                // Increment counter for this level
                counter[heading.tagName.toLowerCase()]++;
                let prefix = "";
                
                // Create prefix based on heading level
                if (heading.tagName === 'H2') {
                    prefix = counter.h2 + ". ";
                    // Reset h3 counter when we hit a new h2
                    counter.h3 = 0;
                } else if (heading.tagName === 'H3') {
                    prefix = counter.h2 + "." + counter.h3 + " ";
                }
                
                // Add prefix to actual heading in the document
                const originalText = heading.textContent;
                heading.textContent = prefix + originalText;
                
                // Create list item
                const listItem = document.createElement('li');
                
                // Create link
                const link = document.createElement('a');
                link.href = '#' + heading.id;
                link.textContent = heading.textContent;
                link.className = 'toc-' + heading.tagName.toLowerCase();
                
                // Add proper indentation based on heading level
                if (level > currentLevel) {
                    // Going deeper, create a new nested list
                    previousList = currentList;
                    previousLevel = currentLevel;
                    
                    const newList = document.createElement('ul');
                    if (previousList.lastChild) {
                        previousList.lastChild.appendChild(newList);
                        currentList = newList;
                    } else {
                        previousList.appendChild(newList);
                        currentList = newList;
                    }
                } else if (level < currentLevel) {
                    // Going back up, return to parent list
                    currentList = previousList;
                }
                
                // Add link to list item
                listItem.appendChild(link);
                currentList.appendChild(listItem);
                
                // Update current level
                currentLevel = level;
            });
            
            // Add list to container
            tocDiv.appendChild(tocList);
            
            // Add scroll highlight functionality
            window.addEventListener('scroll', highlightTOC);
        }
    }
    
    // Highlight current section in TOC
    function highlightTOC() {
        const scrollPosition = window.scrollY || document.documentElement.scrollTop;
        
        // Get all headings with IDs
        const headings = document.querySelectorAll('.article-content h2[id], .article-content h3[id]');
        const tocLinks = document.querySelectorAll('#toc a');
        
        // Reset all TOC links
        tocLinks.forEach(link => link.classList.remove('active'));
        
        // Find the current heading
        for (let i = 0; i < headings.length; i++) {
            const heading = headings[i];
            const nextHeading = headings[i + 1];
            
            const headingTop = heading.offsetTop - 100; // Offset for fixed header
            const nextHeadingTop = nextHeading ? nextHeading.offsetTop - 100 : document.body.scrollHeight;
            
            if (scrollPosition >= headingTop && scrollPosition < nextHeadingTop) {
                // Find and highlight corresponding TOC link
                const correspondingLink = document.querySelector(`#toc a[href="#${heading.id}"]`);
                if (correspondingLink) {
                    correspondingLink.classList.add('active');
                }
                break;
            }
        }
    }
}); 