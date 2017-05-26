from django.forms import ModelForm
from visor.models import WmsLayer, GeoServerRaster, DataFile, FILE_TYPES
from django import forms
from visor.helpers import process_file_geoserver, check_file_already_uploaded


class WmsLayerForm(ModelForm):
    class Meta:
        model = WmsLayer
        fields = ['name', 'base_url', 'label', 'minx', 'maxx', 'miny', 'maxy']

class GeoServerRasterUpdateForm(ModelForm):
    class Meta:
        model = GeoServerRaster
        fields = ['name', 'tags']
        widgets = {'name': forms.TextInput, 'tags': forms.HiddenInput}

class GeoServerRasterForm(ModelForm):
    class Meta:
        model = GeoServerRaster
        fields = ['name', 'file', 'tags']
        widgets = {'name': forms.TextInput, 'file': forms.FileInput, 'tags': forms.HiddenInput}

    def clean(self):
        cleaned_data = super(GeoServerRasterForm, self).clean()
        check_file_already_uploaded(cleaned_data.get("file"))
        process_file_geoserver(cleaned_data.get("file"))
        return cleaned_data


class DataFileForm(ModelForm):
    file_type = forms.ChoiceField(required=True, widget=forms.Select, choices=FILE_TYPES)

    class Meta:
        model = DataFile
        fields = ['name', 'file', 'file_type', 'tags']
        widgets = {'name': forms.TextInput, 'file': forms.FileInput, 'tags': forms.HiddenInput}