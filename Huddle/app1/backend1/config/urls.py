from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        'message': 'API Root',
        'version': '1.0',
        'endpoints': [
            '/admin/',
            '/api/auth/login/',
            '/api/auth/register/',
            '/api/auth/logout/',
            '/api/auth/user/',
        ]
    })

urlpatterns = [
    path('', api_root, name='api_root'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
]
