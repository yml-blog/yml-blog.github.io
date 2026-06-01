#!/usr/bin/env python3
"""One-time static SEO pass for yangmingli.com.

The site is intentionally plain HTML. This script keeps the changes static:
it writes pillar pages, normalizes metadata and schema, and adds crawlable
navigation blocks without introducing a framework.
"""

from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path
from urllib.parse import unquote, urlparse

from bs4 import BeautifulSoup

try:
    from PIL import Image
except Exception:  # pragma: no cover - image dimensions are best effort.
    Image = None


ROOT = Path(__file__).resolve().parents[1]
BASE_URL = "https://yangmingli.com"
TODAY = date(2026, 5, 31).isoformat()

EXCLUDE_DIRS = {
    ".git",
    "__pycache__",
    "templates",
    "email-templates",
    "nha-cai",
}
EXCLUDE_FILES = {"google6a208e5b3409387b.html", "readme.htm"}

CORE_PAGES = {
    "index.html",
    "about.html",
    "projects.html",
    "resume.html",
    "contact.html",
    "courses.html",
    "blog/index.html",
    "focus-room/index.html",
}

PILLAR_PATHS = {
    "ai-engineering/index.html",
    "machine-learning-nlp.html",
    "data-products.html",
    "ai-product-builder.html",
    "healthcare-ai-analytics.html",
    "llm-evaluation.html",
}

NOINDEX_CANONICALS = {
    "product/index.html": f"{BASE_URL}/blog/",
    "focus-room/v1/index.html": f"{BASE_URL}/focus-room/",
    "sentiment-analysis-fine-tune-with-bert2.html": f"{BASE_URL}/sentiment-analysis-fine-tune-with-bert.html",
}

SITE_LINKS = [
    ("About", "/about.html"),
    ("Projects", "/projects.html"),
    ("AI Engineering", "/ai-engineering/"),
    ("LLM Evaluation", "/llm-evaluation.html"),
    ("Machine Learning & NLP", "/machine-learning-nlp.html"),
    ("Data Products", "/data-products.html"),
    ("AI Product Builder", "/ai-product-builder.html"),
    ("Blog", "/blog/"),
    ("Resume", "/resume.html"),
    ("Contact", "/contact.html"),
    ("LinkedIn", "https://www.linkedin.com/in/yangming-li-tech/"),
    ("GitHub", "https://github.com/yml-blog"),
]

CUSTOM_META: dict[str, dict[str, str | list[str]]] = {
    "index.html": {
        "title": "Yangming Li | Applied AI Engineer, Data Scientist, AI Product Builder",
        "description": "Yangming Li is an applied AI engineer, data scientist, and AI product builder writing about LLM systems, RAG, evaluation, NLP, data products, and ML.",
        "section": "Home",
        "keywords": ["Yangming Li", "Applied AI", "AI Engineer", "Data Scientist", "AI Product Builder"],
    },
    "about.html": {
        "title": "About Yangming Li | Applied AI Engineer and Data Scientist",
        "description": "Learn about Yangming Li's focus in applied AI, LLM systems, statistical machine learning, NLP, data engineering, data products, and AI product thinking.",
        "section": "About",
        "keywords": ["Yangming Li", "Applied AI Engineer", "Data Scientist", "AI Product Builder"],
    },
    "projects.html": {
        "title": "Projects | Yangming Li Applied AI and Data Products",
        "description": "Explore Yangming Li's project themes across applied AI systems, data products, document intelligence, MLOps, experimentation, and product engineering.",
        "section": "Projects",
        "keywords": ["AI projects", "data products", "AI product builder portfolio", "Yangming Li"],
    },
    "resume.html": {
        "title": "Resume | Yangming Li, Applied AI Engineer and Product Builder",
        "description": "Read Yangming Li's resume overview across applied AI engineering, data science, LLM systems, statistical ML, data products, MLOps, and product work.",
        "section": "Resume",
        "keywords": ["Yangming Li resume", "AI engineer", "data scientist", "product builder"],
    },
    "contact.html": {
        "title": "Contact Yangming Li | Applied AI, Data Science, Product Work",
        "description": "Contact Yangming Li for conversations about applied AI systems, LLM evaluation, data science, data products, product analytics, and technical collaboration.",
        "section": "Contact",
        "keywords": ["contact Yangming Li", "Applied AI", "data science", "product analytics"],
    },
    "blog/index.html": {
        "title": "Blog | Yangming Li on AI, Data Science, Product, Engineering",
        "description": "Browse Yangming Li's writing on applied AI, LLM systems, RAG evaluation, statistical machine learning, NLP, data products, MLOps, and product strategy.",
        "section": "Blog",
        "keywords": ["Yangming Li blog", "applied AI", "machine learning", "data products", "LLM evaluation"],
    },
    "courses.html": {
        "title": "Courses and Certificates | Yangming Li",
        "description": "Review Yangming Li's course notes and certificates across machine learning, data science, MLOps, software engineering, Python, Docker, and AI systems.",
        "section": "Learning",
        "keywords": ["Yangming Li courses", "machine learning certificates", "MLOps", "data science"],
    },
    "focus-room/index.html": {
        "title": "Focus Room | Deep Work Focus App and Ambient Study Room | Yangming Li",
        "description": "Focus Room is a SwiftUI deep work focus app prototype with a calm entry ritual, ambient sound mixer, subtle timer, fullscreen study room, and writing mode.",
        "section": "Product",
        "keywords": ["Focus Room", "deep work focus app", "ambient study room", "SwiftUI prototype", "Yangming Li"],
    },
    "testing-evaluating-copilot-agents.html": {
        "title": "Testing and Evaluating Copilot Agents | Yangming Li",
        "description": "Evaluate Copilot Studio agents with schema validation, golden test sets, custom graders, human review, analytics, and release gates for AI systems.",
        "section": "AI Engineering",
        "keywords": ["Copilot Studio agent evaluation", "LLM evaluation framework", "schema validation for AI agents", "RAG evaluation"],
    },
    "uqlm-teaching-guide.html": {
        "title": "Uncertainty Quantification for LLMs with UQLM | Yangming Li",
        "description": "A practical guide to uncertainty quantification for LLMs using UQLM, with scoring methods, teaching exercises, confidence trade-offs, and monitoring ideas.",
        "section": "LLM Evaluation",
        "keywords": ["uncertainty quantification for LLMs", "UQLM", "LLM evaluation", "AI monitoring"],
    },
    "trust-worth-machine-learning-1.html": {
        "title": "Trustworthy Machine Learning Guide | Yangming Li",
        "description": "Notes on trustworthy machine learning across transparency, fairness, privacy, robustness, accountability, monitoring, and responsible AI system design.",
        "section": "Machine Learning & NLP",
        "keywords": ["trustworthy machine learning", "responsible AI", "ML monitoring", "model robustness"],
    },
    "cmu-nlp-notes.html": {
        "title": "Advanced NLP Notes | Yangming Li",
        "description": "Study notes on advanced NLP concepts, language modeling, representation learning, sequence models, transformers, evaluation, and practical text systems.",
        "section": "Machine Learning & NLP",
        "keywords": ["NLP", "healthcare NLP topic modeling", "topic modeling", "language models"],
    },
    "sentiment-analysis-fine-tune-with-bert.html": {
        "title": "Fine-Tune BERT for Sentiment Analysis | Yangming Li",
        "description": "A practical BERT sentiment analysis guide covering PEFT, LoRA, data preparation, tokenization, training, evaluation, and production workflow trade-offs.",
        "section": "Machine Learning & NLP",
        "keywords": ["BERT sentiment analysis", "fine tuning", "NLP", "PEFT", "LoRA"],
    },
    "sentiment-analysis-fine-tune-with-bert2.html": {
        "title": "BERT Sentiment Analysis Article Moved | Yangming Li",
        "description": "This duplicate BERT sentiment analysis page has moved to the canonical Yangming Li guide on fine-tuning BERT with PEFT, LoRA, and evaluation notes.",
        "section": "Machine Learning & NLP",
        "keywords": ["BERT sentiment analysis", "canonical article", "NLP"],
    },
    "n8n-ai-workflows.html": {
        "title": "Agentic AI Workflows with n8n | Yangming Li",
        "description": "Design agentic AI workflows with n8n, including tool orchestration, workflow boundaries, evaluation, monitoring, failure modes, and production constraints.",
        "section": "AI Engineering",
        "keywords": ["agentic AI workflows", "AI agents", "workflow automation", "AI engineering"],
    },
    "mcp-protocol-guide.html": {
        "title": "Model Context Protocol Guide | Yangming Li",
        "description": "A practical MCP guide for connected AI systems, tool calls, context boundaries, integration design, security considerations, and production AI workflows.",
        "section": "AI Engineering",
        "keywords": ["Model Context Protocol", "MCP", "AI tools", "LLM systems"],
    },
    "llama-report-guide.html": {
        "title": "LlamaReport and Document AI Systems | Yangming Li",
        "description": "Explore document transformation with LlamaReport and LlamaCloud, including architecture notes for retrieval, review workflows, and enterprise AI systems.",
        "section": "AI Engineering",
        "keywords": ["document AI", "RAG", "LlamaReport", "AI engineering"],
    },
    "mlops-essential-skills.html": {
        "title": "MLOps Essential Skills | Yangming Li",
        "description": "A practical MLOps guide covering model packaging, deployment, monitoring, data quality, feature stores, experiment tracking, and production ML operations.",
        "section": "AI Engineering",
        "keywords": ["MLOps", "production ML", "model monitoring", "data products"],
    },
    "databricks-comprehensive-guide.html": {
        "title": "Databricks Lakehouse Guide | Yangming Li",
        "description": "Learn Databricks lakehouse concepts including Delta Lake, MLflow, Unity Catalog, data engineering workflows, governance, and practical platform patterns.",
        "section": "Data Products",
        "keywords": ["Databricks", "data engineering", "data products", "MLflow"],
    },
    "docker-in-ml.html": {
        "title": "Docker for Machine Learning | Yangming Li",
        "description": "Use Docker for reproducible machine learning workflows, environment isolation, dependency management, model serving, and production ML collaboration.",
        "section": "AI Engineering",
        "keywords": ["Docker", "machine learning", "MLOps", "reproducibility"],
    },
    "random-forest-guide.html": {
        "title": "Random Forest Guide | Yangming Li",
        "description": "Understand random forests with practical notes on ensembles, feature importance, variance reduction, evaluation, limitations, and applied ML trade-offs.",
        "section": "Machine Learning & NLP",
        "keywords": ["random forest", "machine learning", "model evaluation", "statistical ML"],
    },
    "key-statistical-tests-survey-analysis.html": {
        "title": "Statistical Tests for Survey Analysis | Yangming Li",
        "description": "A practical guide to statistical tests for survey analysis, covering assumptions, comparisons, effect sizes, interpretation, and data product decisions.",
        "section": "Data Products",
        "keywords": ["statistical tests", "survey analysis", "data products", "experiment infrastructure"],
    },
    "building-high-impact-value-propositions.html": {
        "title": "Building High-Impact Value Propositions | Yangming Li",
        "description": "A product framework for defining high-impact value propositions, validating user problems, shaping product strategy, and connecting evidence to decisions.",
        "section": "Product Strategy",
        "keywords": ["value proposition", "AI product builder", "product strategy", "data products"],
    },
    "building-product-scales-company.html": {
        "title": "Building a Product That Scales into a Company | Yangming Li",
        "description": "Product strategy notes on moving from a useful product idea to a scalable company, including users, urgency, unit economics, workflow, and defensibility.",
        "section": "Product Strategy",
        "keywords": ["product builder", "AI product builder portfolio", "product strategy"],
    },
    "product-success-essence.html": {
        "title": "What Makes Products Successful? | Yangming Li",
        "description": "A practical product strategy note on user needs, product quality, adoption, retention, trade-offs, and the habits behind durable product success.",
        "section": "Product Strategy",
        "keywords": ["product success", "product strategy", "AI product builder"],
    },
}


