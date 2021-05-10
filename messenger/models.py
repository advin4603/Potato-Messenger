from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from celery.decorators import task
from webpush import send_user_notification
from django.templatetags.static import static


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True)
    show_online = models.BooleanField(default=True)
    visible = models.BooleanField(default=True)
    status = models.CharField(max_length=64, default=settings.DEFAULT_STATUS)
    birth_date = models.DateField(null=True)
    read_receipts = models.BooleanField(default=True)
    online = models.BooleanField(default=False)
    profile_picture = models.ImageField(
        default="default_pic.png", upload_to="profile_pictures"
    )

    def __str__(self):
        if self.user is not None:
            return self.user.username
        return str(self.user)


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
    sender = models.ForeignKey(
        User, on_delete=models.CASCADE, null=True, related_name="sent_messages"
    )
    receiver = models.ForeignKey(
        User, on_delete=models.CASCADE, null=True, related_name="received_messages"
    )
    reply_to = models.ForeignKey(
        "self", default=None, on_delete=models.SET_NULL, null=True, blank=True
    )
    read = models.BooleanField(default=False)
    read_on = models.DateTimeField(null=True, default=None, blank=True)


@task(name="send_push")
def send_push_task(payload, receiver):

    send_user_notification(
        user=User.objects.get(username=receiver), payload=payload, ttl=1000
    )


@receiver(post_save, sender=Message)
def notify_receiver(sender, instance: Message, created, **kwargs):
    if created:
        if instance.receiver.profile.online:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                "chat_%s" % instance.receiver.username,
                {
                    "chat_name": instance.sender.username,
                    "id": instance.id,
                    "type": "chat_message",
                },
            )
        unread_messages_num = len(
            Message.objects.all().filter(
                receiver=instance.receiver, sender=instance.sender, read=False
            )
        )
        payload = {
            "head": "New Message" if unread_messages_num == 1 else "New Messages",
            "body": f"You have {unread_messages_num} unread message{'s' if unread_messages_num > 1 else ''} from {instance.sender.username}.",
            "tag": instance.sender.username,
            "icon": "http://192.168.1.9:8000"
            + static("messenger/images/iconSquare.png"),
            "renotify": True,
        }
        send_push_task.delay(payload, instance.receiver.username)
