from django.urls import path
from . import views

app_name = "messenger"

urlpatterns = [
    path("", views.index, name="index"),
    path("signup/", views.signup, name="signup"),
    path("login/", views.login, name="login"),
    path("account/", views.account, name="account"),
    path("account/<str:username>/", views.user_account, name="user_account"),
    path("logout/", views.logout, name="logout"),
    path("ajax/changefield/", views.changefield, name="changefield"),
    path("ajax/getchatname/", views.get_chat_name, name="get_chat_name"),
    path(
        "ajax/fetchchatmessages/", views.fetch_chat_messages, name="fetch_chat_messages"
    ),
    path("ajax/fetchmessage/", views.fetch_message, name="fetch_message"),
    path("ajax/sendmessage/", views.send_message, name="send_message"),
    path("chats/", views.chatpage, name="chatpage"),
    path("ajax/getnewchats/", views.get_new_chats, name="get_new_chats"),
    path("ajax/setread/", views.set_read, name="set_read"),
    path("ajax/getchatinfo/", views.get_chat_info, name="get_chat_info"),
    path("ajax/profilepicchange/", views.profile_pic_change, name="profile_pic_change"),
    path(
        "ajax/getprofilepicurl/", views.get_profile_pic_url, name="get_profile_pic_url"
    ),
    path("empty/", views.empty, name="empty"),
]