PILLARS = {
    "ai-engineering/index.html": {
        "url_path": "/ai-engineering/",
        "title": "AI Engineering | Yangming Li Applied AI Systems",
        "description": "Yangming Li's AI engineering pillar on LLM systems, RAG, agent evaluation, MLOps, schema validation, observability, and production AI architecture.",
        "eyebrow": "Pillar Page",
        "h1": "AI Engineering",
        "lead": "A crawlable guide to Yangming Li's applied AI engineering focus: LLM systems, retrieval, evaluation, data contracts, MLOps, observability, and the practical work that turns prototypes into reliable products.",
        "sections": [
            (
                "Start here",
                """
                <p>Start with the engineering question behind any AI product: what should the system be allowed to do, how will the output be checked, and what evidence would convince a reviewer that it is ready to ship? Yangming Li's writing treats AI engineering as more than prompt craft. It includes data preparation, retrieval architecture, tool boundaries, schema validation, release gates, human review, and monitoring after launch.</p>
                <p>If you are new to this site, read the Copilot agent evaluation article first, then move to the Model Context Protocol and MLOps notes. Those pieces show the same pattern from different angles: useful AI systems need contracts, test cases, operational feedback, and clear ownership.</p>
                """,
            ),
            (
                "What AI engineering means on this site",
                """
                <p>AI engineering sits between machine learning research, software engineering, data engineering, and product design. The model is only one component. A dependable system also needs a knowledge source strategy, a permission model, a data quality story, a review process, and a plan for drift. For LLM applications, the failure modes are often product failures as much as model failures: the agent answers the wrong question, calls the wrong tool, extracts fields in an unusable shape, or produces output that looks plausible but cannot be audited.</p>
                <p>The practical lens here is deliberately conservative. A retrieval or agent workflow should prefer explicit contracts over vague expectations. A structured extraction task should validate JSON before downstream systems touch it. A RAG application should track source coverage and citation quality, not just answer fluency. A product feature should define escalation paths for low confidence, missing evidence, policy conflicts, and ambiguous user intent.</p>
                """,
            ),
            (
                "Architecture notes",
                """
                <p>A healthy production AI architecture separates concerns. The application layer owns user experience and workflow boundaries. The orchestration layer owns prompts, tools, schemas, and routing. The retrieval layer owns chunking, indexing, ranking, grounding, and source metadata. The evaluation layer owns fixtures, graders, regression checks, and release gates. The monitoring layer watches quality, cost, latency, refusal patterns, user corrections, and incidents.</p>
                <p>This separation matters because AI systems change frequently. Model settings change, prompts change, knowledge sources change, tool permissions change, and downstream schemas change. Without versioned configuration and repeatable evaluation, teams only discover regressions through user complaints. A lighter but better default is to treat each meaningful change as a release: run smoke cases, run challenge cases, validate schema output, review samples, and record what changed.</p>
                """,
            ),
            (
                "Evaluation checklist",
                """
                <ul>
                  <li>Define the user task, the allowed sources, the output contract, and the action boundary.</li>
                  <li>Build smoke tests for ordinary cases and challenge tests for ambiguity, missing evidence, adversarial wording, and no-answer cases.</li>
                  <li>Use deterministic validators for structure, required fields, ranges, and business rules before using model-based graders.</li>
                  <li>Measure answer quality, source grounding, schema validity, latency, cost, escalation rate, and human correction rate.</li>
                  <li>Document rollback conditions and keep human review where incorrect automation would create operational risk.</li>
                </ul>
                """,
            ),
            (
                "Common production failure modes",
                """
                <p>The most useful AI engineering reviews look for boring but expensive failures. A retrieval workflow can silently answer from stale or incomplete sources. An agent can call the right tool with the wrong arguments. A structured extraction system can produce valid JSON that is semantically wrong. A summarizer can erase uncertainty and make weak evidence sound certain. A product can also fail because the review queue, access model, or escalation path was never designed.</p>
                <p>These failures are not solved by a better prompt alone. They need layered controls: source freshness checks, schema validators, deterministic business rules, sample review, prompt and configuration versioning, and incident examples that become regression tests. When a team can explain what broke, which version broke it, and which test will prevent it next time, the AI system starts to behave like an engineered product rather than a one-off experiment.</p>
                """,
            ),
            (
                "Related implementation examples",
                """
                <p>A small but realistic implementation might combine a retrieval index, a structured response schema, a validation function, a human review screen, and an evaluation notebook. Another example might connect an agent to a workflow tool but keep writes behind an approval step. A third might score LLM output uncertainty and route low-confidence answers to review. The specific stack can change; the engineering habit is the same: make assumptions explicit, make outputs inspectable, and make regressions repeatable.</p>
                """,
            ),
            (
                "Related writing",
                """
                <p>The related articles below connect architecture to implementation. They cover Copilot Studio evaluation, uncertainty quantification for LLMs, MCP integration, agentic workflows, document AI, MLOps, and Docker-based reproducibility. Together they form a practical map for moving from an impressive demo to a system that can be reviewed, monitored, and improved.</p>
                """,
            ),
        ],
        "related": [
            ("Testing and evaluating Copilot agents", "/testing-evaluating-copilot-agents.html", "Schema-first evaluation and release gates for agent workflows."),
            ("LLM evaluation", "/llm-evaluation.html", "Evaluation patterns for RAG, agents, structured extraction, and uncertainty."),
            ("Model Context Protocol guide", "/mcp-protocol-guide.html", "Tool and context integration patterns for connected AI systems."),
            ("MLOps essential skills", "/mlops-essential-skills.html", "Production ML delivery, monitoring, and operational foundations."),
        ],
    },
    "llm-evaluation.html": {
        "url_path": "/llm-evaluation.html",
        "title": "LLM Evaluation Frameworks, RAG Evaluation, and AI Agent Testing | Yangming Li",
        "description": "A practical Yangming Li pillar on LLM evaluation frameworks, RAG evaluation, schema validation, agent testing, uncertainty, release gates, and monitoring.",
        "eyebrow": "Pillar Page",
        "h1": "LLM Evaluation",
        "lead": "A practical pillar page for evaluating LLM systems, RAG workflows, Copilot-style agents, structured extraction, uncertainty, schema validation, and production monitoring.",
        "sections": [
            (
                "Start here",
                """
                <p>LLM evaluation should begin with the product risk, not with a leaderboard metric. A chat assistant, a retrieval answer system, a document extraction workflow, and an agent that calls tools all fail differently. The evaluation design has to match the failure mode. Yangming Li's writing emphasizes repeatable test sets, explicit output contracts, deterministic validators, human review, and monitoring after launch.</p>
                <p>Start with a small golden set: ordinary examples that must pass, edge cases that reveal ambiguity, and no-answer cases that punish invention. Then add graders only after the contract is clear. Model-based graders can help with semantic comparison, but schema validation, exact matching, source checks, and business rules should carry the first layer of trust.</p>
                """,
            ),
            (
                "A useful LLM evaluation framework",
                """
                <p>A useful framework has four layers. The first layer is task definition: what the user is trying to accomplish, what sources are allowed, what the model may produce, and when it must refuse or escalate. The second layer is test data: stable fixtures, expected outputs, scenario labels, and reasons each case exists. The third layer is grading: exact match for canonical fields, schema validation for structure, retrieval checks for grounding, semantic comparison for meaning, and custom rules for product constraints. The fourth layer is operations: dashboards, regression history, sampled human review, incident notes, and release decisions.</p>
                <p>This structure keeps evaluation from becoming a single score detached from reality. A system can be fluent and still unsafe. It can retrieve a relevant source and still misread it. It can produce valid JSON and still choose the wrong category. Good evaluation makes those differences visible.</p>
                """,
            ),
            (
                "RAG evaluation",
                """
                <p>RAG evaluation needs to inspect both retrieval and generation. Retrieval quality asks whether the system found the right evidence: source recall, chunk relevance, metadata quality, freshness, deduplication, and access control. Generation quality asks whether the answer used the evidence correctly: factual consistency, citation coverage, answer completeness, uncertainty handling, and refusal behavior when the corpus does not support an answer.</p>
                <p>The most common production failure modes are quiet. The system may answer from an outdated chunk, cite a source that only partially supports the claim, summarize across conflicting documents without saying so, or retrieve from the right domain but the wrong policy version. A RAG test set should include stale documents, conflicting sources, missing evidence, ambiguous acronyms, and questions where the correct answer is to ask for clarification.</p>
                """,
            ),
            (
                "Schema validation for AI agents",
                """
                <p>Agent evaluation becomes much clearer when the output is structured. If an agent extracts events, writes tickets, updates a tracker, or routes a request, the response should pass a contract before it can affect downstream systems. JSON schema validation can check required fields, enums, date formats, null handling, array lengths, and field-level descriptions. Deterministic checks can then enforce business rules that are not purely syntactic.</p>
                <p>This is not only a backend concern. The schema is also a product artifact. It tells reviewers what the agent is trying to do, shows where uncertainty belongs, and makes human corrections reusable as evaluation data. The agent can draft; the reviewer decides.</p>
                """,
            ),
            (
                "Common production failure modes",
                """
                <p>Evaluation should deliberately search for near misses. In RAG, a near miss might retrieve the right policy family but the wrong version. In extraction, it might choose a plausible category that does not match the approved taxonomy. In an agent workflow, it might call a tool successfully while using a stale assumption. These failures are dangerous because they look professional in a demo and only become obvious when a reviewer checks evidence.</p>
                <p>A good LLM evaluation framework therefore includes negative cases, no-answer cases, conflict cases, malformed inputs, and examples where the correct behavior is escalation. It also keeps track of why a case exists. Without that reason, future maintainers may delete the exact scenario that protects the system from repeating an old incident.</p>
                """,
            ),
            (
                "Architecture notes",
                """
                <p>For a lightweight implementation, store evaluation cases as versioned data with fields for scenario, input, expected behavior, grading method, and failure rationale. Run deterministic checks first because they are cheap and explainable. Then use model-based graders for semantic comparison where exact matching is too brittle. Keep the results linked to prompt versions, model settings, retrieval index versions, and schema versions so a regression can be traced to a real change.</p>
                """,
            ),
            (
                "What to monitor after launch",
                """
                <ul>
                  <li>Schema validity, empty-output rate, escalation rate, and human correction rate.</li>
                  <li>Retrieval source coverage, citation quality, stale-source usage, and no-answer behavior.</li>
                  <li>Latency, token cost, tool-call failures, timeout rate, and retry patterns.</li>
                  <li>Regression results by scenario, prompt version, model setting, and knowledge-source version.</li>
                  <li>User feedback, reviewer disagreement, incident notes, and examples that should become new tests.</li>
                </ul>
                """,
            ),
        ],
        "related": [
            ("Testing and evaluating Copilot agents", "/testing-evaluating-copilot-agents.html", "A concrete agent testing workflow with schema contracts and release gates."),
            ("Uncertainty quantification for LLMs", "/uqlm-teaching-guide.html", "Confidence and uncertainty signals for safer LLM review workflows."),
            ("AI Engineering", "/ai-engineering/", "The broader production AI architecture pillar."),
            ("Model Context Protocol guide", "/mcp-protocol-guide.html", "Integration boundaries for tool-connected AI systems."),
        ],
    },
    "machine-learning-nlp.html": {
        "url_path": "/machine-learning-nlp.html",
        "title": "Machine Learning and NLP | Yangming Li",
        "description": "Yangming Li's machine learning and NLP pillar covering statistical ML, topic modeling, sentiment analysis, trustworthy ML, healthcare text analytics, and evaluation.",
        "eyebrow": "Pillar Page",
        "h1": "Machine Learning and NLP",
        "lead": "A guide to Yangming Li's writing on statistical machine learning, natural language processing, topic modeling, sentiment analysis, trustworthy ML, and practical text analytics.",
        "sections": [
            (
                "Start here",
                """
                <p>Machine learning and NLP on this site are treated as applied systems work. The goal is not only to understand a model family, but to understand when it is useful, how to evaluate it, how it fails, and how it connects to a product or decision workflow. Start with the trustworthy machine learning notes for the reliability lens, then read the NLP notes, BERT fine-tuning article, and statistical testing guide for implementation context.</p>
                <p>The recurring theme is that useful models need measurement. A classifier needs error analysis and calibration, not just accuracy. A topic model needs human interpretation and stability checks, not just clusters. A text analytics workflow needs sampling, review, and monitoring because language changes over time.</p>
                """,
            ),
            (
                "Statistical ML and NLP focus",
                """
                <p>Yangming Li's machine learning writing spans classic ML, deep learning, NLP, and evaluation. The site includes practical notes on random forests, generalized linear models, deep neural networks, BERT sentiment analysis, CMU NLP study notes, trustworthy machine learning, and uncertainty quantification for LLMs. The common thread is applied judgment: knowing what the model is estimating, what assumptions are being made, and how errors would affect a real workflow.</p>
                <p>For text systems, the useful questions are often operational. What labels are reliable enough to train against? Which examples are ambiguous? How will the system handle new vocabulary, domain-specific phrasing, multilingual text, or short complaint snippets? How should reviewers correct the model, and how should those corrections become training or evaluation data?</p>
                """,
            ),
            (
                "Healthcare NLP and complaint theme discovery",
                """
                <p>Healthcare NLP and complaint theme discovery are good examples of why text analytics needs careful framing. A workflow might help summarize themes, route issues, or identify emerging categories, but it should not pretend that unsupervised clusters are facts. Topic modeling can reveal candidate themes; human reviewers still need to name, merge, split, and validate those themes. Classifiers can support triage; monitoring should watch for drift, underrepresented categories, and phrases that change meaning across contexts.</p>
                <p>A practical architecture would keep raw text, normalized text, model outputs, reviewer labels, theme definitions, and evaluation examples separate. That separation makes audits easier and keeps the product from confusing a model suggestion with a verified truth.</p>
                """,
            ),
            (
                "Evaluation checklist",
                """
                <ul>
                  <li>Define the task as classification, extraction, ranking, summarization, clustering, or review support.</li>
                  <li>Measure performance by slice: class, source, time period, text length, language, and reviewer confidence.</li>
                  <li>Use confusion matrices, calibration checks, stability tests, and representative error examples.</li>
                  <li>Track label quality, missing classes, drift, and changes in user vocabulary.</li>
                  <li>Keep human-readable explanations and reviewer corrections connected to the evaluation set.</li>
                </ul>
                """,
            ),
            (
                "Related implementation examples",
                """
                <p>A complaint theme discovery workflow might begin with unsupervised clustering or embeddings to surface candidate groups. The implementation should then move quickly into human review: name each theme, attach examples, mark ambiguous comments, and decide whether the theme is stable enough to become a label. A supervised classifier can be trained only after those labels have operational meaning.</p>
                <p>A sentiment analysis workflow has a different shape. It needs representative labels, clear handling for neutral or mixed sentiment, evaluation by slice, and a plan for drift. A BERT or PEFT-based model may be appropriate when context matters, but the product still needs a fallback for low-confidence text and a review process for examples that carry business risk.</p>
                <p>A trustworthy ML review should ask whether the model is understandable enough for its use, whether groups are harmed differently, whether data handling is appropriate, and whether monitoring can detect degradation before users lose trust. These questions are part of the system, not a final compliance pass.</p>
                """,
            ),
            (
                "Trade-offs and limitations",
                """
                <p>ML and NLP systems are only as useful as their measurement and feedback loop. More complex models may improve representation but increase cost, latency, and debugging difficulty. Simpler models may be easier to explain but miss subtle context. Topic models can discover patterns but can also create unstable or misleading themes. LLMs can summarize and reason over text but require grounding, uncertainty handling, and review for sensitive workflows.</p>
                <p>The practical compromise is to match the model to the review burden. If the workflow needs transparent categories, a simpler classifier with strong error analysis may beat a larger model. If the workflow needs rich language understanding, a transformer or LLM can help, but the product should budget for evaluation data, monitoring, and reviewer feedback from the start.</p>
                """,
            ),
        ],
        "related": [
            ("Trustworthy machine learning", "/trust-worth-machine-learning-1.html", "Responsible AI notes on transparency, fairness, privacy, robustness, and accountability."),
            ("BERT sentiment analysis", "/sentiment-analysis-fine-tune-with-bert.html", "Fine-tuning BERT with PEFT, LoRA, and evaluation notes."),
            ("Advanced NLP notes", "/cmu-nlp-notes.html", "Study notes across language models, sequence modeling, and NLP foundations."),
            ("Healthcare AI analytics", "/healthcare-ai-analytics.html", "Text analytics, theme discovery, and evaluation for healthcare-style workflows."),
        ],
    },
    "data-products.html": {
        "url_path": "/data-products.html",
        "title": "Data Products and AI Data Products | Yangming Li",
        "description": "Yangming Li's data products pillar covering analytics systems, AI data products, data engineering, experiments, decision support, monitoring, and product workflows.",
        "eyebrow": "Pillar Page",
        "h1": "Data Products",
        "lead": "A crawlable guide to Yangming Li's writing on data products, AI data products, analytics systems, experimentation, data engineering, and decision-support workflows.",
        "sections": [
            (
                "Start here",
                """
                <p>A data product is not a dashboard with a nicer name. It is a workflow that turns data into a decision, action, or repeatable operating habit. Yangming Li's writing connects data engineering, statistics, product design, and AI systems because data products usually fail at the boundaries: unclear users, weak definitions, stale data, missing ownership, or outputs that do not fit the next step.</p>
                <p>Start with the product strategy articles for the user and workflow lens, then read the Databricks, MLOps, statistical testing, and A/B testing notes for implementation depth.</p>
                """,
            ),
            (
                "What makes a data product useful",
                """
                <p>A useful data product has a named user, a decision cadence, a trusted data source, a clear metric definition, and a feedback loop. For AI data products, it also needs model behavior that can be reviewed and monitored. A ranking model, forecast, summary, theme detector, or recommendation can be valuable only if the user understands what it means and what to do next.</p>
                <p>The product surface matters. A user should be able to see evidence, compare options, inspect exceptions, and correct errors. A data product should make uncertainty visible when the data does not support a confident action. It should also preserve enough metadata for later audits: when the data refreshed, which model or rule generated the output, and what changed after human review.</p>
                """,
            ),
            (
                "Architecture notes",
                """
                <p>Good data products usually separate ingestion, transformation, semantic definitions, serving, application logic, and measurement. The data platform might include a lakehouse, warehouse, dbt-style transformations, feature pipelines, or MLflow-style experiment tracking. The product layer should not hide data quality issues; it should expose freshness, coverage, and known limitations where those signals affect decisions.</p>
                <p>For AI data products, the architecture should keep model outputs versioned and reproducible. If a summary, risk label, or extracted field later changes a workflow, teams need to know which prompt, model, schema, source data, and reviewer decision produced it. That is a product requirement, not only a logging detail.</p>
                """,
            ),
            (
                "What to monitor after launch",
                """
                <ul>
                  <li>Data freshness, missing values, schema changes, source coverage, and pipeline failures.</li>
                  <li>Metric usage, decision adoption, user corrections, export patterns, and ignored recommendations.</li>
                  <li>Model drift, label drift, confidence distribution, override rate, and human review queue size.</li>
                  <li>Experiment impact, guardrail metrics, support issues, and recurring interpretation questions.</li>
                </ul>
                """,
            ),
            (
                "Evaluation checklist",
                """
                <p>Evaluation for a data product should combine data checks, product checks, and decision checks. Data checks ask whether the source is fresh, complete, and semantically stable. Product checks ask whether the user can interpret the output, find evidence, and take the next action. Decision checks ask whether the product actually changes a repeated workflow in a useful direction.</p>
                <p>For an AI data product, add model-specific checks: ground truth quality, confidence behavior, drift, reviewer corrections, and examples that should become test cases. A product can look successful in page views while still failing the decision. The more useful metric is whether users trust the output enough to act, and whether the system gives them enough context to challenge it when needed.</p>
                """,
            ),
            (
                "Related implementation examples",
                """
                <p>One implementation example is an experiment dashboard that connects feature flags, assignments, metrics, guardrails, and decision notes. Another is a document analytics tool that extracts structured fields, validates them, and lets reviewers correct outputs before they enter a reporting layer. A third is a model monitoring surface that combines data drift, prediction drift, human overrides, and incident examples. Each example depends on the same foundation: stable definitions, traceable outputs, and a product surface that respects how decisions are actually made.</p>
                """,
            ),
            (
                "Trade-offs and limitations",
                """
                <p>Data products can create false confidence when they compress messy reality into a single score. They can also slow teams down when every answer requires a custom analysis. The useful middle ground is a product that standardizes repeated decisions while keeping enough context for human judgment. That means clear definitions, simple navigation, traceable data, and a willingness to show uncertainty rather than hide it.</p>
                <p>The strongest data products also make maintenance visible. Owners should know which tables, jobs, metrics, and model outputs power the product, and users should know when a number is fresh enough to trust. That operational clarity is part of the user experience, especially when the same metric is reused in planning, experimentation, and executive reporting. It prevents debates about data lineage from replacing the actual decision.</p>
                """,
            ),
        ],
        "related": [
            ("Databricks lakehouse guide", "/databricks-comprehensive-guide.html", "Data engineering, MLflow, Delta Lake, and platform patterns."),
            ("Statistical tests for survey analysis", "/key-statistical-tests-survey-analysis.html", "Decision-support statistics and interpretation trade-offs."),
            ("A/B test engineering guide", "/engineering/ab-test-engineering-guide.html", "Experiment infrastructure for product measurement."),
            ("AI product builder", "/ai-product-builder.html", "Product thinking for applied AI systems and data workflows."),
        ],
    },
    "ai-product-builder.html": {
        "url_path": "/ai-product-builder.html",
        "title": "AI Product Builder Portfolio Themes | Yangming Li",
        "description": "Yangming Li's AI product builder pillar on product thinking, applied AI workflows, data products, evaluation, prototypes, decision support, and launch trade-offs.",
        "eyebrow": "Pillar Page",
        "h1": "AI Product Builder",
        "lead": "A guide to Yangming Li's AI product builder focus: finding useful workflows, shaping applied AI systems, defining evaluation loops, and connecting technical decisions to product outcomes.",
        "sections": [
            (
                "Start here",
                """
                <p>An AI product builder has to hold two questions at once: what can the system technically do, and what user workflow becomes meaningfully better because of it? Yangming Li's writing connects product strategy with applied AI engineering, data products, and evaluation because AI features are often persuasive before they are dependable.</p>
                <p>Start with the value proposition and product scaling articles, then read the AI engineering and LLM evaluation pillars. Together they show a product path from user problem to system design, test cases, launch constraints, and monitoring.</p>
                """,
            ),
            (
                "Product thinking for AI systems",
                """
                <p>AI products should begin with a repeated pain, not a model capability. A useful product might reduce review effort, improve retrieval, summarize long documents, identify themes, draft structured fields, or help a team compare options. The model is valuable only when it fits the user's cadence and risk. If users need an auditable record, the product must show sources and reviewer decisions. If users need speed, latency and workflow placement matter. If users need accuracy, the evaluation set and escalation path matter.</p>
                <p>That is why product requirements for AI systems often look like engineering requirements: allowed sources, output schema, confidence behavior, human review, logging, permission boundaries, rollback, and monitoring. Product clarity makes engineering safer.</p>
                """,
            ),
            (
                "How I would use this in a real workflow",
                """
                <p>A practical AI product workflow starts with discovery interviews and examples. Gather real input artifacts, anonymized or synthetic where needed, and ask what a good output looks like. Turn those examples into a small evaluation set before overbuilding. Prototype the narrowest useful workflow, test it against ordinary and difficult cases, and decide where the human remains in control.</p>
                <p>After that, the product loop becomes measurable: how often does the feature save time, how often do users correct it, which cases require escalation, and what errors would cause loss of trust? The best product signal is not just usage. It is whether the system improves the decision while making errors easier to see and fix.</p>
                """,
            ),
            (
                "Common production failure modes",
                """
                <ul>
                  <li>The demo solves a curated example but fails realistic edge cases.</li>
                  <li>The system produces fluent output without enough evidence or source traceability.</li>
                  <li>The product lacks a correction workflow, so errors never become better evaluation data.</li>
                  <li>The model output does not match downstream schemas, trackers, or reporting needs.</li>
                  <li>The team measures usage but not task success, reviewer effort, or trust erosion.</li>
                </ul>
                """,
            ),
            (
                "Launch checklist",
                """
                <p>Before launch, define the narrow workflow, the user promise, and the failure promise. The user promise says what the AI feature will help with. The failure promise says what happens when the system is uncertain, unsupported by evidence, or outside scope. This second promise is often what protects trust.</p>
                <p>A practical launch checklist includes a representative evaluation set, schema or output expectations, reviewer instructions, analytics events, support paths, cost and latency budgets, and a rollback plan. It should also include examples of what the feature will not do. Clear non-goals prevent the product from absorbing every adjacent request and becoming too broad to evaluate.</p>
                """,
            ),
            (
                "Portfolio signals",
                """
                <p>An AI product builder portfolio is strongest when it shows how thinking moves from problem to system. Useful signals include a concise problem statement, the user workflow, the data or knowledge boundary, the evaluation approach, the human review point, the launch metric, and the monitoring plan. Screenshots are helpful, but the reasoning behind the system is often more valuable than the surface alone.</p>
                """,
            ),
            (
                "Trade-offs and limitations",
                """
                <p>AI can lower friction, but it can also add invisible complexity. The product builder's job is to choose the smallest reliable system that solves the user's problem. Sometimes that means a classifier, a rules layer, or a better search interface instead of an agent. Sometimes it means keeping an LLM in a drafting role rather than an automation role. The best product choice is the one whose risks the team can explain, test, and monitor.</p>
                <p>This is also a portfolio principle. A thoughtful AI product story should show constraints, rejected options, and measurement choices, not only the final feature. Those details make the work more credible because they show how the builder reasons under uncertainty and keeps user value ahead of model novelty. They also help reviewers see whether the product can survive contact with messy real workflows.</p>
                """,
            ),
        ],
        "related": [
            ("Building high-impact value propositions", "/building-high-impact-value-propositions.html", "A product framework for validating meaningful user value."),
            ("Building a product that scales", "/building-product-scales-company.html", "Product strategy notes on durable product foundations."),
            ("Data products", "/data-products.html", "Decision-support systems, analytics workflows, and AI data products."),
            ("AI Engineering", "/ai-engineering/", "The technical architecture behind dependable AI products."),
        ],
    },
    "healthcare-ai-analytics.html": {
        "url_path": "/healthcare-ai-analytics.html",
        "title": "Healthcare AI Analytics and NLP Theme Discovery | Yangming Li",
        "description": "Yangming Li's healthcare AI analytics pillar on NLP topic modeling, complaint theme discovery, text analytics, evaluation, review workflows, and trustworthy ML.",
        "eyebrow": "Pillar Page",
        "h1": "Healthcare AI Analytics",
        "lead": "A practical pillar for healthcare-style AI analytics: NLP topic modeling, complaint theme discovery, text classification, review workflows, trustworthy machine learning, and monitoring.",
        "sections": [
            (
                "Start here",
                """
                <p>This page does not claim a private healthcare deployment or confidential project. It frames how Yangming Li writes about healthcare-style analytics problems using public, generalizable AI and data product patterns: text analytics, theme discovery, classification, evaluation, reviewer workflows, and trustworthy ML.</p>
                <p>Start with the machine learning and NLP pillar, then read the trustworthy ML guide and the Copilot agent evaluation article. Healthcare analytics workflows are sensitive because errors can affect interpretation, prioritization, and trust. That makes evaluation, transparency, and human review central from the beginning.</p>
                """,
            ),
            (
                "Healthcare NLP topic modeling",
                """
                <p>Healthcare text often contains short, messy, high-context language: comments, complaints, notes, survey responses, call summaries, or operational descriptions. Topic modeling can help analysts find recurring themes, but it should be treated as discovery, not truth. The themes need human naming, examples, exclusion criteria, and stability checks across time periods and data sources.</p>
                <p>A careful workflow would sample text, remove or protect sensitive information, normalize obvious formatting issues, run candidate theme discovery, and ask reviewers to label whether the themes are coherent and useful. The next step might be a supervised classifier or retrieval interface, but only after the theme definitions are clear enough to evaluate.</p>
                """,
            ),
            (
                "Complaint theme discovery AI",
                """
                <p>Complaint theme discovery is a strong use case for combining NLP with product thinking. The goal is not to replace human judgment. The goal is to make recurring issues easier to see, route, and investigate. A system might group similar comments, highlight emerging categories, draft summaries, or show representative examples. Reviewers should be able to merge themes, split broad themes, flag false clusters, and create new evaluation examples.</p>
                <p>The architecture should preserve traceability. A theme summary should link back to representative text snippets and source metadata. A classifier should show confidence and allow override. A dashboard should separate volume changes from model changes so analysts do not mistake drift for a real operational trend.</p>
                """,
            ),
            (
                "Architecture notes",
                """
                <p>A careful healthcare-style analytics architecture separates ingestion, de-identification or approved handling, text normalization, feature generation, model output, reviewer labels, and reporting. That separation lets the team answer practical questions later: which source produced this theme, which model version suggested it, which reviewer changed it, and whether the definition has changed since last month.</p>
                <p>For theme discovery, embeddings and topic models can be used as exploration tools, while supervised classifiers or rules can support repeatable routing after labels stabilize. For summaries, retrieval and citation links should remain visible so reviewers can inspect evidence. For dashboards, freshness, source mix, and unknown-category rates should sit beside volume metrics because operational changes can otherwise look like model insight.</p>
                """,
            ),
            (
                "Related implementation examples",
                """
                <p>One example is a feedback review queue where AI suggests a theme and a reviewer confirms, edits, or rejects it. Another is a monitoring view that highlights newly emerging phrases and asks whether they belong to an existing theme. A third is a monthly analytics workflow that compares current themes with prior periods while clearly showing source coverage and label changes. These examples keep AI in a support role while making the human review work easier to scale.</p>
                """,
            ),
            (
                "Evaluation and governance checklist",
                """
                <ul>
                  <li>Use de-identified or approved data handling practices before analysis.</li>
                  <li>Define theme labels with examples, exclusions, and reviewer guidance.</li>
                  <li>Measure precision, recall, stability, drift, and reviewer disagreement by category.</li>
                  <li>Track false positives, false negatives, emerging themes, and no-theme cases.</li>
                  <li>Keep AI output in a review-support role when the workflow is sensitive or ambiguous.</li>
                </ul>
                """,
            ),
            (
                "What to monitor after launch",
                """
                <p>After launch, monitor label distribution, unknown-category rate, reviewer overrides, theme churn, source mix, latency, and data freshness. Watch for silent degradation when new forms, new language, or new policies appear. The most valuable monitoring artifact is often a review queue of examples that confused the system, because those examples become the next evaluation set.</p>
                <p>The limitation is important: AI analytics can reveal patterns faster, but it does not decide what those patterns mean. Human review, domain context, and governance remain part of the product.</p>
                <p>For sensitive analytics, monitoring should also include documentation hygiene: whether theme definitions are current, whether reviewers still agree on labels, and whether new examples are being added to the evaluation set. A model can only improve if the review loop produces reusable evidence, and the product should make that evidence easy to collect.</p>
                """,
            ),
        ],
        "related": [
            ("Machine Learning and NLP", "/machine-learning-nlp.html", "The broader NLP and statistical ML pillar."),
            ("Trustworthy machine learning", "/trust-worth-machine-learning-1.html", "Reliability, accountability, fairness, privacy, and robustness notes."),
            ("Testing and evaluating Copilot agents", "/testing-evaluating-copilot-agents.html", "Schema validation, human review, and release gates for AI systems."),
            ("Statistical tests for survey analysis", "/key-statistical-tests-survey-analysis.html", "Statistical interpretation for survey and feedback workflows."),
        ],
    },
}

