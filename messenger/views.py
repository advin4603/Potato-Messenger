from django.http import HttpResponseRedirect, JsonResponse
from django.contrib.auth import login as auth_login, authenticate, logout as auth_logout
from django.contrib.auth.forms import AuthenticationForm
from .forms import SignupForm, ProfileForm, PhotoForm
from django.shortcuts import render, redirect
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from collections import OrderedDict
from django.contrib.auth.models import User
import datetime
from .models import Message


def index(request):
    return render(request, "messenger/index.html")


@login_required
def empty(request):
    if request.method == "POST":
        form = PhotoForm(request.POST, request.FILES)
        if form.is_valid():
            image = form.save(commit=False).profile_picture
            request.user.profile.profile_picture = image
            request.user.profile.save(update_fields=["profile_picture"])
            return redirect("messenger:index")
    else:
        form = PhotoForm()
    return render(request, "messenger/empty.html", {"form": form})


def signup(request):
    if request.method == "POST":
        form_1 = SignupForm(request.POST)
        form_2 = ProfileForm(request.POST)
        photo_form = PhotoForm(request.POST, request.FILES)

        if form_1.is_valid() and form_2.is_valid() and photo_form.is_valid():
            user = form_1.save()
            profile = form_2.save(commit=False)
            photo_profile = photo_form.save()
            user.profile.birth_date = profile.birth_date
            user.profile.profile_picture = photo_profile.profile_picture
            photo_profile.delete()
            user.save()
            auth_login(request, user)
            return HttpResponseRedirect(reverse("messenger:index"))
    else:
        form_1 = SignupForm(request.POST)
        form_2 = ProfileForm(request.POST)
        photo_form = PhotoForm()
    return render(
        request,
        "messenger/signup.html",
        {"form_1": form_1, "form_2": form_2, "photo_form": photo_form},
    )


def user_account(request, username):
    if request.user.is_authenticated and request.user.username == username:
        return HttpResponseRedirect(reverse("messenger:account"))
    user = User.objects.get(username=username)
    return render(
        request, "messenger/user_account.html", {"user": user, "profile": user.profile}
    )


@login_required
def changefield(request):
    if request.method == "POST":
        field = request.POST.get("field", None)
        value = request.POST.get("value", None)
        if field in ("read_receipts", "show_online", "visible"):
            value = True if value.lower() == "true" else False
        try:
            getattr(request.user, field)
            setattr(request.user, field, value)
            request.user.save()
        except AttributeError:
            try:
                setattr(request.user.profile, field, value)
                request.user.save()
            except AttributeError:
                data = {"success": False}
                return JsonResponse(data)
        data = {"success": True}
        return JsonResponse(data)


@login_required
def send_message(request):
    if request.method == "POST":
        receiver = request.POST.get("receiver")
        text = request.POST.get("text")
        message = request.user.sent_messages.create(
            text=text,
            receiver=User.objects.get(username=receiver),
            time=datetime.datetime.now(),
        )
        return JsonResponse({"id": message.id})


@login_required
def get_chat_name(request):
    chat_name = request.GET.get("chatName", None)
    if chat_name is None:
        return JsonResponse({"chats": []})
    return JsonResponse(
        {
            "chats": [
                (user.username, user.profile.profile_picture.url)
                for user in get_chat_list(request.user, chat_name)
            ]
        }
    )


@login_required
def set_read(request):
    if request.method == "POST":
        msg_id = int(request.POST.get("id"))
        msg = Message.objects.get(pk=msg_id)
        if msg.receiver == request.user:
            msg.read_on = datetime.datetime.now() if not msg.read else msg.read_on
            msg.read = True
            msg.save()
            return JsonResponse({"success": True})
    return JsonResponse({"success": False})


@login_required
def get_new_chats(request):
    query = request.GET.get("chatName", None)
    if not query:
        return JsonResponse({"chats": []})
    return JsonResponse(
        {
            "chats": [
                user.username
                for user in User.objects.all()
                .filter(username__startswith=query)
                .filter(profile__visible=True)
                .order_by("-last_login")
                if user != request.user
            ]
        }
    )


@login_required
def get_chat_info(request):
    id = request.GET.get("id", None)
    message = Message.objects.get(pk=int(id))
    if message.receiver == request.user or message.sender == request.user:
        return JsonResponse(
            {
                "sent_on": message.time.strftime("%a %#d %b %Y %#I:%M %p"),
                "read": message.read,
                "read_on": message.read_on.strftime("%a %#d %b %Y %#I:%M %p")
                if message.read
                else None,
            }
        )
    return JsonResponse({})


