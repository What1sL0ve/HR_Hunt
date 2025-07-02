def calculate_match_score(candidate, vacancy, maturity_weight=0.3):
    candidate_skills = {
        cs.skill.id: (cs.rank / 5.0)
        for cs in candidate.skills.select_related('skill')
    }

    vacancy_skills = vacancy.skills.select_related('skill')
    total_skill_weight = sum(vs.skill.weight for vs in vacancy_skills)

    if total_skill_weight == 0:
        return 0.0

    match_sum = 0.0
    for vs in vacancy_skills:
        skill_id = vs.skill.id
        skill_weight = vs.skill.weight
        candidate_match = candidate_skills.get(skill_id, 0.0)
        match_sum += candidate_match * skill_weight

    skill_match_score = match_sum / total_skill_weight

    # Получаем активное резюме кандидата
    try:
        resume = candidate.resumes.get(is_active=True)
        maturity_score = resume.digital_maturity_score / 100.0  # используем из резюме
    except:
        maturity_score = 0.0

    final_score = (1 - maturity_weight) * skill_match_score + maturity_weight * maturity_score
    return round(final_score, 3)
