document.addEventListener('DOMContentLoaded', function() {
    // Find all code blocks
    const codeBlocks = document.querySelectorAll('.code-block pre, pre code');
    
    // Process each code block
    codeBlocks.forEach(function(codeBlock) {
        // Create wrapper if it doesn't exist
        let wrapper = codeBlock.closest('.code-block');
        if (!wrapper) {
            wrapper = document.createElement('div');
            wrapper.className = 'code-block';
            codeBlock.parentNode.insertBefore(wrapper, codeBlock);
            wrapper.appendChild(codeBlock);
        }
        
        // Set position: relative on wrapper
        wrapper.style.position = 'relative';
        
        // Create copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-code-button';
        copyButton.innerHTML = '<i class="fa fa-copy"></i> Copy';
        wrapper.appendChild(copyButton);
        
        // Add click event
        copyButton.addEventListener('click', function() {
            // Get the code text
            let codeText;
            if (codeBlock.tagName.toLowerCase() === 'pre') {
                codeText = codeBlock.textContent;
            } else {
                codeText = codeBlock.textContent;
            }
            
            // Copy to clipboard
            navigator.clipboard.writeText(codeText).then(function() {
                // Update button text temporarily
                copyButton.innerHTML = '<i class="fa fa-check"></i> Copied!';
                setTimeout(function() {
                    copyButton.innerHTML = '<i class="fa fa-copy"></i> Copy';
                }, 2000);
            }).catch(function(error) {
                console.error('Could not copy text: ', error);
                copyButton.innerHTML = '<i class="fa fa-times"></i> Error';
                setTimeout(function() {
                    copyButton.innerHTML = '<i class="fa fa-copy"></i> Copy';
                }, 2000);
            });
        });
    });
}); 