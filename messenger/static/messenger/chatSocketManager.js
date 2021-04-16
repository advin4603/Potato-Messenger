const chatSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/chat/'
);
function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
};

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
    } else{
        let chat_name = document.getElementById(data.chat_name);
        let new_chat_name = chat_name.cloneNode(true);
        chat_name.parentNode.removeChild(chat_name);
        insertAfter(document.querySelector(".search"), new_chat_name);
    }
};

chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
};
