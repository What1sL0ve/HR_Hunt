from rest_framework import serializers
from .models import (Company, Candidate, Education, Experience, Resume,
    Vacancy, Skill, CandidateSkill, VacancySkill, HR, MaturityQuestion, DisciplineFeedback)
from .utils import calculate_match_score


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'title', 'description', 'weight']

class CandidateSkillNestedSerializer(serializers.Serializer):
    skill = serializers.PrimaryKeyRelatedField(queryset=Skill.objects.all())
    rank = serializers.IntegerField(min_value=1, max_value=5)




class CandidateSkillSerializer(serializers.ModelSerializer):
    skill = SkillSerializer()

    class Meta:
        model = CandidateSkill
        fields = ['skill', 'rank']


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = '__all__'


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = '__all__'


class CandidateBaseSerializer(serializers.ModelSerializer):
    match_score = serializers.SerializerMethodField()

    class Meta:
        model = Candidate
        fields = ['id', 'full_name', 'age', 'avatar', 'about', 'match_score']

    def get_match_score(self, candidate):
        vacancy = self.context.get('vacancy')
        if not vacancy:
            return None

        try:
            maturity_weight = float(self.context['request'].query_params.get('maturity_weight', 0.3))
        except (TypeError, ValueError):
            maturity_weight = 0.3

        return calculate_match_score(candidate, vacancy, maturity_weight)


    skills = CandidateSkillSerializer(source='skills', many=True, read_only=True)

class ResumeSerializer(serializers.ModelSerializer):
    digital_maturity_score = serializers.SerializerMethodField()
    skills = CandidateSkillSerializer(source='candidate.skills', many=True, read_only=True)

    class Meta:
        model = Resume
        fields = ['id', 'name', 'candidate', 'is_active', 'digital_maturity_score', 'skills']

    def get_digital_maturity_score(self, obj):
        return obj.digital_maturity_score


class ResumeWriteSerializer(serializers.ModelSerializer):
    skills = CandidateSkillNestedSerializer(many=True, write_only=True)

    class Meta:
        model = Resume
        fields = ['is_active', 'skills']

    def create(self, validated_data):
        skills_data = validated_data.pop('skills', [])
        request = self.context['request']
        if not hasattr(request.user, 'candidate'):
            raise serializers.ValidationError('Current user is not a candidate.')
        candidate = request.user.candidate
        resume = Resume.objects.create(candidate=candidate, **validated_data)

        for skill_entry in skills_data:
            CandidateSkill.objects.update_or_create(
                candidate=candidate,
                skill=skill_entry['skill'],
                defaults={'rank': skill_entry['rank']}
            )
        return resume

    def update(self, instance, validated_data):
        skills_data = validated_data.pop('skills', None)
        # Update is_active if present
        if 'is_active' in validated_data:
            instance.is_active = validated_data['is_active']
            instance.save()

        if skills_data is not None:
            candidate = instance.candidate
            for skill_entry in skills_data:
                CandidateSkill.objects.update_or_create(
                    candidate=candidate,
                    skill=skill_entry['skill'],
                    defaults={'rank': skill_entry['rank']}
                )
        return instance


class VacancySkillSerializer(serializers.ModelSerializer):
    skill = SkillSerializer()

    class Meta:
        model = VacancySkill
        fields = ['skill', 'vacancy']


class VacancySerializer(serializers.ModelSerializer):
    company = serializers.HiddenField(default=1)
    match_score = serializers.SerializerMethodField()
    skills = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Skill.objects.all(),  # queryset обязателен для записи
    )

    class Meta:
        model = Vacancy
        fields = ['id', 'title', 'company', 'description', 'skills', 'match_score']

    def create(self, validated_data):
        # 1. достаём список объектов Skill
        skills = validated_data.pop("skills", [])

        # 2. создаём саму вакансию
        vacancy = super().create(validated_data)

        # 3. bulk-создаём записи VacancySkill
        VacancySkill.objects.bulk_create(
            [VacancySkill(vacancy=vacancy, skill=s) for s in skills]
        )
        return vacancy

    def get_match_score(self, vacancy):
        request = self.context.get('request')
        candidate = self.context.get('candidate')

        # если нет кандидата — не считаем
        if not candidate:
            return None

        try:
            maturity_weight = float(request.query_params.get('maturity_weight', 0.3))
        except (TypeError, ValueError):
            maturity_weight = 0.3

        return calculate_match_score(candidate, vacancy, maturity_weight)



class HRSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)

    class Meta:
        model = HR
        fields = ['id', 'email', 'full_name', 'company', 'company_name']


class CreateHRSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    company = serializers.PrimaryKeyRelatedField(queryset=Company.objects.all())

    class Meta:
        model = HR
        fields = ['user', 'company']


class MaturityQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaturityQuestion
        fields = ['id', 'text', 'weight']


class CompanyMaturityAnswerSerializer(serializers.Serializer):
    """Используется только для записи списка ответов."""
    question_id = serializers.IntegerField()
    answer_value = serializers.FloatField(min_value=0.0, max_value=1.0)

    def validate_question_id(self, value):
        if not MaturityQuestion.objects.filter(id=value).exists():
            raise serializers.ValidationError("Вопрос не найден")
        return value

class EducationNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ['title', 'establishment', 'avg_mark']

class ExperienceNestedSerializer(serializers.ModelSerializer):
    company = serializers.CharField(source='company.name')

    class Meta:
        model = Experience
        fields = ['company', 'hire_date', 'dismissal_date', 'about']

class CandidateSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    match_score = serializers.SerializerMethodField(read_only=True)
    skills = serializers.SerializerMethodField(read_only=True)
    resumes = serializers.SerializerMethodField(read_only=True)
    education = EducationNestedSerializer(source='education_set', many=True, read_only=True)
    experience = ExperienceNestedSerializer(source='experience_set', many=True, read_only=True)

    class Meta:
        model = Candidate
        fields = ['id', 'full_name', 'age', 'avatar', 'about', 'match_score', 'skills', 'education', 'experience', 'resumes']

    def get_match_score(self, candidate):
        vacancy = self.context.get('vacancy')
        if not vacancy:
            return None

        from .utils import calculate_match_score
        try:
            maturity_weight = float(self.context['request'].query_params.get('maturity_weight', 0.3))
        except (TypeError, ValueError):
            maturity_weight = 0.3

        return calculate_match_score(candidate, vacancy, maturity_weight)



    def get_resumes(self, candidate):
        return [r.id for r in candidate.resumes.all()]


    def get_skills(self, candidate):
        return [
            {
                'id': cs.skill.id,
                'title': cs.skill.title,
                'rank': cs.rank
            }
            for cs in candidate.skills.select_related('skill').all()
        ]

# api/serializers.py
from rest_framework import serializers
from .models import DisciplineFeedback, HR


class DisciplineFeedbackCreateSerializer(serializers.ModelSerializer):
    """Создание одного отзыва по дисциплине."""

    # hr подставляем автоматически из request.user
    hr = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = DisciplineFeedback
        fields = (
            "id",
            "candidate",
            "hr",
            "discipline",
            "knowledge_level",
            "comment",
            "created_at",
        )
        read_only_fields = ("id", "created_at")