for _rel, _data in PILLARS.items():
    CUSTOM_META[_rel] = {
        "title": _data["title"],
        "description": _data["description"],
        "section": "AI Engineering" if _rel in {"ai-engineering/index.html", "llm-evaluation.html"} else _data["h1"],
        "keywords": [
            _data["h1"],
            "Yangming Li",
            "Applied AI",
            "LLM systems",
            "Data products",
            "AI evaluation",
        ],
    }


RELATED_BY_SECTION = {
    "AI Engineering": [
        ("AI Engineering", "/ai-engineering/", "Production AI systems, agents, RAG, MLOps, and reliability."),
        ("LLM Evaluation", "/llm-evaluation.html", "Evaluation frameworks, schema validation, and monitoring for LLM systems."),
        ("Testing Copilot agents", "/testing-evaluating-copilot-agents.html", "Agent evaluation with test sets, graders, and release gates."),
    ],
    "LLM Evaluation": [
        ("LLM Evaluation", "/llm-evaluation.html", "RAG, agent testing, uncertainty, and schema validation."),
        ("AI Engineering", "/ai-engineering/", "Architecture patterns for production AI systems."),
        ("Uncertainty for LLMs", "/uqlm-teaching-guide.html", "Confidence and uncertainty scoring for language model output."),
    ],
    "Machine Learning & NLP": [
        ("Machine Learning and NLP", "/machine-learning-nlp.html", "Statistical ML, NLP, topic modeling, and trustworthy ML."),
        ("Healthcare AI analytics", "/healthcare-ai-analytics.html", "Healthcare-style NLP, complaint themes, and review workflows."),
        ("Trustworthy ML", "/trust-worth-machine-learning-1.html", "Transparency, fairness, privacy, robustness, and accountability."),
    ],
    "Data Products": [
        ("Data Products", "/data-products.html", "Analytics systems, AI data products, and decision support."),
        ("AI Product Builder", "/ai-product-builder.html", "Product thinking for applied AI and data workflows."),
        ("Databricks guide", "/databricks-comprehensive-guide.html", "Lakehouse and data engineering implementation notes."),
    ],
    "Product Strategy": [
        ("AI Product Builder", "/ai-product-builder.html", "Applied AI product strategy and workflow design."),
        ("Data Products", "/data-products.html", "Decision-support systems and analytics products."),
        ("Projects", "/projects.html", "Portfolio themes across AI systems and data products."),
    ],
    "Engineering": [
        ("AI Engineering", "/ai-engineering/", "Production AI architecture and engineering practices."),
        ("Data Products", "/data-products.html", "Data systems, experiments, and decision support."),
        ("Blog", "/blog/", "All technical writing by Yangming Li."),
    ],
    "LeetCode Solutions": [
        ("Blog", "/blog/", "Browse Yangming Li's technical writing."),
        ("Machine Learning and NLP", "/machine-learning-nlp.html", "ML and NLP notes with practical evaluation context."),
        ("Projects", "/projects.html", "Applied AI and data product portfolio themes."),
    ],
}


