from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    show_online = models.BooleanField(default=True)
    status = models.CharField(max_length=64, default=settings.DEFAULT_STATUS)
    birth_date = models.DateField(null=True)
    read_receipts = models.BooleanField(default=True)

    def __str__(self):
        return self.user.username

@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_profile(sender, instance, **kwargs):
    instance.profile.save()


class Message(models.Model):
    text = models.TextField()
    time = models.DateTimeField()
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='received_messages')
    reply_to = models.ForeignKey('self', default=None, on_delete=models.SET_NULL, null=True, blank=True)
    read = models.BooleanField(default=False)
    read_on = models.DateTimeField(null=True, default=None, blank=True)
