(function () {
    'use strict';

    const STORAGE_KEY = 'yangming-site-language';
    const DEFAULT_LANGUAGE = 'en';
    const LANGUAGES = {
        zh: { label: '中文', htmlLang: 'zh-Hans' },
        en: { label: 'English', htmlLang: 'en' },
        es: { label: 'Español', htmlLang: 'es' },
        it: { label: 'Italiano', htmlLang: 'it' },
        ko: { label: '한국어', htmlLang: 'ko' },
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
            'home.utility.title': 'More ways to explore',
            'home.utility.copy': 'Beyond the main work and projects, I also keep study notes, essays, small experiments, investing notes, and certificates here. They give extra context on how I learn, think, and build.',
            'home.utility.note': 'If you are here for collaboration or hiring, start with About, Projects, Blog, Resume, or Contact. If you are curious, the other links are open too.',
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
        es: {
            'language.label': 'Idioma',
            'nav.home': 'Inicio',
            'nav.about': 'Acerca de',
            'nav.aboutMe': 'Sobre mí',
            'nav.projects': 'Proyectos',
            'nav.portfolio': 'Portafolio',
            'nav.blog': 'Blog',
            'nav.blogIndex': 'Índice del blog',
            'nav.aiEngineering': 'Ingeniería de IA',
            'nav.resume': 'CV',
            'nav.contact': 'Contacto',
            'nav.notes': 'Notas',
            'nav.essays': 'Ensayos',
            'nav.lab': 'Laboratorio',
            'nav.investing': 'Inversión',
            'nav.aiMl': 'IA/ML',
            'nav.product': 'Producto',
            'nav.engineering': 'Ingeniería',
            'nav.subscribe': 'Suscribirse al boletín',
            'theme.light': 'Claro',
            'theme.dark': 'Oscuro',
            'article.outline': 'Esquema rápido',
            'home.skip': 'Ir al contenido principal',
            'home.hero.titleHtml': '<span class="hero-welcome">Bienvenido, soy Yangming Li</span>Diseño sistemas de IA aplicada y arquitectura de IA lista para producción.',
            'home.hero.role': 'Ingeniero de IA + creador de producto, enfocado en diseño de sistemas LLM, recuperación, evaluación, ML estadístico, ingeniería de datos e infraestructura de experimentación para equipos de salud, finanzas y empresa.',
            'home.hero.intro': 'Trabajo en la intersección de ingeniería de IA, ML estadístico, ingeniería de datos y pensamiento de producto para diseñar sistemas que los equipos puedan llevar a producción.',
            'home.hero.askHtml': '<i class="fa fa-comments"></i> Preguntar a Yangming AI',
            'home.proof.title': 'Una lectura rápida de confianza, encaje y entrega',
            'home.proof.copy': 'Para equipos que valoran adopción, auditabilidad e impacto en producción, no solo demostraciones de modelos.',
            'home.utility.title': 'Más formas de explorar',
            'home.utility.copy': 'Además del trabajo principal y los proyectos, aquí guardo notas de estudio, ensayos, pequeños experimentos, notas de inversión y certificados. Dan más contexto sobre cómo aprendo, pienso y construyo.',
            'home.utility.note': 'Si vienes por colaboración o contratación, empieza por Acerca de, Proyectos, Blog, CV o Contacto. Si tienes curiosidad, los demás enlaces también están abiertos.',
            'home.selectedWriting': 'Artículos seleccionados',
            'home.blogIntroHtml': 'Explora artículos por tema. IA/ML, producto, ingeniería e inversión ahora viven en una sola vista de blog. Para sistemas de IA en producción, visita la columna <a href="ai-engineering/">Ingeniería de IA</a>.',
            'home.blog.search': 'Buscar artículos...',
            'home.selectedWork': 'Trabajo seleccionado',
            'home.portfolioIntro': 'Temas representativos de trabajo en salud, finanzas y equipos empresariales, centrados en sistemas de IA que van más allá de la demo.',
            'home.investingTitle': 'Inversión',
            'home.investingIntro': 'Notas sobre asignación de capital, estructura de mercado y las partes más tranquilas de las decisiones a largo plazo.',
            'home.notesTitle': 'Notas',
            'home.notesIntro': 'Notas de trabajo, materiales de estudio y referencias que apoyan el cuerpo principal del trabajo.',
            'home.essaysTitle': 'Ensayos y referencias',
            'home.essaysIntro': 'Un rincón más tranquilo para ensayos, referencias e ideas que influyen en cómo construyo.',
            'home.labTitle': 'Laboratorio',
            'home.labIntro': 'Un espacio pequeño para prototipos interactivos y experimentos ligeros.',
            'home.contactTitle': 'Contacto',
            'ask.eyebrowHtml': '<span class="ask-yangming-launcher-dot"></span> Asistente basado en el sitio',
            'ask.title': 'Preguntar a Yangming',
            'ask.subtitle': 'Un asistente ligero para visitantes. Útil para encaje, áreas de enfoque, recomendaciones del blog y contacto.',
            'ask.placeholder': 'Pregunta sobre experiencia, artículos relevantes, encaje de proyecto o cómo ponerte en contacto.',
            'ask.footnote': 'Esta versión incorpora conocimiento local del sitio directamente en el frontend, por lo que funciona en un host estático sin JSON ni backend separado.',
            'ask.clear': 'Borrar conversación',
            'ask.close': 'Cerrar asistente',
            'ask.panel': 'Asistente Ask Yangming',
            'ask.empty': 'Pregunta por las áreas de enfoque de Yangming, artículos relevantes o si un proyecto encaja.',
            'ask.prompt.build': '¿Qué construyes?',
            'ask.prompt.posts': '¿Qué artículos debería leer si me interesan MLOps y los sistemas LLM?',
            'ask.prompt.contact': '¿Cómo puedo contactarte para trabajo de IA o datos?',
            'about.h1': 'Acerca de Yangming Li',
            'about.intro': 'Yangming Li es ingeniero de IA y creador de producto enfocado en sistemas de IA aplicada y arquitectura de IA para producción.',
            'about.focus': 'Áreas de enfoque',
            'about.focus1': 'Sistemas LLM, copilotos, generación aumentada por recuperación e inteligencia documental.',
            'about.focus2': 'ML estadístico, NLP, modelado de temas y machine learning confiable.',
            'about.focus3': 'Productos de datos, sistemas analíticos y herramientas de apoyo a decisiones.',
            'about.focus4': 'MLOps, infraestructura de experimentación, A/B testing y entrega en producción.',
            'about.start': 'Empieza aquí',
            'about.startHtml': 'Explora la <a href="/projects.html">página de proyectos</a>, el <a href="/blog/">índice del blog</a> o el <a href="/resume.html">CV</a>.',
            'projects.h1': 'Proyectos y temas de portafolio',
            'projects.intro': 'Temas seleccionados de trabajo para equipos de salud, finanzas y empresa, centrados en sistemas de IA listos para producción.',
            'projects.kicker1': 'Sistemas LLM',
            'projects.title1': 'IA aplicada para sistemas de documentos y conocimiento',
            'projects.copy1Html': 'Trabajo en copilotos, RAG, generación de informes e integración de sistemas de IA. Notas relacionadas: <a href="/llama-report-guide.html">guía de LlamaReport</a>, <a href="/mcp-protocol-guide.html">guía de MCP</a> y <a href="/n8n-ai-workflows.html">guía de sistemas de IA</a>.',
            'projects.kicker2': 'Productos de datos',
            'projects.title2': 'Productos de apoyo a decisiones para equipos complejos',
            'projects.copy2Html': 'Experiencias analíticas y de producto que ayudan a equipos operativos a pasar de datos sin procesar a mejores decisiones. Notas relacionadas: <a href="/building-product-scales-company.html">estrategia de producto</a>, <a href="/product-success-essence.html">fundamentos de producto</a> y <a href="/jira-guide.html">sistemas de entrega</a>.',
            'projects.kicker3': 'Infraestructura de experimentación',
            'projects.title3': 'De la experimentación a la producción',
            'projects.copy3Html': 'Pensamiento de sistemas alrededor de A/B testing, MLOps, plataformas de datos y medición confiable de lanzamientos. Notas relacionadas: <a href="/engineering/ab-test-engineering-guide.html">sistemas de A/B testing</a>, <a href="/mlops-essential-skills.html">fundamentos de MLOps</a> y <a href="/databricks-comprehensive-guide.html">guía de plataforma de datos</a>.',
            'resume.h1': 'Resumen del CV',
            'resume.intro': 'Yangming Li trabaja en la intersección de IA aplicada, arquitectura de sistemas de IA, ciencia de datos, sistemas de producto y ejecución de ingeniería.',
            'resume.focus': 'Enfoque técnico',
            'resume.item1': 'Sistemas de IA aplicada, arquitectura LLM, copilotos, recuperación e inteligencia documental.',
            'resume.item2': 'Machine learning estadístico, NLP, modelado de temas y ML confiable.',
            'resume.item3': 'Ingeniería de datos, productos de datos, MLOps e infraestructura de experimentación.',
            'resume.item4': 'Estrategia de producto, sistemas analíticos, herramientas de apoyo a decisiones y entrega en producción.',
            'resume.credentials': 'Credenciales y aprendizaje',
            'resume.credentialsHtml': 'El sitio menciona credenciales CFA y FRM e incluye una <a href="/courses.html">página de cursos y certificados</a>.',
            'resume.writing': 'Artículos seleccionados',
            'resume.writingHtml': 'Para ver evidencia del enfoque técnico, revisa el <a href="/blog/">índice del blog</a>, los <a href="/projects.html">temas de proyecto</a> y artículos sobre <a href="/mlops-essential-skills.html">MLOps</a>, <a href="/mcp-protocol-guide.html">MCP</a> y <a href="/engineering/ab-test-engineering-guide.html">sistemas de A/B testing</a>.',
            'contact.h1': 'Contactar a Yangming Li',
            'contact.intro': 'Para conversaciones sobre sistemas de IA aplicada, arquitectura de IA, productos de datos, analítica o colaboración técnica, usa los canales de abajo.',
            'contact.links': 'Enlaces de contacto',
            'contact.related': 'Páginas relacionadas',
            'contact.relatedHtml': 'Antes de escribir, puedes revisar <a href="/projects.html">proyectos</a>, el <a href="/resume.html">CV</a> o los <a href="/blog/">artículos técnicos</a>.',
            'blog.h1': 'Artículos sobre IA aplicada, ciencia de datos, producto e ingeniería',
            'blog.leadHtml': 'Un índice navegable de notas prácticas de Yangming Li. La columna <a href="/ai-engineering/">Ingeniería de IA</a> reúne los artículos más cercanos a sistemas de IA en producción.',
            'blog.ai': 'Ingeniería de IA',
            'blog.applied': 'IA aplicada y ML',
            'blog.data': 'Plataformas de datos y MLOps',
            'blog.product': 'Producto y experimentación',
            'ai.eyebrow': 'Columna dedicada',
            'ai.h1': 'Ingeniería de IA',
            'ai.lead': 'Notas prácticas sobre construcción de sistemas de IA en producción: aplicaciones LLM, agentes, evaluación, recuperación, MLOps, despliegue y observabilidad.',
            'ai.llm': 'Sistemas LLM y agentes',
            'ai.mlops': 'ML en producción y MLOps',
            'ai.infrastructure': 'Infraestructura de IA',
            'ai.scope': 'Alcance editorial',
            'ai.scopeNote': 'Esta columna trata la capa de ingeniería entre demos de IA y productos confiables.',
            'courses.h1': 'Cursos y certificados',
            'courses.subtitle': 'Colección de cursos completados y certificados en programación, machine learning, ciencia de datos y MLOps.',
            'courses.datacamp': 'Cursos de DataCamp',
            'courses.coursera': 'Cursos de Coursera',
            'courses.leetcode': 'Soluciones de LeetCode (Python)',
            'courses.leetcodeIntro': 'Repositorio de soluciones en Python para problemas LeetCode Top 150.',
            'courses.leetcodeOutro': 'Soluciones de ejemplo de más de 150 problemas LeetCode resueltos, con análisis de complejidad temporal y espacial.',
            'courses.viewRepo': 'Ver repositorio completo de soluciones LeetCode',
            'courses.backHomeHtml': '<i class="fa fa-arrow-left"></i> Volver al inicio',
            'courses.backHtml': '<i class="fa fa-arrow-left"></i> Volver a certificados',
            'leetcode.problem': 'Descripción del problema',
            'leetcode.solution': 'Enfoque de solución',
            'leetcode.example': 'Ejemplo:',
            'leetcode.python': 'Implementación en Python:',
            'leetcode.time': 'Complejidad temporal:',
            'leetcode.space': 'Complejidad espacial:',
            'product.movedTitle': 'Índice del blog movido',
            'product.movedCopyHtml': 'El índice de artículos ahora está en <a href="/blog/">https://yangmingli.com/blog/</a>.'
        },
        it: {
            'language.label': 'Lingua',
            'nav.home': 'Home',
            'nav.about': 'Chi sono',
            'nav.aboutMe': 'Chi sono',
            'nav.projects': 'Progetti',
            'nav.portfolio': 'Portfolio',
            'nav.blog': 'Blog',
            'nav.blogIndex': 'Indice blog',
            'nav.aiEngineering': 'Ingegneria IA',
            'nav.resume': 'CV',
            'nav.contact': 'Contatti',
            'nav.notes': 'Note',
            'nav.essays': 'Saggi',
            'nav.lab': 'Lab',
            'nav.investing': 'Investimenti',
            'nav.aiMl': 'IA/ML',
            'nav.product': 'Prodotto',
            'nav.engineering': 'Ingegneria',
            'nav.subscribe': 'Iscriviti alla newsletter',
            'theme.light': 'Chiaro',
            'theme.dark': 'Scuro',
            'article.outline': 'Indice rapido',
            'home.skip': 'Vai al contenuto principale',
            'home.hero.titleHtml': '<span class="hero-welcome">Benvenuto, sono Yangming Li</span>Progetto sistemi di IA applicata e architetture IA pronte per la produzione.',
            'home.hero.role': 'Ingegnere IA + creatore di prodotti, focalizzato su progettazione di sistemi LLM, retrieval, valutazione, ML statistico, data engineering e infrastruttura di esperimenti per team healthcare, finance ed enterprise.',
            'home.hero.intro': 'Lavoro all’incrocio tra ingegneria IA, ML statistico, data engineering e pensiero di prodotto per progettare sistemi che i team possano davvero portare in produzione.',
            'home.hero.askHtml': '<i class="fa fa-comments"></i> Chiedi a Yangming AI',
            'home.proof.title': 'Una lettura rapida di fiducia, fit e consegna',
            'home.proof.copy': 'Per team che tengono ad adozione, auditabilità e impatto in produzione, non solo a demo di modelli.',
            'home.utility.title': 'Altri percorsi da esplorare',
            'home.utility.copy': 'Oltre al lavoro principale e ai progetti, qui tengo note di studio, saggi, piccoli esperimenti, note sugli investimenti e certificati. Offrono più contesto su come imparo, penso e costruisco.',
            'home.utility.note': 'Se sei qui per collaborazione o recruiting, parti da Chi sono, Progetti, Blog, CV o Contatti. Se sei curioso, anche gli altri link sono aperti.',
            'home.selectedWriting': 'Articoli selezionati',
            'home.blogIntroHtml': 'Esplora gli articoli per tema. IA/ML, prodotto, ingegneria e investimenti ora vivono in un’unica vista blog. Per sistemi IA in produzione, visita la colonna <a href="ai-engineering/">Ingegneria IA</a>.',
            'home.blog.search': 'Cerca articoli...',
            'home.selectedWork': 'Lavori selezionati',
            'home.portfolioIntro': 'Temi rappresentativi per team healthcare, finance ed enterprise, centrati su sistemi IA che vanno oltre la demo.',
            'home.investingTitle': 'Investimenti',
            'home.investingIntro': 'Note su allocazione del capitale, struttura dei mercati e parti più quiete delle decisioni di lungo periodo.',
            'home.notesTitle': 'Note',
            'home.notesIntro': 'Note di lavoro, materiali di studio e riferimenti che supportano il corpo principale del lavoro.',
            'home.essaysTitle': 'Saggi e riferimenti',
            'home.essaysIntro': 'Un angolo più quieto per saggi, riferimenti e idee che influenzano il mio modo di costruire.',
            'home.labTitle': 'Lab',
            'home.labIntro': 'Un piccolo spazio per prototipi interattivi ed esperimenti leggeri.',
            'home.contactTitle': 'Contatti',
            'ask.eyebrowHtml': '<span class="ask-yangming-launcher-dot"></span> Assistente basato sul sito',
            'ask.title': 'Chiedi a Yangming',
            'ask.subtitle': 'Un assistente leggero per visitatori. Utile per fit, aree di focus, consigli dal blog e contatti.',
            'ask.placeholder': 'Chiedi di competenze, articoli rilevanti, fit di progetto o come entrare in contatto.',
            'ask.footnote': 'Questa versione incorpora la conoscenza locale del sito direttamente nel frontend, quindi funziona su hosting statico senza JSON o backend separato.',
            'ask.clear': 'Cancella conversazione',
            'ask.close': 'Chiudi assistente',
            'ask.panel': 'Assistente Ask Yangming',
            'ask.empty': 'Chiedi delle aree di focus di Yangming, di post rilevanti o se un progetto è adatto.',
            'ask.prompt.build': 'Che cosa costruisci?',
            'ask.prompt.posts': 'Quali articoli dovrei leggere se mi interessano MLOps e sistemi LLM?',
            'ask.prompt.contact': 'Come posso contattarti per lavoro su IA o dati?',
            'about.h1': 'Chi è Yangming Li',
            'about.intro': 'Yangming Li è un ingegnere IA e creatore di prodotti focalizzato su sistemi di IA applicata e architettura IA pronta per la produzione.',
            'about.focus': 'Aree di focus',
            'about.focus1': 'Sistemi LLM, copiloti, generazione aumentata da retrieval e document intelligence.',
            'about.focus2': 'ML statistico, NLP, topic modeling e machine learning affidabile.',
            'about.focus3': 'Prodotti dati, sistemi analytics e strumenti di supporto alle decisioni.',
            'about.focus4': 'MLOps, infrastruttura di esperimenti, A/B testing e consegna in produzione.',
            'about.start': 'Inizia da qui',
            'about.startHtml': 'Esplora la <a href="/projects.html">pagina progetti</a>, l’<a href="/blog/">indice del blog</a> o il <a href="/resume.html">CV</a>.',
            'projects.h1': 'Progetti e temi di portfolio',
            'projects.intro': 'Temi di lavoro selezionati per team healthcare, finance ed enterprise, centrati su sistemi IA pronti per la produzione.',
            'projects.kicker1': 'Sistemi LLM',
            'projects.title1': 'IA applicata per documenti e sistemi di conoscenza',
            'projects.copy1Html': 'Lavoro su copiloti, RAG, generazione di report e integrazione di sistemi IA. Note correlate: <a href="/llama-report-guide.html">guida LlamaReport</a>, <a href="/mcp-protocol-guide.html">guida MCP</a> e <a href="/n8n-ai-workflows.html">guida ai sistemi IA</a>.',
            'projects.kicker2': 'Prodotti dati',
            'projects.title2': 'Prodotti di supporto decisionale per team complessi',
            'projects.copy2Html': 'Esperienze analytics e di prodotto che aiutano team operativi a passare dai dati grezzi a decisioni migliori. Note correlate: <a href="/building-product-scales-company.html">strategia di prodotto</a>, <a href="/product-success-essence.html">fondamentali di prodotto</a> e <a href="/jira-guide.html">sistemi di delivery</a>.',
            'projects.kicker3': 'Infrastruttura di esperimenti',
            'projects.title3': 'Dalla sperimentazione alla produzione',
            'projects.copy3Html': 'Pensiero sistemico su A/B testing, MLOps, piattaforme dati e misurazione affidabile dei lanci. Note correlate: <a href="/engineering/ab-test-engineering-guide.html">sistemi di A/B testing</a>, <a href="/mlops-essential-skills.html">fondamenti MLOps</a> e <a href="/databricks-comprehensive-guide.html">guida alle piattaforme dati</a>.',
            'resume.h1': 'Panoramica CV',
            'resume.intro': 'Yangming Li lavora all’incrocio tra IA applicata, architettura di sistemi IA, data science, sistemi di prodotto ed esecuzione ingegneristica.',
            'resume.focus': 'Focus tecnico',
            'resume.item1': 'Sistemi di IA applicata, architettura LLM, copiloti, retrieval e document intelligence.',
            'resume.item2': 'Machine learning statistico, NLP, topic modeling e ML affidabile.',
            'resume.item3': 'Data engineering, prodotti dati, MLOps e infrastruttura di esperimenti.',
            'resume.item4': 'Strategia di prodotto, sistemi analytics, strumenti di supporto decisionale e consegna in produzione.',
            'resume.credentials': 'Credenziali e apprendimento',
            'resume.credentialsHtml': 'Il sito cita credenziali CFA e FRM e include una <a href="/courses.html">pagina corsi e certificati</a>.',
            'resume.writing': 'Articoli selezionati',
            'resume.writingHtml': 'Per vedere il focus tecnico, visita l’<a href="/blog/">indice del blog</a>, i <a href="/projects.html">temi di progetto</a> e gli articoli su <a href="/mlops-essential-skills.html">MLOps</a>, <a href="/mcp-protocol-guide.html">MCP</a> e <a href="/engineering/ab-test-engineering-guide.html">sistemi di A/B testing</a>.',
            'contact.h1': 'Contattare Yangming Li',
            'contact.intro': 'Per conversazioni su sistemi di IA applicata, architettura IA, prodotti dati, analytics o collaborazione tecnica, usa i canali qui sotto.',
            'contact.links': 'Link di contatto',
            'contact.related': 'Pagine correlate',
            'contact.relatedHtml': 'Prima di scrivere, puoi consultare <a href="/projects.html">progetti</a>, il <a href="/resume.html">CV</a> o gli <a href="/blog/">articoli tecnici</a>.',
            'blog.h1': 'Articoli su IA applicata, data science, prodotto e ingegneria',
            'blog.leadHtml': 'Un indice navigabile di note pratiche di Yangming Li. La colonna <a href="/ai-engineering/">Ingegneria IA</a> raccoglie gli articoli più vicini ai sistemi IA in produzione.',
            'blog.ai': 'Ingegneria IA',
            'blog.applied': 'IA applicata e ML',
            'blog.data': 'Piattaforme dati e MLOps',
            'blog.product': 'Prodotto e sperimentazione',
            'ai.eyebrow': 'Colonna dedicata',
            'ai.h1': 'Ingegneria IA',
            'ai.lead': 'Note pratiche sulla costruzione di sistemi IA in produzione: applicazioni LLM, agenti, valutazione, retrieval, MLOps, deployment e osservabilità.',
            'ai.llm': 'Sistemi LLM e agenti',
            'ai.mlops': 'ML in produzione e MLOps',
            'ai.infrastructure': 'Infrastruttura IA',
            'ai.scope': 'Ambito editoriale',
            'ai.scopeNote': 'Questa colonna tratta lo strato di ingegneria tra demo IA e prodotti affidabili.',
            'courses.h1': 'Corsi e certificati',
            'courses.subtitle': 'Raccolta di corsi completati e certificati in programmazione, machine learning, data science e MLOps.',
            'courses.datacamp': 'Corsi DataCamp',
            'courses.coursera': 'Corsi Coursera',
            'courses.leetcode': 'Soluzioni LeetCode (Python)',
            'courses.leetcodeIntro': 'Repository di soluzioni Python per problemi LeetCode Top 150.',
            'courses.leetcodeOutro': 'Soluzioni di esempio da oltre 150 problemi LeetCode risolti, con analisi di complessità temporale e spaziale.',
            'courses.viewRepo': 'Vedi repository completo delle soluzioni LeetCode',
            'courses.backHomeHtml': '<i class="fa fa-arrow-left"></i> Torna alla home',
            'courses.backHtml': '<i class="fa fa-arrow-left"></i> Torna ai certificati',
            'leetcode.problem': 'Descrizione del problema',
            'leetcode.solution': 'Approccio alla soluzione',
            'leetcode.example': 'Esempio:',
            'leetcode.python': 'Implementazione Python:',
            'leetcode.time': 'Complessità temporale:',
            'leetcode.space': 'Complessità spaziale:',
            'product.movedTitle': 'Indice blog spostato',
            'product.movedCopyHtml': 'L’indice degli articoli ora si trova su <a href="/blog/">https://yangmingli.com/blog/</a>.'
        },
        ko: {
            'language.label': '언어',
            'nav.home': '홈',
            'nav.about': '소개',
            'nav.aboutMe': '소개',
            'nav.projects': '프로젝트',
            'nav.portfolio': '포트폴리오',
            'nav.blog': '블로그',
            'nav.blogIndex': '블로그 색인',
            'nav.aiEngineering': 'AI 엔지니어링',
            'nav.resume': '이력서',
            'nav.contact': '연락처',
            'nav.notes': '노트',
            'nav.essays': '에세이',
            'nav.lab': '랩',
            'nav.investing': '투자',
            'nav.aiMl': 'AI/ML',
            'nav.product': '제품',
            'nav.engineering': '엔지니어링',
            'nav.subscribe': '뉴스레터 구독',
            'theme.light': '라이트',
            'theme.dark': '다크',
            'article.outline': '빠른 목차',
            'home.skip': '본문으로 건너뛰기',
            'home.hero.titleHtml': '<span class="hero-welcome">환영합니다, 저는 Yangming Li입니다</span>저는 적용 가능한 AI 시스템과 프로덕션 준비 AI 아키텍처를 설계합니다.',
            'home.hero.role': 'AI 엔지니어 + 제품 빌더로서 LLM 시스템 설계, 검색, 평가, 통계 ML, 데이터 엔지니어링, 그리고 헬스케어, 금융, 엔터프라이즈 팀을 위한 실험 인프라에 집중합니다.',
            'home.hero.intro': '저는 AI 엔지니어링, 통계 ML, 데이터 엔지니어링, 제품 사고가 만나는 지점에서 팀이 실제로 출시할 수 있는 시스템을 설계합니다.',
            'home.hero.askHtml': '<i class="fa fa-comments"></i> Yangming AI에 묻기',
            'home.proof.title': '신뢰, 적합성, 전달력을 빠르게 파악하기',
            'home.proof.copy': '모델 데모만이 아니라 도입, 감사 가능성, 프로덕션 임팩트를 중요하게 여기는 팀을 위한 사이트입니다.',
            'home.utility.title': '더 둘러볼 곳',
            'home.utility.copy': '주요 작업과 프로젝트 외에도 학습 노트, 에세이, 작은 실험, 투자 노트, 인증서를 이곳에 모아 둡니다. 제가 어떻게 배우고, 생각하고, 만드는지 더 넓은 맥락을 보여 줍니다.',
            'home.utility.note': '협업이나 채용 정보를 보러 오셨다면 소개, 프로젝트, 블로그, 이력서, 연락처부터 보시면 좋습니다. 더 궁금하다면 다른 링크도 자유롭게 둘러보세요.',
            'home.selectedWriting': '선별 글',
            'home.blogIntroHtml': '주제별로 글을 둘러보세요. AI/ML, 제품, 엔지니어링, 투자 글은 이제 하나의 블로그 화면에 모여 있습니다. 프로덕션 AI 시스템 관련 글은 <a href="ai-engineering/">AI 엔지니어링</a> 컬럼을 확인하세요.',
            'home.blog.search': '글 검색...',
            'home.selectedWork': '선별 작업',
            'home.portfolioIntro': '헬스케어, 금융, 엔터프라이즈 팀을 위한 대표 작업 주제입니다. 데모를 넘어 실제 운영 가능한 AI 시스템에 초점을 둡니다.',
            'home.investingTitle': '투자',
            'home.investingIntro': '자본 배분, 시장 구조, 장기 의사결정의 조용한 부분에 관한 노트입니다.',
            'home.notesTitle': '노트',
            'home.notesIntro': '주요 작업을 뒷받침하는 작업 노트, 학습 자료, 참고 기록입니다.',
            'home.essaysTitle': '에세이와 참고 자료',
            'home.essaysIntro': '제가 만드는 방식에 영향을 주는 에세이, 참고 자료, 아이디어를 모아 둔 조용한 공간입니다.',
            'home.labTitle': '랩',
            'home.labIntro': '인터랙티브 프로토타입과 가벼운 실험을 위한 작은 공간입니다.',
            'home.contactTitle': '연락처',
            'ask.eyebrowHtml': '<span class="ask-yangming-launcher-dot"></span> 사이트 기반 어시스턴트',
            'ask.title': 'Yangming에게 묻기',
            'ask.subtitle': '방문자를 위한 가벼운 어시스턴트입니다. 적합성, 관심 분야, 블로그 추천, 연락 경로를 확인하는 데 좋습니다.',
            'ask.placeholder': '전문성, 관련 글, 프로젝트 적합성, 연락 방법에 대해 물어보세요.',
            'ask.footnote': '이 버전은 로컬 사이트 지식을 프론트엔드에 직접 포함하므로 별도의 JSON이나 백엔드 없이 정적 호스팅에서도 작동합니다.',
            'ask.clear': '대화 지우기',
            'ask.close': '어시스턴트 닫기',
            'ask.panel': 'Ask Yangming 어시스턴트',
            'ask.empty': 'Yangming의 관심 분야, 관련 블로그 글, 프로젝트 적합성에 대해 물어보세요.',
            'ask.prompt.build': '무엇을 만드나요?',
            'ask.prompt.posts': 'MLOps와 LLM 시스템에 관심이 있다면 어떤 글을 읽어야 하나요?',
            'ask.prompt.contact': 'AI나 데이터 작업으로 연락하려면 어떻게 해야 하나요?',
            'about.h1': 'Yangming Li 소개',
            'about.intro': 'Yangming Li는 적용 가능한 AI 시스템과 프로덕션 AI 아키텍처에 집중하는 AI 엔지니어이자 제품 빌더입니다.',
            'about.focus': '관심 분야',
            'about.focus1': 'LLM 시스템, 코파일럿, 검색 증강 생성, 문서 인텔리전스.',
            'about.focus2': '통계 ML, NLP, 토픽 모델링, 신뢰할 수 있는 머신러닝.',
            'about.focus3': '데이터 제품, 분석 시스템, 의사결정 지원 도구.',
            'about.focus4': 'MLOps, 실험 인프라, A/B 테스트, 프로덕션 전달.',
            'about.start': '여기서 시작하기',
            'about.startHtml': '<a href="/projects.html">프로젝트 페이지</a>, <a href="/blog/">블로그 색인</a>, 또는 <a href="/resume.html">이력서</a>를 살펴보세요.',
            'projects.h1': '프로젝트와 포트폴리오 주제',
            'projects.intro': '헬스케어, 금융, 엔터프라이즈 팀을 위한 선별 작업 주제이며, 프로덕션 준비 AI 시스템에 초점을 둡니다.',
            'projects.kicker1': 'LLM 시스템',
            'projects.title1': '문서와 지식 시스템을 위한 적용 AI',
            'projects.copy1Html': '코파일럿, RAG, 보고서 생성, AI 시스템 통합을 중심으로 한 작업입니다. 관련 노트: <a href="/llama-report-guide.html">LlamaReport 가이드</a>, <a href="/mcp-protocol-guide.html">MCP 가이드</a>, <a href="/n8n-ai-workflows.html">AI 시스템 가이드</a>.',
            'projects.kicker2': '데이터 제품',
            'projects.title2': '복잡한 팀을 위한 의사결정 지원 제품',
            'projects.copy2Html': '운영 팀이 원시 데이터에서 더 나은 의사결정으로 나아가도록 돕는 분석 및 제품 경험입니다. 관련 노트: <a href="/building-product-scales-company.html">제품 전략</a>, <a href="/product-success-essence.html">제품 기본기</a>, <a href="/jira-guide.html">전달 시스템</a>.',
            'projects.kicker3': '실험 인프라',
            'projects.title3': '실험에서 프로덕션 전달까지',
            'projects.copy3Html': 'A/B 테스트, MLOps, 데이터 플랫폼, 신뢰할 수 있는 출시 측정을 둘러싼 시스템 사고입니다. 관련 노트: <a href="/engineering/ab-test-engineering-guide.html">A/B 테스트 시스템</a>, <a href="/mlops-essential-skills.html">MLOps 기초</a>, <a href="/databricks-comprehensive-guide.html">데이터 플랫폼 가이드</a>.',
            'resume.h1': '이력서 개요',
            'resume.intro': 'Yangming Li는 적용 AI, AI 시스템 아키텍처, 데이터 과학, 제품 시스템, 엔지니어링 실행이 만나는 지점에서 일합니다.',
            'resume.focus': '기술 초점',
            'resume.item1': '적용 AI 시스템, LLM 아키텍처, 코파일럿, 검색, 문서 인텔리전스.',
            'resume.item2': '통계 머신러닝, NLP, 토픽 모델링, 신뢰할 수 있는 ML.',
            'resume.item3': '데이터 엔지니어링, 데이터 제품, MLOps, 실험 인프라.',
            'resume.item4': '제품 전략, 분석 시스템, 의사결정 지원 도구, 프로덕션 전달.',
            'resume.credentials': '자격과 학습',
            'resume.credentialsHtml': '이 사이트는 CFA와 FRM 자격을 언급하며, <a href="/courses.html">코스와 인증서 페이지</a>도 포함합니다.',
            'resume.writing': '선별 글',
            'resume.writingHtml': '기술적 초점을 보려면 <a href="/blog/">블로그 색인</a>, <a href="/projects.html">프로젝트 주제</a>, 그리고 <a href="/mlops-essential-skills.html">MLOps</a>, <a href="/mcp-protocol-guide.html">MCP</a>, <a href="/engineering/ab-test-engineering-guide.html">A/B 테스트 시스템</a> 관련 글을 살펴보세요.',
            'contact.h1': 'Yangming Li에게 연락하기',
            'contact.intro': '적용 AI 시스템, AI 아키텍처, 데이터 제품, 분석, 기술 협업에 대해 이야기하려면 아래 연락 채널을 이용하세요.',
            'contact.links': '연락 링크',
            'contact.related': '관련 페이지',
            'contact.relatedHtml': '연락하기 전에 <a href="/projects.html">프로젝트</a>, <a href="/resume.html">이력서</a>, 또는 <a href="/blog/">기술 글</a>을 살펴볼 수 있습니다.',
            'blog.h1': '적용 AI, 데이터 과학, 제품, 엔지니어링에 관한 글',
            'blog.leadHtml': 'Yangming Li의 실용 노트를 둘러볼 수 있는 색인입니다. <a href="/ai-engineering/">AI 엔지니어링</a> 컬럼은 프로덕션 AI 시스템에 가장 가까운 글을 모읍니다.',
            'blog.ai': 'AI 엔지니어링',
            'blog.applied': '적용 AI와 ML',
            'blog.data': '데이터 플랫폼과 MLOps',
            'blog.product': '제품과 실험',
            'ai.eyebrow': '전용 컬럼',
            'ai.h1': 'AI 엔지니어링',
            'ai.lead': '프로덕션 AI 시스템을 구축하기 위한 실용 노트: LLM 애플리케이션, 에이전트, 평가, 검색, MLOps, 배포, 관측 가능성.',
            'ai.llm': 'LLM 시스템과 에이전트',
            'ai.mlops': '프로덕션 ML과 MLOps',
            'ai.infrastructure': 'AI 인프라',
            'ai.scope': '편집 범위',
            'ai.scopeNote': '이 컬럼은 AI 데모와 신뢰할 수 있는 제품 사이의 엔지니어링 계층을 다룹니다.',
            'courses.h1': '코스와 인증서',
            'courses.subtitle': '프로그래밍, 머신러닝, 데이터 과학, MLOps 분야의 완료 코스와 인증서 모음입니다.',
            'courses.datacamp': 'DataCamp 코스',
            'courses.coursera': 'Coursera 코스',
            'courses.leetcode': 'LeetCode 풀이 (Python)',
            'courses.leetcodeIntro': 'LeetCode Top 150 인터뷰 문제의 Python 풀이 저장소입니다.',
            'courses.leetcodeOutro': '150개 이상의 LeetCode 풀이 중 일부 예시이며, 시간 및 공간 복잡도 분석을 포함합니다.',
            'courses.viewRepo': '전체 LeetCode 풀이 저장소 보기',
            'courses.backHomeHtml': '<i class="fa fa-arrow-left"></i> 홈으로 돌아가기',
            'courses.backHtml': '<i class="fa fa-arrow-left"></i> 인증서로 돌아가기',
            'leetcode.problem': '문제 설명',
            'leetcode.solution': '풀이 접근법',
            'leetcode.example': '예시:',
            'leetcode.python': 'Python 구현:',
            'leetcode.time': '시간 복잡도:',
            'leetcode.space': '공간 복잡도:',
            'product.movedTitle': '블로그 색인이 이동되었습니다',
            'product.movedCopyHtml': '글 색인은 이제 <a href="/blog/">https://yangmingli.com/blog/</a>에 있습니다.'
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
            'home.utility.title': '更多可以逛的内容',
            'home.utility.copy': '除了主要项目和工作内容，我也把学习笔记、随笔、小实验、投资笔记和证书放在这里。它们能补充说明我是怎么学习、思考和构建东西的。',
            'home.utility.note': '如果你是来看合作或招聘信息，可以先从关于、项目、博客、简历或联系开始；如果只是好奇，下面这些入口也欢迎继续探索。',
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
            'home.utility.title': 'D’autres choses à explorer',
            'home.utility.copy': 'En plus des projets et du travail principal, je garde ici mes notes d’étude, essais, petites expériences, notes d’investissement et certificats. Ils donnent plus de contexte sur ma façon d’apprendre, de réfléchir et de construire.',
            'home.utility.note': 'Si vous venez pour une collaboration ou un recrutement, commencez par À propos, Projets, Blog, CV ou Contact. Si vous êtes curieux, les autres liens sont aussi ouverts.',
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
            'home.utility.title': 'さらに見て回れる場所',
            'home.utility.copy': '主要な仕事やプロジェクトのほかに、学習ノート、エッセイ、小さな実験、投資メモ、証明書もここに置いています。学び方、考え方、作り方を知るための補足です。',
            'home.utility.note': '協業や採用のために来た方は、概要、プロジェクト、ブログ、履歴書、連絡先から見るのがおすすめです。気になる方は、ほかのリンクも自由に見てください。',
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
            'home.utility.title': 'Weitere Dinge zum Erkunden',
            'home.utility.copy': 'Neben den wichtigsten Arbeiten und Projekten sammle ich hier Studiennotizen, Essays, kleine Experimente, Investment-Notizen und Zertifikate. Sie geben mehr Kontext dazu, wie ich lerne, denke und baue.',
            'home.utility.note': 'Wenn es um Zusammenarbeit oder Recruiting geht, starten Sie am besten mit Über mich, Projekte, Blog, Lebenslauf oder Kontakt. Wenn Sie neugierig sind, sind die anderen Links ebenfalls offen.',
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
    MESSAGES.es['nav.all'] = 'Todo';
    MESSAGES.it['nav.all'] = 'Tutto';
    MESSAGES.ko['nav.all'] = '전체';
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
        if (lower.startsWith('es')) return 'es';
        if (lower.startsWith('it')) return 'it';
        if (lower.startsWith('ko')) return 'ko';
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
        if (lang === 'es') return `${count} ${count === 1 ? 'sección' : 'secciones'}`;
        if (lang === 'it') return `${count} ${count === 1 ? 'sezione' : 'sezioni'}`;
        if (lang === 'ko') return `${count}개 섹션`;
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
