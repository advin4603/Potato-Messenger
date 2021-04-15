const chatSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/chat/'
);

chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    alert(data.chat_name)
};

chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
};