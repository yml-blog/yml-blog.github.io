"""Small retrieval metrics for RAG evaluation examples.

The functions in this file intentionally use only the Python standard library
so they can be copied into a notebook, CI check, or lightweight evaluation
script without extra setup.
"""

from __future__ import annotations

from collections.abc import Iterable, Sequence


DocumentId = str


def _validate_relevant(relevant_ids: Iterable[DocumentId]) -> set[DocumentId]:
    """Return a non-empty set of relevant document IDs."""
    relevant = set(relevant_ids)
    if not relevant:
        raise ValueError("relevant_ids must contain at least one document ID")
    if any(not isinstance(item, str) or not item for item in relevant):
        raise ValueError("relevant_ids must contain non-empty strings")
    return relevant


def _validate_retrieved(retrieved_ids: Sequence[DocumentId], k: int) -> list[DocumentId]:
    """Validate and truncate retrieved document IDs to the requested rank cutoff."""
    if not isinstance(k, int) or k <= 0:
        raise ValueError("k must be a positive integer")
    if any(not isinstance(item, str) or not item for item in retrieved_ids):
        raise ValueError("retrieved_ids must contain non-empty strings")
    return list(retrieved_ids[:k])


def recall_at_k(
    retrieved_ids: Sequence[DocumentId],
    relevant_ids: Iterable[DocumentId],
    k: int,
) -> float:
    """Return the share of relevant documents retrieved in the top k results."""
    relevant = _validate_relevant(relevant_ids)
    top_k = _validate_retrieved(retrieved_ids, k)
    if not top_k:
        return 0.0
    hits = len(set(top_k) & relevant)
    return hits / len(relevant)


def precision_at_k(
    retrieved_ids: Sequence[DocumentId],
    relevant_ids: Iterable[DocumentId],
    k: int,
) -> float:
    """Return the share of top k retrieved documents that are relevant."""
    relevant = _validate_relevant(relevant_ids)
    top_k = _validate_retrieved(retrieved_ids, k)
    if not top_k:
        return 0.0
    hits = len(set(top_k) & relevant)
    return hits / len(top_k)


def reciprocal_rank(
    retrieved_ids: Sequence[DocumentId],
    relevant_ids: Iterable[DocumentId],
) -> float:
    """Return 1/rank for the first relevant result, or 0.0 when none is found."""
    relevant = _validate_relevant(relevant_ids)
    _validate_retrieved(retrieved_ids, max(len(retrieved_ids), 1))
    for rank, doc_id in enumerate(retrieved_ids, start=1):
        if doc_id in relevant:
            return 1.0 / rank
    return 0.0


def _run_example() -> None:
    """Execute a tiny example and sanity checks."""
    retrieved = ["policy_2024", "policy_2026", "benefits_faq", "leave_policy"]
    relevant = {"policy_2026", "leave_policy"}

    assert recall_at_k(retrieved, relevant, 1) == 0.0
    assert recall_at_k(retrieved, relevant, 4) == 1.0
    assert precision_at_k(retrieved, relevant, 2) == 0.5
    assert reciprocal_rank(retrieved, relevant) == 0.5

    print("Example retrieval metrics")
    print(f"Recall@4: {recall_at_k(retrieved, relevant, 4):.2f}")
    print(f"Precision@2: {precision_at_k(retrieved, relevant, 2):.2f}")
    print(f"Reciprocal rank: {reciprocal_rank(retrieved, relevant):.2f}")


if __name__ == "__main__":
    _run_example()
