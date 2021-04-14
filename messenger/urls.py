from django.urls import path
from . import views

app_name = 'messenger'

urlpatterns = [
    path('', views.index, name='index'),
    path('signup/', views.signup, name='signup'),
    path('login/', views.login, name='login'),
    path('account/', views.account, name='account'),
    path('logout/', views.logout, name='logout'),
    path('ajax/changefield/', views.changefield, name="changefield"),
    path('ajax/getchatname/', views.get_chat_name, name="get_chat_name"),
    path('chats/', views.chatpage, name='chatpage')
]
