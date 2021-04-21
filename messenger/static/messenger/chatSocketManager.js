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
    putChatFront(data.chat_name);
    if (data.chat_name == currentChatName){
        if (chatIsScrolledBottom()){
            
            fetchChat(data.id);
            scrollChatSmoothToBottom();
        } else{
            fetchChat(data.id);
            incrementUnread(currentChatName);
        }
    } else {
        incrementUnread(data.chat_name);
    }
};
function putChatFront(chatName){
    let chat_name = document.getElementById(chatName);
    let new_chat_name;
    if (chat_name){
        new_chat_name = chat_name.cloneNode(true);
        chat_name.parentNode.removeChild(chat_name);
        
    } else{
        new_chat_name = document.createElement("div");
        new_chat_name.innerText = chat_name;
        new_chat_name.id = chat_name;
        new_chat_name.onclick = () => fetchChats(chat_name);
    }
    insertAfter(document.querySelector(".search"), new_chat_name);
    
}
function incrementUnread(chatName){
    let chat = document.getElementById(chatName);
    if (chat.children.length > 0){
        let unreadMessages = chat.children[0];
        unreadMessages.innerText = (unreadMessages.innerText == "99+" || Number(unreadMessages.innerText)+1>99) ? "99+" : Number(unreadMessages.innerText)+1;
    }else{
        let newUnreadMessage = document.createElement("span");
        newUnreadMessage.innerText = "1";
        chat.appendChild(newUnreadMessage);
    }
}
function removeIncrement(chatName){
    let chat = document.getElementById(chatName);
    if (chat.children.length > 0){
        let unreadMessages = chat.children[0];
        unreadMessages.remove();
    }
}

chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
};
