from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.contrib.auth import login as auth_login, authenticate, logout as auth_logout
from django.contrib.auth.forms import AuthenticationForm
from .forms import SignupForm, ProfileForm
from django.shortcuts import render, redirect
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from collections import OrderedDict
from django.contrib.auth.models import User
from django.contrib.humanize.templatetags.humanize import naturaltime
import datetime
from .models import Message


def index(request):
    return render(request, 'messenger/index.html')

def empty(request):
    return render(request, 'messenger/empty.html')


@login_required
def changefield(request):
    if request.method == "POST":
        field = request.POST.get('field', None)
        value = request.POST.get('value', None)
        if field in ("read_receipts", "show_online"):
            value = True if value.lower() == "true" else False
        try:
            getattr(request.user, field)
            setattr(request.user, field, value)
            request.user.save()
        except AttributeError:
            try:
                setattr(request.user.profile, field, value)
                request.user.save()
            except:
                data = {'success':False}
                return JsonResponse(data)
        data = {'success':True}
        return JsonResponse(data)


@login_required
def send_message(request):
    if request.method == "POST":
        receiver = request.POST.get('receiver')
        text = request.POST.get('text')
        message = request.user.sent_messages.create(text=text, receiver=User.objects.get(username=receiver), time=datetime.datetime.now())
        return JsonResponse({'id':message.id})


@login_required
def get_chat_name(request):
    chat_name = request.GET.get('chatName', None)
    if chat_name is None:
        return JsonResponse({'chats':[]})
    else:
        return JsonResponse(
            {
                'chats': [user.username if user==request.user else user.username for user in get_chat_list(request.user, chat_name)]
            }
        )


@login_required
def fetch_chat_messages(request):
    chat_name = request.GET.get('chatName', None)
    if chat_name is None:
        return JsonResponse({'messages':[]})
    else:
        return JsonResponse(
            {
                'messages': [[i.text, naturaltime(i.time), i.sender.username, i.receiver.username] for i in get_chat_messages(request.user, User.objects.get(username=chat_name))]
            }
        )

@login_required
def fetch_message(request):
    chat_id = request.GET.get('id', None)
    if chat_id is not None:
        message = Message.objects.get(pk=chat_id)
        if message.sender == request.user or message.receiver == request.user:
            return JsonResponse(
                {
                    'text':message.text,
                    'sender':message.sender.username,
                    'receiver':message.receiver.username,
                    'time':naturaltime(message.time)
                }
            )


@login_required
def chatpage(request):
    chat_list = get_chat_list(request.user)
    if chat_list:
        chat_messages = get_chat_messages(request.user, chat_list[0])
    else:
        chat_messages = []
    
    print(chat_list)
    return render(request, 'messenger/chatpage.html', {
        "chats" : chat_list,
        "messages" : chat_messages
        })

def get_chat_messages(user, other_user):
    return (
            user.received_messages.all().filter(sender=other_user) | other_user.received_messages.all().filter(sender=user)
        ).order_by("time")

def get_chat_list(user, start_match=None):
    if start_match is None:
        return list(
            OrderedDict.fromkeys(
                    [i.receiver if i.sender==user else i.sender for i in (user.received_messages.all() | user.sent_messages.all()).order_by("-time")]
                )
            )
    else:
        return list(
            OrderedDict.fromkeys(
                    [i.receiver if i.sender==user else i.sender for i in (user.received_messages.all().filter(sender__username__startswith=start_match) | user.sent_messages.all().filter(receiver__username__startswith=start_match)).order_by("-time")]
                )
            )




@login_required
def account(request):
    user_data = {
        'username':request.user.username, 
        'first_name':request.user.first_name, 
        'last_name':request.user.last_name,
        'birth_date':str(request.user.profile.birth_date),
        'email':request.user.email,
        'status':request.user.profile.status,
        'read_receipts':request.user.profile.read_receipts,
        'show_online':request.user.profile.show_online
        }
    return render(request, 'messenger/account.html', user_data)


def logout(request):
    if request.user.is_authenticated:
        auth_logout(request)
        return HttpResponseRedirect(reverse('messenger:index'))


def signup(request):
    if request.method == 'POST':
        form_1 = SignupForm(request.POST)
        form_2 = ProfileForm(request.POST)
        
        if form_1.is_valid() and form_2.is_valid():
            user = form_1.save()
            profile = form_2.save(commit=False)
            user.profile.birth_date = profile.birth_date
            user.save()
            auth_login(request, user)
            return HttpResponseRedirect(reverse('messenger:index'))
    else:
        form_1 = SignupForm(request.POST)
        form_2 = ProfileForm(request.POST)
    return render(request, 'messenger/signup.html', {'form_1':form_1, 'form_2':form_2})


def login(request):
    if request.user.is_authenticated:
        return HttpResponseRedirect(reverse('messenger:index'))
    if request.method == "POST":
        form = AuthenticationForm(request=request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                auth_login(request, user)
                # Success logging in
                return HttpResponseRedirect(reverse('messenger:index'))
            else:
                # Error logging in
                return render(request,'messenger/login.html', {'form':form})
        else:
            # Error logging in
            return render(request,'messenger/login.html', {'form':form})
    form = AuthenticationForm()
    return render(request,'messenger/login.html', {'form':form})