def rel_path(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def page_url(path: Path) -> str:
    rel = rel_path(path)
    if rel == "index.html":
        return f"{BASE_URL}/"
    if rel.endswith("/index.html"):
        return f"{BASE_URL}/{rel[:-len('index.html')]}"
    return f"{BASE_URL}/{rel}"


def public_html_files() -> list[Path]:
    files: list[Path] = []
    for path in ROOT.rglob("*.html"):
        rel_parts = path.relative_to(ROOT).parts
        if path.name in EXCLUDE_FILES or path.stat().st_size == 0:
            continue
        if any(part in EXCLUDE_DIRS or part.startswith(".tmp-") for part in rel_parts):
            continue
        files.append(path)
    return sorted(files, key=lambda p: rel_path(p))


def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text or "").strip()
    text = re.sub(r"\bLight\s+Dark\b", "", text, flags=re.I)
    text = re.sub(r"\bDark\s+Light\b", "", text, flags=re.I)
    text = text.replace("Â·", "·")
    return re.sub(r"\s+", " ", text).strip()


def title_from_soup(soup: BeautifulSoup, fallback: str) -> str:
    h1 = soup.find("h1")
    if h1:
        return clean_text(h1.get_text(" "))
    if soup.title and soup.title.string:
        return clean_text(soup.title.string)
    return fallback


