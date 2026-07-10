from rest_framework import permissions
from django.contrib.auth.hashers import check_password
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
from .models import ProductApiKey

class HasAPIKey(permissions.BasePermission):
    """
    Validates the X-Api-Key header against active ProductApiKeys.
    Falls back to the first active key if none is provided for backwards compatibility.
    Stores api_key_obj, api_key_product, and raw_api_key on the underlying
    Django request (request._request) so DRF's __getattr__ proxy exposes them
    as request.api_key_obj, request.api_key_product, request.raw_api_key in views.
    """
    def has_permission(self, request, view):
        raw_api_key = request.headers.get("X-Api-Key")
        valid_api_key_obj = None

        if raw_api_key:
            for api_key_obj in ProductApiKey.objects.filter(is_active=True):
                if check_password(raw_api_key, api_key_obj.api_key_hash):
                    valid_api_key_obj = api_key_obj
                    break
            if not valid_api_key_obj:
                raise AuthenticationFailed("Invalid API Key")
        else:
            # Fallback to first active API key when no key is provided.
            valid_api_key_obj = ProductApiKey.objects.filter(is_active=True).first()
            if not valid_api_key_obj:
                raise AuthenticationFailed("No active API key found")

        # Store on the underlying Django HttpRequest so DRF's __getattr__
        # proxy exposes them cleanly as request.* in views.
        underlying = request._request
        underlying.api_key_obj = valid_api_key_obj
        underlying.api_key_product = valid_api_key_obj.product
        underlying.raw_api_key = (
            raw_api_key
            if raw_api_key
            else getattr(settings, "X_API_KEY", None)
        )

        return True
