const chatSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/chat/'
);

chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    let currentChatName = document.querySelector(".chatName").innerText;
    if (data.chat_name == currentChatName){
        if (chatIsScrolledBottom()){
            fetchChat(data.id);
            scrollChatSmoothToBottom();
        } else{
            fetchChat(data.id)
        }
    }
};

chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
};