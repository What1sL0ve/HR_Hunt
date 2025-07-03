# В utils.py
def calculate_match_score(candidate, vacancy, maturity_weight=0.3):
    """
    Рассчитывает релевантность кандидата для вакансии с учетом навыков и цифровой зрелости.

    Args:
        candidate: Объект Candidate с навыками и резюме.
        vacancy: Объект Vacancy с требуемыми навыками.
        maturity_weight: Вес цифровой зрелости (по умолчанию 0.3).

    Returns:
        float: Итоговый балл (0–1), округленный до 0.001.
    """
    # Сбор навыков кандидата
    candidate_skills = {
        cs.skill.id: (cs.rank / 5.0)
        for cs in candidate.skills.select_related('skill')
    }

    # Сбор навыков вакансии
    vacancy_skills = vacancy.skills.select_related('skill')
    total_skill_weight = sum(vs.skill.weight for vs in vacancy_skills)

    # Проверка на отсутствие навыков
    if total_skill_weight == 0:
        return 0.0

    # Расчет соответствия навыков
    match_sum = 0.0
    for vs in vacancy_skills:
        skill_id = vs.skill.id
        skill_weight = vs.skill.weight
        candidate_match = candidate_skills.get(skill_id, 0.0)
        match_sum += candidate_match * skill_weight

    skill_match_score = match_sum / total_skill_weight

    # Получение цифровой зрелости кандидата
    candidate._vacancy_context = vacancy
    maturity_score = candidate.digital_maturity_score / 4.0  # Нормализация 1–4 до 0–1

    # Итоговый балл: навыки + взвешенная зрелость
    final_score = (1 - maturity_weight) * skill_match_score + maturity_weight * maturity_score
    return round(final_score, 3)