@login_required
def fetch_chat_messages(request):
    chat_name = request.GET.get("chatName", None)
    other_user = User.objects.get(username=chat_name)
    if chat_name is None:
        return JsonResponse({"messages": [], "online": False})
    else:
        return JsonResponse(
            {
                "messages": [
                    [
                        i.text,
                        i.time.strftime("%a %#d %b %Y %#I:%M %p"),
                        i.sender.username,
                        i.receiver.username,
                        i.read,
                        i.id,
                    ]
                    for i in get_chat_messages(request.user, other_user)
                ],
                "online": other_user.profile.online
                if other_user.profile.show_online
                else False,
            }
        )


@login_required
def fetch_message(request):
    chat_id = request.GET.get("id", None)
    if chat_id is not None:
        message = Message.objects.get(pk=chat_id)
        if message.sender == request.user or message.receiver == request.user:
            return JsonResponse(
                {
                    "text": message.text,
                    "sender": message.sender.username,
                    "receiver": message.receiver.username,
                    "time": message.time.strftime("%a %#d %b %Y %#I:%M %p"),
                    "read": message.read,
                    "id": message.id,
                }
            )


@login_required
def chatpage(request):
    chat_list = get_chat_list(request.user)
    if chat_list:
        chat_messages = get_chat_messages(request.user, chat_list[0])
    else:
        chat_messages = []
    other_user = User.objects.get(username=chat_list[0]).profile
    online = other_user.online if other_user.show_online else False
    return render(
        request,
        "messenger/chatpage.html",
        {
            "chats": chat_list,
            "messages": chat_messages,
            "online": "Online" if online else "Offline",
        },
    )


def get_chat_messages(user, other_user):
    return (
        user.received_messages.all().filter(sender=other_user)
        | other_user.received_messages.all().filter(sender=user)
    ).order_by("time")


def get_chat_list(user, start_match=None):
    if start_match is None:
        return list(
            OrderedDict.fromkeys(
                [
                    i.receiver if i.sender == user else i.sender
                    for i in (
                        user.received_messages.all() | user.sent_messages.all()
                    ).order_by("-time")
                ]
            )
        )
    else:
        return list(
            OrderedDict.fromkeys(
                [
                    i.receiver if i.sender == user else i.sender
                    for i in (
                        user.received_messages.all().filter(
                            sender__username__startswith=start_match
                        )
                        | user.sent_messages.all().filter(
                            receiver__username__startswith=start_match
                        )
                    ).order_by("-time")
                ]
            )
        )


@login_required
def account(request):
    user_data = {
        "username": request.user.username,
        "first_name": request.user.first_name,
        "last_name": request.user.last_name,
        "birth_date": request.user.profile.birth_date.strftime("%a %#d %b %Y"),
        "email": request.user.email,
        "status": request.user.profile.status,
        "read_receipts": request.user.profile.read_receipts,
        "show_online": request.user.profile.show_online,
        "visible": request.user.profile.visible,
        "profile_picture": request.user.profile.profile_picture,
        "photo_form": PhotoForm(),
    }
    return render(request, "messenger/account.html", user_data)


@login_required
def profile_pic_change(request):
    if request.method == "POST":
        form = PhotoForm(request.POST, request.FILES)
        photo_profile = form.save()
        request.user.profile.profile_picture = photo_profile.profile_picture
        photo_profile.delete()
        request.user.profile.save(update_fields=["profile_picture"])
    return JsonResponse({"url": request.user.profile.profile_picture.url})


def logout(request):
    if request.user.is_authenticated:
        auth_logout(request)
        return HttpResponseRedirect(reverse("messenger:index"))


def login(request):
    if request.user.is_authenticated:
        return HttpResponseRedirect(reverse("messenger:index"))
    if request.method == "POST":
        form = AuthenticationForm(request=request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get("username")
            password = form.cleaned_data.get("password")
            user = authenticate(username=username, password=password)
            if user is not None:
                auth_login(request, user)
                # Success logging in
                return HttpResponseRedirect(reverse("messenger:index"))
            else:
                # Error logging in
                return render(request, "messenger/login.html", {"form": form})
        else:
            # Error logging in
            return render(request, "messenger/login.html", {"form": form})
    form = AuthenticationForm()
    return render(request, "messenger/login.html", {"form": form})
