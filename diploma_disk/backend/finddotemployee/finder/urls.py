from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
        CompanyViewSet, CandidateViewSet, EducationViewSet,
    ExperienceViewSet, ResumeViewSet, VacancyViewSet,
    SkillViewSet, CandidateSkillViewSet, VacancySkillViewSet,
    HRViewSet, DisciplineFeedbackViewSet, ProfileView,
    MaturityQuestionViewSet, SubmitCompanyMaturityAnswers, RecommendCandidatesView
)

router = DefaultRouter()
router.register(r'discipline-feedback', DisciplineFeedbackViewSet, basename='discipline-feedback')
router.register(r'companies', CompanyViewSet)
router.register(r'candidates', CandidateViewSet)
router.register(r'educations', EducationViewSet)
router.register(r'experiences', ExperienceViewSet)
router.register(r'resumes', ResumeViewSet)
router.register(r'vacancies', VacancyViewSet)
router.register(r'skills', SkillViewSet)
router.register(r'candidate-skills', CandidateSkillViewSet)
router.register(r'vacancy-skills', VacancySkillViewSet)
router.register(r'hrs', HRViewSet)

router.register(r'maturity-questions', MaturityQuestionViewSet)

urlpatterns = [
    path('profile/', ProfileView.as_view(), name='profile'),
    path('digital-maturity/submit/', SubmitCompanyMaturityAnswers.as_view(), name='digital-maturity-submit'),
    path('recommendations/resumes/<int:vacancy_id>/', RecommendCandidatesView.as_view(), name='recommend-resumes'),
] + router.urls

