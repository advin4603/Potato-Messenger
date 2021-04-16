import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.user_listening_group_name = 'chat_%s' % self.scope['user'].username

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.user_listening_group_name,
            self.channel_name
        )

        self.accept()
        self.scope['user'].profile.online = True
        self.scope['user'].profile.save()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.user_listening_group_name,
            self.channel_name
        )
        self.scope['user'].profile.online = False
        self.scope['user'].profile.save()

    # Receive message from room group
    def chat_message(self, event):
        chat_name = event['chat_name']
        id = event['id']

        # Send message to WebSocket
        self.send(text_data=json.dumps({
            'chat_name': chat_name,
            'id':id
        }))