from django.contrib import admin
from django.urls import path, include
from config import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('company.urls', namespace='company')),
    path('user/', include('user.urls', namespace='user')),
    path('calls/', include('videocaller.urls', namespace='videocaller')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