def trim_description(text: str, minimum: int = 135, maximum: int = 165) -> str:
    text = clean_text(text)
    text = re.sub(r"\s*\|\s*Yangming Li.*$", "", text)
    if len(text) > maximum:
        cut = text[:maximum].rsplit(" ", 1)[0].rstrip(" ,;:")
        text = cut if cut.endswith(".") else f"{cut}."
    if len(text) < minimum:
        addition = " Includes practical notes on implementation, evaluation, trade-offs, and production use."
        available = maximum - len(text)
        if available > 20:
            text = (text + addition[:available]).rsplit(" ", 1)[0].rstrip(" ,;:")
            if not text.endswith("."):
                text += "."
    return text


def current_meta_description(soup: BeautifulSoup) -> str:
    tag = soup.find("meta", attrs={"name": re.compile("^description$", re.I)})
    return clean_text(tag.get("content", "")) if tag else ""


def generated_description(soup: BeautifulSoup, title: str, rel: str, section: str) -> str:
    custom = CUSTOM_META.get(rel, {}).get("description")
    if isinstance(custom, str):
        return custom

    for p in soup.find_all("p"):
        text = clean_text(p.get_text(" "))
        if not text:
            continue
        lowered = text.lower()
        if lowered.startswith(("by yangming", "written by", "keywords:", "share on", "©", "copyright")):
            continue
        if "light dark" in lowered or text == title:
            continue
        if len(text) >= 80:
            return trim_description(text)

    base = f"Read Yangming Li's practical notes on {title}, with context for {section.lower()}, implementation trade-offs, evaluation, and production workflows."
    return trim_description(base)


def section_for(rel: str, title: str) -> str:
    custom = CUSTOM_META.get(rel, {}).get("section")
    if isinstance(custom, str):
        return custom
    lowered = f"{rel} {title}".lower()
    if "leetcode" in lowered:
        return "LeetCode Solutions"
    if any(word in lowered for word in ["copilot", "llm", "mcp", "n8n", "agent", "mlops", "docker", "kubernetes", "ray", "jax", "llama", "uqlm"]):
        return "AI Engineering"
    if any(word in lowered for word in ["bert", "nlp", "sentiment", "random", "neural", "glm", "pytorch", "unlearning", "trust", "forest"]):
        return "Machine Learning & NLP"
    if any(word in lowered for word in ["databricks", "polars", "statistical", "survey"]):
        return "Data Products"
    if any(word in lowered for word in ["product", "value", "jira"]):
        return "Product Strategy"
    if "engineering/" in rel or any(word in lowered for word in ["python", "ab-test", "systems", "computation", "datastructure"]):
        return "Engineering"
    return "Blog"


def keywords_for(rel: str, title: str, section: str) -> list[str]:
    custom = CUSTOM_META.get(rel, {}).get("keywords")
    if isinstance(custom, list):
        return [str(item) for item in custom]
    words = [w for w in re.split(r"[^A-Za-z0-9+]+", title) if len(w) > 2]
    result = ["Yangming Li", section]
    for word in words[:6]:
        if word not in result:
            result.append(word)
    return result


def remove_head_tags(head, predicate) -> None:
    for tag in list(head.find_all(True, recursive=False)):
        if predicate(tag):
            tag.decompose()


