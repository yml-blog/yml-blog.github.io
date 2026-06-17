const postMetadata = [
  {
    title: "RAG Evaluation Is Not a Score: How to Measure Retrieval, Generation, and System Reliability",
    href: "/rag-evaluation-not-a-score.html",
    date: "2026-06-16",
    summary:
      "A practical framework for measuring RAG retrieval quality, generation faithfulness, and system reliability across offline evaluation, online testing, and continuous monitoring.",
    tags: ["RAG evaluation", "retrieval evaluation", "faithfulness", "production AI"],
    area: "llm-evaluation",
    featured: true,
    readingTime: "12 min read",
    relatedProjects: ["llm-evaluation", "ai-engineering"],
    series: "RAG Evaluation",
    images: ["https://yangmingli.com/img/Logo.png"],
    canonicalUrl: "https://yangmingli.com/rag-evaluation-not-a-score.html"
  },
  {
    title: "A 90% Accurate Model That Still Loses Money: Why Churn Prediction Fails Without Uplift Thinking",
    href: "/churn-prediction-uplift-thinking.html",
    date: "2026-06-15",
    summary:
      "Why high-accuracy churn prediction can improve renewal rate while losing revenue, and how uplift thinking targets incremental renewals instead of risk scores.",
    tags: ["uplift modeling", "churn prediction", "experimentation", "retention"],
    area: "experimentation",
    featured: true,
    readingTime: "15 min read",
    relatedProjects: ["data-products", "ai-product-builder"],
    series: "Uplift Modeling",
    images: ["https://yangmingli.com/img/Logo.png"],
    canonicalUrl: "https://yangmingli.com/churn-prediction-uplift-thinking.html"
  },
  {
    title: "Beyond A/B Testing: A Practical Guide to Uplift Modeling in Industry",
    href: "/uplift-modeling-industry-guide.html",
    date: "2026-06-15",
    summary:
      "A practical guide to CATE, meta-learners, Qini, AUUC, decile lift, online experiments, and incremental ROI.",
    tags: ["uplift modeling", "causal inference", "experimentation", "marketing ROI"],
    area: "experimentation",
    featured: true,
    readingTime: "15 min read",
    relatedProjects: ["data-products", "ai-product-builder"],
    series: "Uplift Modeling",
    images: ["https://yangmingli.com/img/Logo.png"],
    canonicalUrl: "https://yangmingli.com/uplift-modeling-industry-guide.html"
  },
  {
    title: "AI Agent Evaluation Is More Important Than Prompting",
    href: "/ai-agents-evaluation-not-prompting.html",
    date: "2026-06-15",
    summary:
      "Why production AI agents need custom eval sets, trajectory checks, calibrated judges, regression tests, and business-ready metrics.",
    tags: ["AI agents", "LLM evaluation", "trajectory evaluation", "production AI"],
    area: "llm-evaluation",
    featured: true,
    readingTime: "9 min read",
    relatedProjects: ["ai-engineering", "case-studies"],
    series: "AI Agent Evaluation",
    images: ["https://yangmingli.com/img/Logo.png"],
    canonicalUrl: "https://yangmingli.com/ai-agents-evaluation-not-prompting.html"
  },
  {
    title: "Testing and Evaluating Copilot Agents",
    href: "/testing-evaluating-copilot-agents.html",
    date: "2026-05-25",
    summary:
      "A schema-first guide to testing Copilot Studio agents with evaluation sets, custom graders, validation gates, human review, and monitoring.",
    tags: ["agent evaluation", "Copilot Studio", "release gates", "schema validation"],
    area: "llm-evaluation",
    featured: true,
    readingTime: "12 min read",
    relatedProjects: ["ai-engineering", "case-studies"],
    series: "AI Agent Evaluation",
    images: ["https://yangmingli.com/img/Logo.png"],
    canonicalUrl: "https://yangmingli.com/testing-evaluating-copilot-agents.html"
  },
  {
    title: "AI Agent Evaluation Checklist",
    href: "/ai-agent-evaluation-checklist.html",
    date: "2026-06-12",
    summary:
      "A practical launch checklist for evaluating Copilot Studio, RAG, document AI, and enterprise AI agents before production.",
    tags: ["AI agents", "evaluation", "launch checklist", "production AI"],
    area: "case-studies",
    featured: true,
    readingTime: "6 min read",
    relatedProjects: ["llm-evaluation", "ai-engineering"],
    series: "AI Agent Evaluation",
    images: ["https://yangmingli.com/img/Logo.png"],
    canonicalUrl: "https://yangmingli.com/ai-agent-evaluation-checklist.html"
  },
  {
    title: "Model Context Protocol Guide",
    href: "/mcp-protocol-guide.html",
    date: "2025-06-01",
    summary:
      "How connected AI tools use external data, tools, services, and protocol boundaries for production workflows.",
    tags: ["MCP", "tool use", "LLM systems", "AI engineering"],
    area: "ai-engineering",
    featured: true,
    readingTime: "14 min read",
    relatedProjects: ["ai-engineering"],
    series: "AI Systems",
    images: ["https://yangmingli.com/img/Logo.png"],
    canonicalUrl: "https://yangmingli.com/mcp-protocol-guide.html"
  },
  {
    title: "Agentic AI Systems with n8n",
    href: "/n8n-ai-workflows.html",
    date: "2025-05-01",
    summary:
      "A technical guide to agent architecture, workflow automation, tool use, and production integration constraints.",
    tags: ["agentic AI", "workflow automation", "n8n", "AI engineering"],
    area: "ai-engineering",
    featured: false,
    readingTime: "13 min read",
    relatedProjects: ["ai-engineering"],
    series: "AI Systems",
    images: ["https://yangmingli.com/img/Logo.png"],
    canonicalUrl: "https://yangmingli.com/n8n-ai-workflows.html"
  },
  {
    title: "LlamaReport and Document AI Systems",
    href: "/llama-report-guide.html",
    date: "2025-05-01",
    summary:
      "A guide to building document-processing AI agents using LlamaReport, LlamaCloud, and reviewable transformation workflows.",
    tags: ["document AI", "RAG", "AI agents", "enterprise AI"],
    area: "ai-engineering",
    featured: false,
    readingTime: "11 min read",
    relatedProjects: ["ai-engineering", "case-studies"],
    series: "Document AI",
    images: ["https://yangmingli.com/img/Logo.png"],
    canonicalUrl: "https://yangmingli.com/llama-report-guide.html"
  },
  {
    title: "Uncertainty Quantification for LLMs with UQLM",
    href: "/uqlm-teaching-guide.html",
    date: "2025-05-01",
    summary:
      "A hands-on teaching guide for using UQLM to quantify and understand uncertainty in large language models.",
    tags: ["uncertainty", "LLM evaluation", "UQLM", "model confidence"],
    area: "llm-evaluation",
    featured: false,
    readingTime: "10 min read",
    relatedProjects: ["llm-evaluation"],
    series: "LLM Evaluation",
    images: ["https://yangmingli.com/img/Logo.png"],
    canonicalUrl: "https://yangmingli.com/uqlm-teaching-guide.html"
  },
  {
    title: "Databricks Lakehouse Guide",
    href: "/databricks-comprehensive-guide.html",
    date: "2024-07-01",
    summary:
      "Delta Lake, MLflow, Unity Catalog, and data platform implementation notes for analytics and ML systems.",
    tags: ["Databricks", "data engineering", "MLflow", "data platform"],
    area: "data-products",
    featured: true,
    readingTime: "16 min read",
    relatedProjects: ["data-products"],
    series: "Data Platforms",
    images: ["https://yangmingli.com/img/Logo.png"],
    canonicalUrl: "https://yangmingli.com/databricks-comprehensive-guide.html"
  },
  {
    title: "A/B Test Engineering Guide",
    href: "/engineering/ab-test-engineering-guide.html",
    date: "2024-07-01",
    summary:
      "Feature gates, experiments, reliable launch measurement, and experimentation infrastructure for product teams.",
    tags: ["A/B testing", "experimentation", "product analytics", "engineering"],
    area: "experimentation",
    featured: true,
    readingTime: "10 min read",
    relatedProjects: ["data-products", "ai-product-builder"],
    series: "Experimentation",
    images: ["https://yangmingli.com/img/Logo.png"],
    canonicalUrl: "https://yangmingli.com/engineering/ab-test-engineering-guide.html"
  },
  {
    title: "Key Statistical Tests for Survey Analysis",
    href: "/key-statistical-tests-survey-analysis.html",
    date: "2025-05-01",
    summary:
      "A practical guide to choosing statistical tests and interpreting experiment-style evidence.",
    tags: ["statistics", "experimentation", "survey analysis", "analytics"],
    area: "data-products",
    featured: false,
    readingTime: "12 min read",
    relatedProjects: ["data-products"],
    series: "Analytics",
    images: ["https://yangmingli.com/img/Logo.png"],
    canonicalUrl: "https://yangmingli.com/key-statistical-tests-survey-analysis.html"
  },
  {
    title: "Healthcare AI Analytics",
    href: "/healthcare-ai-analytics.html",
    date: "2025-05-01",
    summary:
      "Applied AI and analytics framing for healthcare operations, decision support, and data product thinking.",
    tags: ["healthcare analytics", "AI analytics", "decision support", "case studies"],
    area: "case-studies",
    featured: false,
    readingTime: "8 min read",
    relatedProjects: ["data-products", "case-studies"],
    series: "Applied Analytics",
    images: ["https://yangmingli.com/img/Logo.png"],
    canonicalUrl: "https://yangmingli.com/healthcare-ai-analytics.html"
  },
  {
    title: "Building High-Impact Value Propositions",
    href: "/building-high-impact-value-propositions.html",
    date: "2025-05-01",
    summary:
      "A practical framework for defining, validating, and communicating product value.",
    tags: ["product thinking", "value proposition", "AI product builder", "strategy"],
    area: "ai-product-builder",
    featured: true,
    readingTime: "11 min read",
    relatedProjects: ["ai-product-builder"],
    series: "Product Thinking",
    images: ["https://yangmingli.com/img/Logo.png"],
    canonicalUrl: "https://yangmingli.com/building-high-impact-value-propositions.html"
  },
  {
    title: "Building a Product That Scales With the Company",
    href: "/building-product-scales-company.html",
    date: "2025-05-01",
    summary:
      "Product strategy notes on durable foundations, adoption, operational fit, and scaling constraints.",
    tags: ["product strategy", "product thinking", "scaling", "AI product builder"],
    area: "ai-product-builder",
    featured: false,
    readingTime: "10 min read",
    relatedProjects: ["ai-product-builder"],
    series: "Product Thinking",
    images: ["https://yangmingli.com/img/Logo.png"],
    canonicalUrl: "https://yangmingli.com/building-product-scales-company.html"
  },
  {
    title: "What Makes Products Successful?",
    href: "/product-success-essence.html",
    date: "2024-06-29",
    summary:
      "Notes on user needs, stickiness, product experience, and durable product adoption.",
    tags: ["product thinking", "product management", "user value"],
    area: "product-thinking",
    featured: false,
    readingTime: "9 min read",
    relatedProjects: ["ai-product-builder"],
    series: "Product Thinking",
    images: ["https://yangmingli.com/img/Logo.png"],
    canonicalUrl: "https://yangmingli.com/product-success-essence.html"
  },
  {
    title: "MLOps Essential Skills",
    href: "/mlops-essential-skills.html",
    date: "2024-06-30",
    summary:
      "Model management and deployment foundations for production ML work.",
    tags: ["MLOps", "production ML", "deployment", "monitoring"],
    area: "ai-engineering",
    featured: false,
    readingTime: "18 min read",
    relatedProjects: ["ai-engineering"],
    series: "MLOps",
    images: ["https://yangmingli.com/img/Logo.png"],
    canonicalUrl: "https://yangmingli.com/mlops-essential-skills.html"
  }
]

if (typeof module !== "undefined") {
  module.exports = postMetadata
}
