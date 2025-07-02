from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied, NotFound
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination

from .models import (
    Company, Candidate, Education, Experience, Resume,
    Vacancy, Skill, CandidateSkill, VacancySkill, HR, DisciplineFeedback
)
from .serializers import (
    CompanySerializer, CandidateSerializer, EducationSerializer,
    ExperienceSerializer, ResumeSerializer, VacancySerializer,
    SkillSerializer, CandidateSkillSerializer, VacancySkillSerializer,
    HRSerializer, CreateHRSerializer
)
from rest_framework.permissions import IsAuthenticated


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer


class CandidateViewSet(viewsets.ModelViewSet):
    queryset = Candidate.objects.all()
    serializer_class = CandidateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Кандидат видит только себя
        if self.request.user.is_staff:
            return super().get_queryset()
        return Candidate.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save()


class EducationViewSet(viewsets.ModelViewSet):
    queryset = Education.objects.all()
    serializer_class = EducationSerializer


class ExperienceViewSet(viewsets.ModelViewSet):
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer



class ResumeViewSet(viewsets.ModelViewSet):
    queryset = Resume.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            from .serializers import ResumeWriteSerializer
            return ResumeWriteSerializer
        from .serializers import ResumeSerializer
        return ResumeSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Resume.objects.all()
        if hasattr(user, 'candidate'):
            return Resume.objects.filter(candidate=user.candidate)
        return Resume.objects.none()

    def perform_create(self, serializer):
        if not hasattr(self.request.user, 'candidate'):
            raise PermissionDenied('Только кандидаты могут создавать резюме.')
        serializer.save()


class HRViewSet(viewsets.ModelViewSet):
    queryset = HR.objects.all()
    # serializer_class = HRSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return CreateHRSerializer
        return HRSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return HR.objects.all()
        return HR.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save()



class VacancyViewSet(viewsets.ModelViewSet):
    queryset = Vacancy.objects.all()
    serializer_class = VacancySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        try:
            hr = HR.objects.get(user=user)
            return Vacancy.objects.filter(company=hr.company)
        except HR.DoesNotExist:
            return Vacancy.objects.all()

    def perform_create(self, serializer):
        try:
            hr = HR.objects.get(user=self.request.user)
            serializer.save(company=hr.company)
        except HR.DoesNotExist:
            raise PermissionDenied("Вы не привязаны к компании")


class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer


class CandidateSkillViewSet(viewsets.ModelViewSet):
    queryset = CandidateSkill.objects.all()
    serializer_class = CandidateSkillSerializer


class VacancySkillViewSet(viewsets.ModelViewSet):
    queryset = VacancySkill.objects.all()
    serializer_class = VacancySkillSerializer


class RecommendCandidatesView(ListAPIView):
    serializer_class = CandidateSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination

    def get_queryset(self):
        vacancy_id = self.kwargs.get('vacancy_id')
        try:
            self.vacancy = Vacancy.objects.get(id=vacancy_id)
        except Vacancy.DoesNotExist:
            raise NotFound("Вакансия не найдена")

        return Candidate.objects.all()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['vacancy'] = getattr(self, 'vacancy', None)
        return context


from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import MaturityQuestion, CompanyMaturityAnswer, recalculate_company_maturity
from .serializers import MaturityQuestionSerializer, CompanyMaturityAnswerSerializer


class MaturityQuestionViewSet(viewsets.ReadOnlyModelViewSet):
    """Получение списка вопросов анкеты цифровой зрелости."""
    queryset = MaturityQuestion.objects.all().order_by('id')
    serializer_class = MaturityQuestionSerializer
    pagination_class = None
    permission_classes = [IsAuthenticated]


class SubmitCompanyMaturityAnswers(APIView):
    """Запись ответов на анкету и пересчёт индекса цифровой зрелости."""
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        hr_qs = HR.objects.filter(user=request.user)
        if not hr_qs.exists():
            return Response(
                {"detail": "Только HR‑менеджер может отвечать на анкету"},
                status=status.HTTP_403_FORBIDDEN
            )
        company = hr_qs.first().company

        if not isinstance(request.data, list):
            return Response(
                {"detail": "Ожидался список ответов"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = CompanyMaturityAnswerSerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)

        for item in serializer.validated_data:
            question = MaturityQuestion.objects.get(id=item['question_id'])
            answer_value = item['answer_value']
            CompanyMaturityAnswer.objects.update_or_create(
                company=company,
                question=question,
                defaults={'answer_value': answer_value}
            )

        recalculate_company_maturity(company)
        return Response(
            {"detail": "Ответы сохранены", "maturity_level": company.maturity_level},
            status=status.HTTP_200_OK
        )

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Определяем роль
        try:
            candidate = Candidate.objects.select_related('user').get(user=request.user)
            # вложенные резюме
            resumes = Resume.objects.filter(candidate=candidate)
            serializer = CandidateSerializer(candidate, context={'request': request})
            resume_serializer = ResumeSerializer(resumes, many=True, context={'request': request})
            return Response({
                'role': 'candidate',
                'candidate': serializer.data,
                'resumes': resume_serializer.data
            })
        except Candidate.DoesNotExist:
            pass

        try:
            hr = HR.objects.select_related('user', 'company').get(user=request.user)
            serializer = HRSerializer(hr, context={'request': request})
            company_serializer = CompanySerializer(hr.company, context={'request': request})
            return Response({
                'role': 'hr',
                'hr': serializer.data,
                'company': company_serializer.data
            })
        except HR.DoesNotExist:
            return Response({'detail': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)



from .models import DisciplineFeedback
from .serializers import DisciplineFeedbackCreateSerializer


class DisciplineFeedbackViewSet(viewsets.ModelViewSet):
    queryset = DisciplineFeedback.objects.all()
    serializer_class = DisciplineFeedbackCreateSerializer

    def get_queryset(self):
        # HR видит только свои отзывы (опционально)
        if self.request.user.is_authenticated and hasattr(self.request.user, "hr"):
            return self.queryset.filter(hr=self.request.user.hr)
        return self.queryset.none()  # или все, если нужно
