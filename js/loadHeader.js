document.addEventListener('DOMContentLoaded', function() {
    const nav = document.createElement('nav');
    nav.className = 'nav-menu';
    nav.innerHTML = `
        <ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="about.html">About</a></li>
            <li><a href="blog.html">Blog</a></li>
        </ul>
    `;
    document.body.insertBefore(nav, document.body.firstChild);
}); 