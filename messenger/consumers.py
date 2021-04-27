import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer


class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.user_listening_group_name = "chat_%s" % self.scope["user"].username
        # Join chat group
        async_to_sync(self.channel_layer.group_add)(
            self.user_listening_group_name, self.channel_name
        )
        self.online_listening_group_name = "online_%s" % self.scope["user"].username

        # Join Online listeners group
        async_to_sync(self.channel_layer.group_add)(
            self.online_listening_group_name, self.channel_name
        )

        if self.scope["user"].profile.show_online:
            # Declare user is online
            async_to_sync(self.channel_layer.group_send)(
                self.online_listening_group_name,
                {"online": True, "type": "online_change"},
            )
            self.scope["user"].profile.online = True
            self.scope["user"].profile.save(update_fields=["online"])

        self.accept()

    def disconnect(self, close_code):
        # Declare user is offline
        async_to_sync(self.channel_layer.group_send)(
            self.online_listening_group_name, {"online": False, "type": "online_change"}
        )

        # Leave Online listeners group
        async_to_sync(self.channel_layer.group_discard)(
            self.online_listening_group_name, self.channel_name
        )

        # Leave chat group
        async_to_sync(self.channel_layer.group_discard)(
            self.user_listening_group_name, self.channel_name
        )
        self.scope["user"].profile.online = False
        self.scope["user"].profile.save(update_fields=["online"])

    # Receive message from new message group
    def chat_message(self, event):
        chat_name = event["chat_name"]
        id = event["id"]

        # Send message to WebSocket
        self.send(text_data=json.dumps({"chat_name": chat_name, "id": id}))

    def online_change(self, event):
        return


class OnlineUserConsumer(WebsocketConsumer):
    def connect(self):
        self.online_listening = None
        self.accept()

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        new_chat = text_data_json["chat_name"]
        if self.online_listening is not None:
            async_to_sync(self.channel_layer.group_discard)(
                "online_%s" % self.online_listening, self.channel_name
            )
        self.online_listening = new_chat
        async_to_sync(self.channel_layer.group_add)(
            "online_%s" % self.online_listening, self.channel_name
        )

    def online_change(self, event):
        is_online = event["online"]

        self.send(text_data=json.dumps({"is_online": is_online}))

    def disconnect(self, close_code):
        if self.online_listening is not None:
            async_to_sync(self.channel_layer.group_discard)(
                "online_%s" % self.online_listening, self.channel_name
            )
