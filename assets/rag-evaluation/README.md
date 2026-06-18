# RAG Evaluation Assets

This folder contains small, synthetic examples that support the RAG evaluation guide at `/rag-evaluation-not-a-score.html`.

## Files

- `retrieval_metrics.py`: dependency-free Python implementations of `recall_at_k`, `precision_at_k`, and `reciprocal_rank`.
- `golden_set.jsonl`: synthetic evaluation cases for retrieval, generation, citation, refusal, and clarification behavior.

## Dataset Schema

Each JSONL row contains:

- `case_id`: stable case identifier.
- `question`: user-style question for the RAG system.
- `relevant_document_ids`: documents that should support the answer.
- `distractor_document_ids`: plausible but incorrect or incomplete sources.
- `expected_behavior`: natural-language grading target.
- `failure_type`: scenario category such as `stale_document`, `conflicting_sources`, or `correct_refusal`.
- `requires_refusal`: whether the correct behavior is refusing to answer.
- `requires_clarification`: whether the correct behavior is asking a clarifying question.

All cases are synthetic. They do not contain confidential, healthcare, employer, customer, or proprietary data.

## How to Use the Golden Set

1. Run your retriever for each `question`.
2. Compare retrieved source IDs against `relevant_document_ids`.
3. Use the `expected_behavior` field to review generation, citation, refusal, and clarification behavior.
4. Convert production failures into new rows with a stable `case_id` and a clear `failure_type`.

## Run the Python Metrics

From the repository root:

```bash
python assets/rag-evaluation/retrieval_metrics.py
```

To import the functions from this folder without turning it into a package:

```python
from pathlib import Path
import importlib.util

metrics_path = Path("assets/rag-evaluation/retrieval_metrics.py")
spec = importlib.util.spec_from_file_location("retrieval_metrics", metrics_path)
retrieval_metrics = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(retrieval_metrics)

retrieval_metrics.recall_at_k(["doc_a"], {"doc_a"}, 1)
```

If you copy the file into another project, no external dependency is required.

## Extending the Dataset

Add cases that represent your real risk profile:

- stale or versioned documents
- conflicting sources
- missing evidence
- ambiguous terms
- partial citation support
- refusals and clarification requests
- correct retrieval with incorrect generation
- duplicate chunks
- multi-document synthesis

Keep examples synthetic or anonymized before sharing them outside your organization.
