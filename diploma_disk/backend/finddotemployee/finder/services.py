# vacancies/services.py
from typing import List
from .utils import calculate_match_score   # ← твоя функция

def add_match_and_sort(vacancies: List["Vacancy"], candidate: "Candidate"):
    """
    Проставляет каждому объекту .match_score и возвращает
    отсортированный список (по убыванию).
    """
    for v in vacancies:
        v.match_score = calculate_match_score(candidate, v)  # ← уже существующая логика
    return sorted(vacancies, key=lambda v: v.match_score, reverse=True)
