from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _


class Company(models.Model):
    name = models.CharField(max_length=128, verbose_name=_("Название компании"))
    maturity_level = models.IntegerField(verbose_name=_("Уровень цифровой зрелости"))

    class Meta:
        verbose_name = _("Компания")
        verbose_name_plural = _("Компании")

    def __str__(self):
        return self.name


class Candidate(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name=_("Пользователь"))
    full_name = models.CharField(max_length=256, verbose_name=_("Полное имя"))
    age = models.PositiveIntegerField(verbose_name=_("Возраст"))
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True, verbose_name=_("Аватар"))
    about = models.TextField(verbose_name=_("О себе"))

    class Meta:
        verbose_name = _("Кандидат")
        verbose_name_plural = _("Кандидаты")

    def __str__(self):
        return self.full_name


class Education(models.Model):
    title = models.CharField(max_length=128, verbose_name=_("Название программы"))
    establishment = models.CharField(max_length=128, verbose_name=_("Учебное заведение"))
    avg_mark = models.FloatField(verbose_name=_("Средний балл"))
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, verbose_name=_("Кандидат"))

    class Meta:
        verbose_name = _("Образование")
        verbose_name_plural = _("Образования")


class Experience(models.Model):
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, verbose_name=_("Кандидат"))
    company = models.ForeignKey(Company, on_delete=models.CASCADE, verbose_name=_("Компания"))
    hire_date = models.DateField(verbose_name=_("Дата приёма"))
    dismissal_date = models.DateField(null=True, blank=True, verbose_name=_("Дата увольнения"))
    about = models.TextField(verbose_name=_("Описание опыта"))

    class Meta:
        verbose_name = _("Опыт работы")
        verbose_name_plural = _("Опыты работы")


class Resume(models.Model):
    name = models.CharField(max_length=100, default='Какое-то резюме без названия')
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='resumes', verbose_name=_("Кандидат"))
    is_active = models.BooleanField(default=True, verbose_name=_("Активно"))

    class Meta:
        verbose_name = _("Резюме")
        verbose_name_plural = _("Резюме")

    def __str__(self):
        return f"Резюме: {self.candidate.full_name}"

    @property
    def digital_maturity_score(self):
        skills = self.candidate.skills.all()
        if not skills.exists():
            return 0
        weights = [s.skill.weight for s in skills]
        return round(sum(weights) / len(weights), 2)


class Vacancy(models.Model):
    title = models.CharField(max_length=64, verbose_name=_("Название вакансии"))
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='vacancies', verbose_name=_("Компания"))
    description = models.TextField(verbose_name=_("Описание"))

    class Meta:
        verbose_name = _("Вакансия")
        verbose_name_plural = _("Вакансии")

    def __str__(self):
        return self.title


class Skill(models.Model):
    title = models.CharField(max_length=32, verbose_name=_("Название навыка"))
    description = models.TextField(verbose_name=_("Описание"))
    weight = models.FloatField(verbose_name=_("Вес навыка"))

    class Meta:
        verbose_name = _("Навык")
        verbose_name_plural = _("Навыки")

    def __str__(self):
        return self.title


class CandidateSkill(models.Model):
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='skills', verbose_name=_("Кандидат"))
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, verbose_name=_("Навык"))
    rank = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name=_("Уровень владения"),
        default=0
    )

    class Meta:
        verbose_name = _("Навык кандидата")
        verbose_name_plural = _("Навыки кандидатов")


class VacancySkill(models.Model):
    vacancy = models.ForeignKey(Vacancy, on_delete=models.CASCADE, related_name='skills', verbose_name=_("Вакансия"))
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, verbose_name=_("Навык"))

    class Meta:
        verbose_name = _("Навык для вакансии")
        verbose_name_plural = _("Навыки для вакансий")


class HR(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="Пользователь")
    company = models.ForeignKey(Company, on_delete=models.CASCADE, verbose_name="Компания")

    class Meta:
        verbose_name = "HR"
        verbose_name_plural = "HR-менеджеры"

    def __str__(self):
        return f"{self.user.email} ({self.company.name})"



class MaturityQuestion(models.Model):
    """Вопрос для расчёта индекса цифровой зрелости компании."""
    text = models.CharField(max_length=255, verbose_name=_("Текст вопроса"))
    weight = models.FloatField(
        default=1.0,
        validators=[MinValueValidator(0.0)],
        verbose_name=_("Вес вопроса")
    )

    class Meta:
        verbose_name = _("Вопрос цифровой зрелости")
        verbose_name_plural = _("Вопросы цифровой зрелости")

    def __str__(self):
        return self.text[:50]


class CompanyMaturityAnswer(models.Model):
    """Ответ компании на вопрос цифровой зрелости."""
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='maturity_answers',
        verbose_name=_("Компания")
    )
    question = models.ForeignKey(
        MaturityQuestion,
        on_delete=models.CASCADE,
        verbose_name=_("Вопрос")
    )
    # Значение от 0.0 до 1.0 (0 — нет/никогда; 1 — да/всегда).
    answer_value = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        verbose_name=_("Ответ (0‑1)")
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Создан"))

    class Meta:
        verbose_name = _("Ответ цифровой зрелости")
        verbose_name_plural = _("Ответы цифровой зрелости")
        unique_together = ('company', 'question')


def recalculate_company_maturity(company: 'Company'):
    """Пересчитывает индекс цифровой зрелости и сохраняет его в поле `maturity_level`."""
    answers = company.maturity_answers.select_related('question')
    if not answers.exists():
        company.maturity_level = 0
        company.save(update_fields=['maturity_level'])
        return

    total_weight = sum(a.question.weight for a in answers)
    if total_weight == 0:
        company.maturity_level = 0
        company.save(update_fields=['maturity_level'])
        return

    weighted_score = sum(a.answer_value * a.question.weight for a in answers) / total_weight

    # Переводим в уровень 1‑4 согласно границам.
    if weighted_score <= 0.25:
        level = 1
    elif weighted_score <= 0.5:
        level = 2
    elif weighted_score <= 0.75:
        level = 3
    else:
        level = 4

    company.maturity_level = level
    company.save(update_fields=['maturity_level'])


class DisciplineFeedback(models.Model):
    """Обратная связь от HR о знаниях кандидата по конкретной дисциплине."""
    class KnowledgeLevel(models.IntegerChoices):
        POOR = 1, _('Слабые знания')
        AVERAGE = 2, _('Средние знания')
        GOOD = 3, _('Хорошие знания')

    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='discipline_feedbacks', verbose_name=_("Кандидат"))
    hr = models.ForeignKey('HR', on_delete=models.CASCADE, related_name='discipline_feedbacks', verbose_name=_("HR"))
    discipline = models.CharField(max_length=128, verbose_name=_("Дисциплина"))
    knowledge_level = models.IntegerField(choices=KnowledgeLevel.choices, default=KnowledgeLevel.AVERAGE, verbose_name=_("Уровень знаний"))
    comment = models.TextField(blank=True, verbose_name=_("Комментарий"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Создано"))

    class Meta:
        verbose_name = _("Обратная связь по дисциплине")
        verbose_name_plural = _("Обратные связи по дисциплинам")
        ordering = ('-created_at',)

    def __str__(self):
        return f"{self.candidate.full_name} – {self.discipline}: {self.get_knowledge_level_display()}"