def set_head_metadata(
    soup: BeautifulSoup,
    *,
    title: str,
    description: str,
    canonical: str,
    robots: str,
    og_type: str,
    keywords: list[str] | None = None,
) -> None:
    head = soup.head
    if head is None:
        html_tag = soup.find("html") or soup.new_tag("html")
        if not soup.find("html"):
            soup.append(html_tag)
        head = soup.new_tag("head")
        html_tag.insert(0, head)

    for tag in list(head.find_all("title")):
        tag.decompose()
    title_tag = soup.new_tag("title")
    title_tag.string = title
    head.insert(0, title_tag)

    names = {"description", "robots", "twitter:card", "twitter:title", "twitter:description", "twitter:image", "keywords", "viewport"}
    props = {"og:type", "og:site_name", "og:title", "og:description", "og:url", "og:image", "og:image:alt"}
    for tag in list(head.find_all("meta")):
        name = (tag.get("name") or "").lower()
        prop = (tag.get("property") or "").lower()
        if name in names or prop in props:
            tag.decompose()

    for tag in list(head.find_all("link")):
        rels = [r.lower() for r in tag.get("rel", [])] if isinstance(tag.get("rel"), list) else [str(tag.get("rel", "")).lower()]
        if "canonical" in rels:
            tag.decompose()

    meta_items = [
        {"name": "viewport", "content": "width=device-width, initial-scale=1"},
        {"name": "description", "content": description},
        {"name": "robots", "content": robots},
        {"property": "og:type", "content": og_type},
        {"property": "og:site_name", "content": "Yangming Li"},
        {"property": "og:title", "content": title},
        {"property": "og:description", "content": description},
        {"property": "og:url", "content": canonical},
        {"property": "og:image", "content": f"{BASE_URL}/img/Logo.png"},
        {"property": "og:image:alt", "content": "Yangming Li site logo"},
        {"name": "twitter:card", "content": "summary_large_image"},
        {"name": "twitter:title", "content": title},
        {"name": "twitter:description", "content": description},
        {"name": "twitter:image", "content": f"{BASE_URL}/img/Logo.png"},
    ]
    if keywords:
        meta_items.append({"name": "keywords", "content": ", ".join(keywords)})

    insert_at = 1
    for attrs in meta_items:
        tag = soup.new_tag("meta", attrs=attrs)
        head.insert(insert_at, tag)
        insert_at += 1

    canonical_tag = soup.new_tag("link", rel="canonical", href=canonical)
    head.insert(insert_at, canonical_tag)

    typography_links = [
        tag for tag in head.find_all("link", href=True)
        if re.search(r"(^|/)css/typography\.css(?:\?.*)?$", tag.get("href", ""))
    ]
    for duplicate in typography_links[1:]:
        duplicate.decompose()
    if not typography_links:
        css = soup.new_tag("link", rel="stylesheet", href="/css/typography.css")
        head.append(css)


def parse_json_ld(script) -> object | None:
    try:
        return json.loads(script.string or script.get_text() or "")
    except Exception:
        return None


def data_has_type(data: object, types: set[str]) -> bool:
    if isinstance(data, dict):
        t = data.get("@type")
        if isinstance(t, list) and any(item in types for item in t):
            return True
        if isinstance(t, str) and t in types:
            return True
        graph = data.get("@graph")
        if isinstance(graph, list):
            return any(data_has_type(item, types) for item in graph)
    return False


def remove_json_ld_types(soup: BeautifulSoup, types: set[str]) -> None:
    for script in list(soup.find_all("script", attrs={"type": re.compile(r"application/ld\+json", re.I)})):
        data = parse_json_ld(script)
        if data is None or data_has_type(data, types):
            script.decompose()


def add_json_ld(soup: BeautifulSoup, data: object) -> None:
    script = soup.new_tag("script", type="application/ld+json")
    script.string = json.dumps(data, ensure_ascii=False, indent=2)
    (soup.head or soup).append(script)


def breadcrumb_schema(items: list[tuple[str, str]]) -> dict:
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": i, "name": name, "item": f"{BASE_URL}{href}" if href.startswith("/") else href}
            for i, (name, href) in enumerate(items, start=1)
        ],
    }


def article_schema(
    *,
    headline: str,
    description: str,
    canonical: str,
    section: str,
    keywords: list[str],
    date_published: str | None,
) -> dict:
    data = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": headline,
        "description": description,
        "image": f"{BASE_URL}/img/Logo.png",
        "author": {
            "@type": "Person",
            "name": "Yangming Li",
            "url": f"{BASE_URL}/about.html",
        },
        "publisher": {
            "@type": "Organization",
            "name": "Yangming Li",
            "logo": {"@type": "ImageObject", "url": f"{BASE_URL}/img/Logo.png"},
        },
        "dateModified": TODAY,
        "mainEntityOfPage": {"@type": "WebPage", "@id": canonical},
        "articleSection": section,
        "keywords": keywords,
        "inLanguage": "en",
        "isAccessibleForFree": True,
    }
    if date_published:
        data["datePublished"] = date_published
    return data


def extract_date_published(soup: BeautifulSoup) -> str | None:
    for script in soup.find_all("script", attrs={"type": re.compile(r"application/ld\+json", re.I)}):
        data = parse_json_ld(script)
        if isinstance(data, dict):
            candidates = [data]
            if isinstance(data.get("@graph"), list):
                candidates.extend(item for item in data["@graph"] if isinstance(item, dict))
            for item in candidates:
                value = item.get("datePublished")
                if isinstance(value, str) and re.match(r"\d{4}-\d{2}-\d{2}", value):
                    return value[:10]
    for attr in [
        {"property": re.compile(r"article:published_time", re.I)},
        {"name": re.compile(r"date", re.I)},
    ]:
        tag = soup.find("meta", attrs=attr)
        if tag and tag.get("content") and re.match(r"\d{4}-\d{2}-\d{2}", tag["content"]):
            return tag["content"][:10]
    text = clean_text(soup.get_text(" "))
    match = re.search(r"Published\s+([A-Z][a-z]+)\s+(\d{1,2}),\s+(\d{4})", text)
    if match:
        months = {
            "January": "01", "February": "02", "March": "03", "April": "04",
            "May": "05", "June": "06", "July": "07", "August": "08",
            "September": "09", "October": "10", "November": "11", "December": "12",
        }
        month = months.get(match.group(1))
        if month:
            return f"{match.group(3)}-{month}-{int(match.group(2)):02d}"
    return None


def is_article(rel: str) -> bool:
    if rel in CORE_PAGES or rel in PILLAR_PATHS or rel in NOINDEX_CANONICALS:
        return False
    if rel.startswith("focus-room/"):
        return False
    return True


def make_footer_soup(soup: BeautifulSoup):
    link_parts = []
    for label, href in SITE_LINKS:
        rel_attr = ' rel="noopener noreferrer"' if href.startswith("http") else ""
        link_parts.append(f'<li><a href="{href}"{rel_attr}>{label}</a></li>')
    links = "".join(link_parts)
    return BeautifulSoup(
        f"""
        <footer class="site-footer" aria-label="Site footer">
          <div class="site-footer-inner">
            <p class="site-footer-title">Yangming Li</p>
            <ul class="site-footer-links">{links}</ul>
          </div>
        </footer>
        """,
        "html.parser",
    ).footer


def ensure_footer(soup: BeautifulSoup) -> None:
    if not soup.body:
        return
    for footer in list(soup.select("footer.site-footer")):
        footer.decompose()
    soup.body.append(make_footer_soup(soup))


def visible_breadcrumb_soup(title: str) -> BeautifulSoup:
    return BeautifulSoup(
        f"""
        <nav class="seo-breadcrumbs" aria-label="Breadcrumb">
          <a href="/">Home</a><span>/</span><a href="/blog/">Blog</a><span>/</span><span>{title}</span>
        </nav>
        """,
        "html.parser",
    )


def related_block_soup(section: str) -> BeautifulSoup:
    related = RELATED_BY_SECTION.get(section, RELATED_BY_SECTION["Engineering"])
    cards = "".join(
        f"""
        <article class="seo-related-item">
          <h3><a href="{href}">{title}</a></h3>
          <p>{desc}</p>
        </article>
        """
        for title, href, desc in related
    )
    return BeautifulSoup(
        f"""
        <section class="seo-related-block" aria-labelledby="related-writing-title">
          <h2 id="related-writing-title">Related writing</h2>
          <div class="seo-related-grid">{cards}</div>
        </section>
        """,
        "html.parser",
    )


def enhance_article_body(soup: BeautifulSoup, title: str, section: str) -> None:
    if not soup.body:
        return
    for node in list(soup.select(".seo-breadcrumbs, .seo-author-block, .seo-related-block")):
        node.decompose()

    soup.body.insert(0, visible_breadcrumb_soup(title).nav)

    author = BeautifulSoup(
        '<div class="seo-author-block">Written by <a href="/about.html">Yangming Li</a></div>',
        "html.parser",
    ).div
    h1 = soup.find("h1")
    if h1:
        header = h1.find_parent("header")
        if header:
            header.insert_after(author)
        else:
            h1.insert_after(author)
    else:
        soup.body.insert(1, author)

    footer = soup.select_one("footer.site-footer")
    related = related_block_soup(section).section
    if footer:
        footer.insert_before(related)
    else:
        soup.body.append(related)


def local_asset_path(value: str, current: Path) -> Path | None:
    if not value or value.startswith(("data:", "http:", "https:", "mailto:", "tel:", "#", "javascript:")):
        return None
    parsed = urlparse(value)
    raw_path = unquote(parsed.path)
    if not raw_path:
        return None
    target = ROOT / raw_path.lstrip("/") if raw_path.startswith("/") else current.parent / raw_path
    return target


def image_alt_from_path(value: str, page_title: str) -> str:
    stem = Path(urlparse(value).path).stem
    if not stem:
        return page_title
    stem = re.sub(r"[_\-\]]+", " ", stem)
    stem = re.sub(r"\boptimized\b|\b800\b", "", stem, flags=re.I)
    stem = clean_text(stem).title()
    return f"{stem} - {page_title}" if stem else page_title


def enhance_media_and_scripts(soup: BeautifulSoup, path: Path, page_title: str) -> None:
    first_img = True
    for img in soup.find_all("img"):
        if not img.get("alt"):
            if img.get("aria-hidden", "").lower() == "true" or img.get("role") == "presentation":
                img["alt"] = ""
            else:
                img["alt"] = image_alt_from_path(img.get("src", ""), page_title)
        if not first_img and not img.get("loading"):
            img["loading"] = "lazy"
        if not img.get("decoding"):
            img["decoding"] = "async"
        asset = local_asset_path(img.get("src", ""), path)
        if asset and asset.exists() and Image and not img.get("width") and not img.get("height"):
            try:
                with Image.open(asset) as im:
                    width, height = im.size
                img["width"] = str(width)
                img["height"] = str(height)
            except Exception:
                pass
        first_img = False

    first_video = True
    for video in soup.find_all("video"):
        video["preload"] = "metadata"
        video["playsinline"] = ""
        if first_video:
            video["muted"] = ""
        else:
            if video.has_attr("autoplay"):
                del video["autoplay"]
        first_video = False

    for script in soup.find_all("script", src=True):
        if script.get("type") == "module" or script.has_attr("async") or script.has_attr("defer"):
            continue
        script["defer"] = ""


