module.exports = {
  ci: {
    collect: {
      startServerCommand: "python -m http.server 4173",
      url: [
        "http://127.0.0.1:4173/llm-evaluation/",
        "http://127.0.0.1:4173/rag-evaluation-not-a-score.html",
      ],
      numberOfRuns: 1,
      settings: {
        chromeFlags: "--no-sandbox --disable-dev-shm-usage",
      },
    },
    assert: {
      assertions: {
        "categories:seo": ["error", { minScore: 0.95 }],
        "categories:accessibility": ["error", { minScore: 0.90 }],
        "categories:performance": ["warn", { minScore: 0.80 }],
        "largest-contentful-paint": ["warn", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["warn", { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./lhci-reports",
    },
  },
};
