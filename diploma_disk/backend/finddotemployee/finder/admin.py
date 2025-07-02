from django.contrib import admin
from .models import (
    Company, Candidate, Education, Experience, Resume,
    Vacancy, Skill, CandidateSkill, VacancySkill, HR,
    DisciplineFeedback, MaturityQuestion, CompanyMaturityAnswer
)


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'maturity_level')
    search_fields = ('name',)


@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'age', 'user')
    search_fields = ('full_name', 'user__email')


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ('title', 'establishment', 'avg_mark', 'candidate')
    list_filter = ('establishment',)


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ('candidate', 'company', 'hire_date', 'dismissal_date')
    list_filter = ('company',)


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ('candidate', 'is_active', 'digital_maturity_score')
    list_filter = ('is_active',)


@admin.register(Vacancy)
class VacancyAdmin(admin.ModelAdmin):
    list_display = ('title', 'company')
    search_fields = ('title',)


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('title', 'weight')


@admin.register(CandidateSkill)
class CandidateSkillAdmin(admin.ModelAdmin):
    list_display = ('candidate', 'skill', 'rank')


@admin.register(VacancySkill)
class VacancySkillAdmin(admin.ModelAdmin):
    list_display = ('vacancy', 'skill')


@admin.register(HR)
class HRAdmin(admin.ModelAdmin):
    list_display = ('user', 'company')
    search_fields = ('user__email', 'company__name')


@admin.register(MaturityQuestion)
class MaturityQuestionAdmin(admin.ModelAdmin):
    list_display = ('text', 'weight')


@admin.register(CompanyMaturityAnswer)
class CompanyMaturityAnswerAdmin(admin.ModelAdmin):
    list_display = ('company', 'question', 'answer_value', 'created_at')


