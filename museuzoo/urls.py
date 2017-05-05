from django.conf.urls import url,include
from django.contrib import admin
from visor import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'wmslayers', views.WmsLayerViewSet)

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$', views.index, name='index'),
    url(r'^layer_edit/(?P<pk>\w+)$', views.WmsLayerUpdateView.as_view(), name='layer_edit'),
    url(r'^layer_list/$', views.WmsLayerListView.as_view(), name='layer_list'),
    url(r'^layerloader/$', views.layerloader, name='layerloader'),
    url(r'^layerloader_json/$', views.layerloader_api, name='layerloader_json'),
    url(r'^api/',include(router.urls)),
    url(r'^api-auth/',include('rest_framework.urls', namespace='rest_framework')),
]