def replace_duplicate_bert2_body(soup: BeautifulSoup) -> None:
    if not soup.body:
        return
    soup.body.clear()
    body = BeautifulSoup(
        """
        <main style="max-width: 760px; margin: 48px auto; padding: 0 20px;">
          <nav aria-label="Primary"><a href="/">Home</a> <a href="/blog/">Blog</a> <a href="/machine-learning-nlp.html">Machine Learning &amp; NLP</a></nav>
          <h1>BERT sentiment analysis article moved</h1>
          <p>This duplicate page is intentionally noindexed and redirects to the canonical article:
          <a href="/sentiment-analysis-fine-tune-with-bert.html">Fine-Tune BERT for Sentiment Analysis</a>.</p>
        </main>
        """,
        "html.parser",
    )
    soup.body.append(body.main)


def improve_homepage(soup: BeautifulSoup) -> None:
    if not soup.body:
        return
    for node in list(soup.select(".explore-work")):
        node.decompose()
    explore_links = [
        ("About", "/about.html"),
        ("Projects", "/projects.html"),
        ("AI Engineering", "/ai-engineering/"),
        ("LLM Evaluation", "/llm-evaluation.html"),
        ("Machine Learning & NLP", "/machine-learning-nlp.html"),
        ("Data Products", "/data-products.html"),
        ("AI Product Builder", "/ai-product-builder.html"),
        ("Blog", "/blog/"),
        ("Resume", "/resume.html"),
        ("Contact", "/contact.html"),
    ]
    links = "".join(f'<li><a href="{href}">{label}</a></li>' for label, href in explore_links)
    section = BeautifulSoup(
        f"""
        <section class="explore-work" aria-labelledby="explore-work-title">
          <div class="explore-work-inner">
            <h2 id="explore-work-title">Explore Yangming Li's work</h2>
            <p>Use these crawlable links to jump into the main areas of the site: profile, projects, applied AI systems, evaluation, machine learning, data products, product thinking, writing, resume, and contact.</p>
            <ul class="explore-work-links">{links}</ul>
          </div>
        </section>
        """,
        "html.parser",
    ).section
    tab_content = soup.find(id="myTabContent")
    if tab_content:
        tab_content.insert_before(section)
    else:
        soup.body.insert(0, section)

    remove_json_ld_types(soup, {"Person", "WebSite", "ProfilePage"})
    add_json_ld(
        soup,
        {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebSite",
                    "@id": f"{BASE_URL}/#website",
                    "name": "Yangming Li",
                    "url": f"{BASE_URL}/",
                    "inLanguage": "en",
                    "publisher": {"@id": f"{BASE_URL}/#yangming-li"},
                    "potentialAction": {
                        "@type": "SearchAction",
                        "target": f"{BASE_URL}/?q={{search_term_string}}",
                        "query-input": "required name=search_term_string",
                    },
                },
                person_schema(),
            ],
        },
    )


def person_schema() -> dict:
    return {
        "@type": "Person",
        "@id": f"{BASE_URL}/#yangming-li",
        "name": "Yangming Li",
        "url": f"{BASE_URL}/",
        "image": f"{BASE_URL}/img/Logo.png",
        "jobTitle": "Applied AI Engineer, Data Scientist, and AI Product Builder",
        "description": "Yangming Li writes about applied AI systems, LLM systems, RAG, AI evaluation, statistical machine learning, NLP, data engineering, data products, experiment infrastructure, and AI product thinking.",
        "sameAs": [
            "https://www.linkedin.com/in/yangming-li-tech/",
            "https://github.com/yml-blog",
            "https://scholar.google.ca/citations?user=Pwjgsg4AAAAJ&hl=en",
        ],
        "knowsAbout": [
            "Applied AI",
            "LLM systems",
            "Retrieval-Augmented Generation",
            "AI evaluation",
            "Schema validation for AI agents",
            "Statistical machine learning",
            "Natural language processing",
            "Data engineering",
            "AI data products",
            "Experiment infrastructure",
            "AI product thinking",
        ],
    }


def improve_about_page(soup: BeautifulSoup) -> None:
    main = soup.find("main")
    if not main:
        return
    main.clear()
    fragment = BeautifulSoup(
        """
        <nav aria-label="Primary">
          <a href="/">Home</a><a href="/projects.html">Projects</a><a href="/ai-engineering/">AI Engineering</a><a href="/llm-evaluation.html">LLM Evaluation</a><a href="/machine-learning-nlp.html">Machine Learning &amp; NLP</a><a href="/data-products.html">Data Products</a><a href="/blog/">Blog</a><a href="/resume.html">Resume</a><a href="/contact.html">Contact</a>
        </nav>
        <h1>About Yangming Li</h1>
        <p>Yangming Li is an Applied AI Engineer, Data Scientist, and AI Product Builder. This website collects public writing, project themes, and technical notes across applied AI systems, LLM systems, RAG, AI evaluation, statistical machine learning, NLP, data engineering, data products, experiment infrastructure, and product thinking.</p>
        <p>The throughline is practical AI work: designing systems that can be evaluated, monitored, reviewed, and connected to real workflows. Rather than presenting AI as a demo-only capability, the site emphasizes contracts, data quality, retrieval design, schema validation, uncertainty, human review, and the product decisions needed to make AI useful.</p>
        <h2>Focus areas</h2>
        <ul>
          <li>Applied AI engineering, LLM systems, RAG, agents, document intelligence, and AI evaluation.</li>
          <li>Statistical machine learning, NLP, topic modeling, sentiment analysis, and trustworthy machine learning.</li>
          <li>Data engineering, AI data products, analytics systems, MLOps, and experiment infrastructure.</li>
          <li>AI product thinking, product strategy, decision-support workflows, and launch trade-offs.</li>
        </ul>
        <h2>Start here</h2>
        <p>For technical depth, start with <a href="/testing-evaluating-copilot-agents.html">Testing and Evaluating Copilot Agents</a>, <a href="/llm-evaluation.html">LLM Evaluation</a>, and <a href="/ai-engineering/">AI Engineering</a>. For product context, read <a href="/ai-product-builder.html">AI Product Builder</a> and <a href="/data-products.html">Data Products</a>.</p>
        <h2>External profiles</h2>
        <ul>
          <li><a href="https://www.linkedin.com/in/yangming-li-tech/" rel="noopener noreferrer">LinkedIn</a></li>
          <li><a href="https://github.com/yml-blog" rel="noopener noreferrer">GitHub</a></li>
          <li><a href="https://scholar.google.ca/citations?user=Pwjgsg4AAAAJ&amp;hl=en" rel="noopener noreferrer">Google Scholar</a></li>
        </ul>
        """,
        "html.parser",
    )
    for child in list(fragment.contents):
        main.append(child)

    remove_json_ld_types(soup, {"Person", "ProfilePage", "BreadcrumbList"})
    add_json_ld(
        soup,
        {
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            "@id": f"{BASE_URL}/about.html#profile",
            "url": f"{BASE_URL}/about.html",
            "name": "About Yangming Li",
            "description": CUSTOM_META["about.html"]["description"],
            "mainEntity": person_schema(),
        },
    )
    add_json_ld(soup, breadcrumb_schema([("Home", "/"), ("About", "/about.html")]))


def improve_focus_room_schema(soup: BeautifulSoup) -> None:
    remove_json_ld_types(soup, {"WebPage", "SoftwareApplication", "FAQPage", "BreadcrumbList"})
    add_json_ld(
        soup,
        {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebPage",
                    "@id": f"{BASE_URL}/focus-room/#webpage",
                    "url": f"{BASE_URL}/focus-room/",
                    "name": "Focus Room | Deep Work Focus App and Ambient Study Room",
                    "description": CUSTOM_META["focus-room/index.html"]["description"],
                    "inLanguage": "en",
                    "isPartOf": {"@id": f"{BASE_URL}/#website"},
                    "about": {"@id": f"{BASE_URL}/focus-room/#app"},
                    "breadcrumb": {"@id": f"{BASE_URL}/focus-room/#breadcrumb"},
                    "primaryImageOfPage": {
                        "@type": "ImageObject",
                        "url": f"{BASE_URL}/focus-room-room-shell-shot-3.png",
                        "width": 1600,
                        "height": 1100,
                    },
                },
                {
                    "@type": "SoftwareApplication",
                    "@id": f"{BASE_URL}/focus-room/#app",
                    "name": "Focus Room",
                    "applicationCategory": "ProductivityApplication",
                    "operatingSystem": "iOS, iPadOS",
                    "url": f"{BASE_URL}/focus-room/",
                    "description": "A SwiftUI focus app prototype that blends a virtual study room, ambient sound mixer, gentle session timer, fullscreen room, and writing mode.",
                    "image": f"{BASE_URL}/focus-room-room-shell-shot-3.png",
                    "screenshot": f"{BASE_URL}/focus-room-room-shell-shot-3.png",
                    "author": {"@id": f"{BASE_URL}/#yangming-li"},
                    "creator": {"@id": f"{BASE_URL}/#yangming-li"},
                    "inLanguage": "en",
                    "isAccessibleForFree": True,
                    "keywords": "focus app, deep work timer, ambient sound mixer, study room app, writing room, SwiftUI prototype",
                    "featureList": [
                        "Hold-to-enter threshold ritual",
                        "Fullscreen study room interface",
                        "Ambient sound mixer with layered channels",
                        "Subtle session timer for deep work",
                        "Writing mode and focus mode",
                        "Local persistence for room preferences",
                    ],
                },
                {
                    "@type": "BreadcrumbList",
                    "@id": f"{BASE_URL}/focus-room/#breadcrumb",
                    "itemListElement": [
                        {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{BASE_URL}/"},
                        {"@type": "ListItem", "position": 2, "name": "Focus Room", "item": f"{BASE_URL}/focus-room/"},
                    ],
                },
                {
                    "@type": "FAQPage",
                    "@id": f"{BASE_URL}/focus-room/#faq-schema",
                    "mainEntity": [
                        {
                            "@type": "Question",
                            "name": "What is Focus Room?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Focus Room is a deep work experience built as a SwiftUI prototype. It combines a calm entry ritual, a fullscreen study room, ambient sound layers, and a quiet session timer so starting work feels lighter than opening a typical productivity dashboard.",
                            },
                        },
                        {
                            "@type": "Question",
                            "name": "Is Focus Room a focus timer or an ambient study room?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "It is both. The timer stays intentionally peripheral while the room, soundscape, and writing or focus modes remain central.",
                            },
                        },
                        {
                            "@type": "Question",
                            "name": "What makes Focus Room different from a standard focus app?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "The main design choice is reducing activation energy. Users can keep a ready-made sound mix, hold to enter, and begin in seconds instead of configuring everything up front.",
                            },
                        },
                        {
                            "@type": "Question",
                            "name": "Is Focus Room a live product or a prototype?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "This page is a public interactive showcase of a production-style SwiftUI prototype. It demonstrates product thinking, interaction design, architecture, and source structure rather than an App Store release.",
                            },
                        },
                    ],
                },
            ],
        },
    )


