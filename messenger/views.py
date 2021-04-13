from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.contrib.auth import login as auth_login, authenticate, logout as auth_logout
from django.contrib.auth.forms import AuthenticationForm
from .forms import SignupForm, ProfileForm
from django.shortcuts import render, redirect
from django.urls import reverse
from django.contrib.auth.decorators import login_required


def index(request):
    return render(request, 'messenger/index.html')


@login_required
def changefield(request):
    field = request.GET.get('field', None)
    value = request.GET.get('value', None)
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
            print(field, type(value))
            return JsonResponse(data)
    data = {'success':True}
    return JsonResponse(data)


@login_required
def chatpage(request):
    return render(request, 'messenger/chatpage.html', {
        "chats":"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
        })



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
            return redirect('index')
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