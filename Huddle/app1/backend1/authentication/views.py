import secrets
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateAPIView, CreateAPIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    UserSerializer,
    RegisterSerializer,
    PasswordResetSerializer,
    PasswordResetConfirmSerializer
)

User = get_user_model()

class LoginView(APIView):
    authentication_classes = []
    permission_classes = (AllowAny,)

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        user = authenticate(request, username=email, password=password)
        if not user:
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_400_BAD_REQUEST)

        refresh = RefreshToken.for_user(user)

        return Response({
            "token": str(refresh.access_token),
            "refresh": str(refresh),
            "user_id": user.id,
            "email": user.email,
            "username": user.username,
            "name": user.name
        }, status=status.HTTP_200_OK)


class RegisterView(CreateAPIView):
    authentication_classes = []
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        user_data = UserSerializer(user).data

        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "User registered successfully.",
            "token": str(refresh.access_token),
            "refresh": str(refresh),
            "user_id": user.id,
            "email": user.email,
            "user": user_data
        }, status=status.HTTP_201_CREATED)


class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        # With API keys, logout is a local client action (clearing localStorage).
        # We can just return success.
        return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)


class UserProfileView(RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        # request.user is populated by ApiKeyAuthentication
        return self.request.user


class UserListView(APIView):
    permission_classes = []

    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    authentication_classes = []
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)

        token = default_token_generator.make_token(user)
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        
        frontend_domain = request.headers.get('Origin', 'http://localhost:8000')
        reset_link = f"{frontend_domain}/password-reset/confirm/{uidb64}/{token}/"

        subject = "Password Reset Request"
        message = f"Hello {user.name or user.username},\n\nYou requested a password reset. Click the link below to set a new password:\n\n{reset_link}"
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL or 'noreply@authservices.com',
            [email],
            fail_silently=True,
        )

        response_data = {
            "message": "Password reset email sent."
        }
        
        if settings.DEBUG:
            response_data.update({
                "uidb64": uidb64,
                "token": token,
                "reset_link": reset_link
            })

        return Response(response_data, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    authentication_classes = []
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Password has been reset successfully."}, status=status.HTTP_200_OK)
