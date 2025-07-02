from django.contrib.auth import authenticate

from rest_framework import serializers

from .models import CustomUser, RefreshToken
from .token_generators import generate_rt


class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        max_length=128,
        min_length=8,
        write_only=True
    )

    access_token = serializers.CharField(max_length=255, read_only=True)
    refresh_token = serializers.CharField(max_length=255, read_only=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'password', 'access_token', 'refresh_token']

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        token = RefreshToken.objects.create(
            token=generate_rt(),
            user=user
        )
        return {
            'email': user.email,
            'access_token': user.access_token,
            'refresh_token': token.token
        }


class LoginSerializer(serializers.Serializer):

    email = serializers.CharField(max_length=255)
    password = serializers.CharField(max_length=128, write_only=True)
    access_token = serializers.CharField(max_length=255, read_only=True)
    refresh_token = serializers.StringRelatedField(read_only=True)

    def validate(self, attrs):

        email = attrs.get('email', None)
        password = attrs.get('password', None)

        if email is None:
            raise serializers.ValidationError(
                str(attrs)
            )

        if password is None:
            raise serializers.ValidationError(
                'A password is required to log in'
            )

        user = authenticate(username=email, password=password)

        if user is None:
            raise serializers.ValidationError(
                'A user with this email and password was not found'
            )

        token = RefreshToken.objects.create(
            token=generate_rt(),
            user=user
        )

        return {
            "email": email,
            'access_token': user.access_token,
            'refresh_token': token.token
        }


class CustomUserSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        max_length=128,
        min_length=8,
        write_only=True
    )

    class Meta:
        model = CustomUser
        fields = ('email', 'is_staff', 'password')
        read_only_fields = ('is_staff',)

    def update(self, instance, validated_data):

        password = validated_data.pop('password', None)

        for key, value in validated_data.items():
            setattr(instance, key, value)

        if password is not None:
            instance.set_password(password)

        instance.save()

        return instance