from django import forms
from .models import Profile
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from PIL import Image
from django.conf import settings


class SignupForm(UserCreationForm):
    first_name = forms.CharField(max_length=30, required=True)
    last_name = forms.CharField(max_length=30, required=True)
    email = forms.EmailField(max_length=254, required=True)

    class Meta:
        model = User
        fields = (
            "username",
            "first_name",
            "last_name",
            "email",
            "password1",
            "password2",
        )


class ProfileForm(forms.ModelForm):
    birth_date = forms.DateField(
        required=True, widget=forms.DateInput(attrs={"type": "date"})
    )

    class Meta:
        model = Profile
        fields = ("birth_date",)


class PhotoForm(forms.ModelForm):
    x = forms.FloatField(widget=forms.HiddenInput(), required=False)
    y = forms.FloatField(widget=forms.HiddenInput(), required=False)
    length = forms.FloatField(widget=forms.HiddenInput(), required=False)

    class Meta:
        model = Profile
        fields = ("profile_picture", "x", "y", "length")

    def save(self):
        profile = super(PhotoForm, self).save()

        x = self.cleaned_data.get("x")
        y = self.cleaned_data.get("y")
        length = self.cleaned_data.get("length")

        if None in (x, y, length):
            return profile

        image = Image.open(profile.profile_picture)
        cropped_image = image.crop((x, y, length + x, length + y))
        resized_image = cropped_image.resize(
            settings.PROFILE_CROP_SIZE, Image.ANTIALIAS
        )
        resized_image.save(profile.profile_picture.path)

        return profile
