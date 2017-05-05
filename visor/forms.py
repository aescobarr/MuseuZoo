from django.forms import ModelForm
from visor.models import WmsLayer

class WmsLayerForm(ModelForm):
    class Meta:
        model = WmsLayer
        fields = ['name', 'base_url', 'label', 'minx', 'maxx', 'miny', 'maxy']