def add_page_breadcrumb_schema(soup: BeautifulSoup, rel: str, title: str) -> None:
    if rel == "index.html" or rel in NOINDEX_CANONICALS:
        return
    remove_json_ld_types(soup, {"BreadcrumbList"})
    label = "Blog" if rel == "blog/index.html" else title.split("|")[0].strip()
    if is_article(rel):
        add_json_ld(soup, breadcrumb_schema([("Home", "/"), ("Blog", "/blog/"), (label, f"/{rel}")]))
    elif rel in PILLAR_PATHS:
        href = "/ai-engineering/" if rel == "ai-engineering/index.html" else f"/{rel}"
        add_json_ld(soup, breadcrumb_schema([("Home", "/"), (label, href)]))
    else:
        href = "/blog/" if rel == "blog/index.html" else ("/focus-room/" if rel == "focus-room/index.html" else f"/{rel}")
        add_json_ld(soup, breadcrumb_schema([("Home", "/"), (label, href)]))


def write_pillar_pages() -> None:
    for rel, data in PILLARS.items():
        path = ROOT / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        related_cards = "".join(
            f"""
            <article class="pillar-card">
              <h3><a href="{href}">{title}</a></h3>
              <p>{desc}</p>
            </article>
            """
            for title, href, desc in data["related"]
        )
        section_html = "\n".join(f"<section><h2>{heading}</h2>{body}</section>" for heading, body in data["sections"])
        breadcrumb = breadcrumb_schema([("Home", "/"), (data["h1"], data["url_path"])])
        webpage = {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": data["h1"],
            "url": f"{BASE_URL}{data['url_path']}",
            "description": data["description"],
            "inLanguage": "en",
            "isPartOf": {"@id": f"{BASE_URL}/#website"},
            "about": person_schema(),
            "mainEntity": {"@id": f"{BASE_URL}/#yangming-li"},
        }
        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>{data['title']}</title>
<meta name="description" content="{data['description']}"/>
<meta name="robots" content="index,follow,max-image-preview:large"/>
<link rel="canonical" href="{BASE_URL}{data['url_path']}"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="Yangming Li"/>
<meta property="og:title" content="{data['title']}"/>
<meta property="og:description" content="{data['description']}"/>
<meta property="og:url" content="{BASE_URL}{data['url_path']}"/>
<meta property="og:image" content="{BASE_URL}/img/Logo.png"/>
<meta property="og:image:alt" content="Yangming Li site logo"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="{data['title']}"/>
<meta name="twitter:description" content="{data['description']}"/>
<meta name="twitter:image" content="{BASE_URL}/img/Logo.png"/>
<link rel="icon" href="/favicon.png"/>
<link rel="stylesheet" href="/css/bootstrap.min.css"/>
<link rel="stylesheet" href="/css/typography.css"/>
<script defer src="/js/i18n.js"></script>
<style>
body {{ background: #f7f8fb; color: #1f2933; font-family: Hind, Arial, sans-serif; }}
.pillar-page {{ max-width: 1080px; margin: 0 auto; padding: 40px 20px 64px; }}
.pillar-nav {{ display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 34px; }}
.pillar-nav a, .pillar-page a {{ color: #0f766e; font-weight: 700; }}
.pillar-hero {{ border-bottom: 1px solid #d9e2ec; margin-bottom: 30px; padding-bottom: 28px; }}
.eyebrow {{ color: #b45309; font-size: 13px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }}
h1 {{ color: #111827; font-size: 44px; line-height: 1.12; margin: 10px 0 16px; }}
h2 {{ color: #111827; font-size: 25px; margin: 34px 0 13px; }}
h3 {{ color: #111827; font-size: 19px; margin: 0 0 8px; }}
p, li {{ color: #52606d; font-size: 17px; line-height: 1.75; }}
.lead {{ max-width: 830px; color: #52606d; font-size: 18px; line-height: 1.7; }}
.pillar-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-top: 18px; }}
.pillar-card {{ background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 18px; }}
.pillar-footer-links {{ margin-top: 34px; padding-top: 20px; border-top: 1px solid #d9e2ec; }}
</style>
<script type="application/ld+json">{json.dumps(webpage, ensure_ascii=False, indent=2)}</script>
<script type="application/ld+json">{json.dumps(breadcrumb, ensure_ascii=False, indent=2)}</script>
</head>
<body>
<main class="pillar-page">
<nav class="pillar-nav" aria-label="Primary">
<a href="/">Home</a><a href="/about.html">About</a><a href="/projects.html">Projects</a><a href="/ai-engineering/">AI Engineering</a><a href="/blog/">Blog</a><a href="/resume.html">Resume</a><a href="/contact.html">Contact</a>
</nav>
<section class="pillar-hero">
<span class="eyebrow">{data['eyebrow']}</span>
<h1>{data['h1']}</h1>
<p class="lead">{data['lead']}</p>
</section>
{section_html}
<section aria-labelledby="related-writing-title">
<h2 id="related-writing-title">Related writing</h2>
<div class="pillar-grid">{related_cards}</div>
</section>
<section class="pillar-footer-links" aria-label="Site links">
<p><a href="/">Home</a> · <a href="/about.html">About</a> · <a href="/projects.html">Projects</a> · <a href="/blog/">Blog</a> · <a href="/resume.html">Resume</a> · <a href="/contact.html">Contact</a></p>
</section>
</main>
{str(make_footer_soup(BeautifulSoup('', 'html.parser')))}
</body>
</html>
"""
        path.write_text(html, encoding="utf-8")


def update_redirects() -> None:
    redirects = ROOT / "_redirects"
    lines = redirects.read_text(encoding="utf-8", errors="ignore").splitlines() if redirects.exists() else []
    entry = "/sentiment-analysis-fine-tune-with-bert2.html  /sentiment-analysis-fine-tune-with-bert.html  301!"
    if entry not in lines:
        lines.append(entry)
    redirects.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")

    vercel_path = ROOT / "vercel.json"
    data = json.loads(vercel_path.read_text(encoding="utf-8"))
    redirect = {
        "source": "/sentiment-analysis-fine-tune-with-bert2.html",
        "destination": "/sentiment-analysis-fine-tune-with-bert.html",
        "permanent": True,
    }
    current = data.setdefault("redirects", [])
    if not any(item.get("source") == redirect["source"] for item in current):
        current.append(redirect)
    vercel_path.write_text(json.dumps(data, indent=4) + "\n", encoding="utf-8")


def update_robots() -> None:
    robots = """User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/
Disallow: /templates/
Disallow: /email-templates/
Disallow: /api/
Disallow: /nha-cai/

Sitemap: https://yangmingli.com/sitemap.xml
"""
    (ROOT / "robots.txt").write_text(robots, encoding="utf-8")


def update_page(path: Path) -> None:
    rel = rel_path(path)
    soup = BeautifulSoup(path.read_text(encoding="utf-8", errors="ignore"), "html.parser")
    html_tag = soup.find("html")
    if html_tag:
        html_tag["lang"] = "en"

    if rel == "sentiment-analysis-fine-tune-with-bert2.html":
        replace_duplicate_bert2_body(soup)

    fallback = Path(rel).stem.replace("-", " ").title()
    title = str(CUSTOM_META.get(rel, {}).get("title") or title_from_soup(soup, fallback))
    if "Yangming Li" not in title and rel not in NOINDEX_CANONICALS:
        title = f"{title} | Yangming Li"
    section = section_for(rel, title)
    description = generated_description(soup, title, rel, section)
    canonical = NOINDEX_CANONICALS.get(rel, page_url(path))
    robots = "noindex,follow,max-image-preview:large" if rel in NOINDEX_CANONICALS else "index,follow,max-image-preview:large"
    keywords = keywords_for(rel, title, section)
    article = is_article(rel)

    set_head_metadata(
        soup,
        title=title,
        description=description,
        canonical=canonical,
        robots=robots,
        og_type="article" if article else "website",
        keywords=keywords,
    )

    if rel == "index.html":
        improve_homepage(soup)
    elif rel == "about.html":
        improve_about_page(soup)
    elif rel == "focus-room/index.html":
        improve_focus_room_schema(soup)
    elif article:
        date_published = extract_date_published(soup)
        remove_json_ld_types(soup, {"BlogPosting", "BreadcrumbList"})
        add_json_ld(
            soup,
            article_schema(
                headline=title.replace(" | Yangming Li", ""),
                description=description,
                canonical=canonical,
                section=section,
                keywords=keywords,
                date_published=date_published,
            ),
        )
        add_json_ld(soup, breadcrumb_schema([("Home", "/"), ("Blog", "/blog/"), (title.replace(" | Yangming Li", ""), f"/{rel}")]))
        enhance_article_body(soup, title.replace(" | Yangming Li", ""), section)
    else:
        add_page_breadcrumb_schema(soup, rel, title)

    enhance_media_and_scripts(soup, path, title.replace(" | Yangming Li", ""))
    if rel not in {"product/index.html", "focus-room/v1/index.html"}:
        ensure_footer(soup)

    path.write_text(str(soup), encoding="utf-8")


def main() -> None:
    write_pillar_pages()
    update_redirects()
    update_robots()
    for path in public_html_files():
        update_page(path)
    print("SEO static update complete.")


if __name__ == "__main__":
    main()
