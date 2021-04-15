function searchKnownChats(){
    let inputText = document.getElementById("searchChat").value;
    document.querySelectorAll(".chat").forEach(element => {
        element.parentNode.removeChild(element);        
    });
    $.ajax({
        url: '/ajax/getchatname/',
        data: {
          'chatName':inputText
        },
        dataType: 'json',
        success: function (data) {
            let chat_list = data['chats'];
            parentElement = document.querySelector(".left");
            let focussedChat = document.querySelector(".chatName").innerText;
            chat_list.forEach(chatName => {
                let newElem = document.createElement("div");
                newElem.innerHTML = chatName;
                newElem.classList.add("chat");
                if (chatName == focussedChat){
                    newElem.classList.add("chatFocus");
                }
                newElem.onclick = () => fetchChats(chatName);
                newElem.id = chatName;
                parentElement.appendChild(newElem);
            });
        }
    });
};


function fetchChats(chatName){
    if (document.querySelector(".chatName").innerText==chatName){
        return;
    }
    let oldFocussedChat = document.querySelector(".chatFocus");
    if (oldFocussedChat){
        oldFocussedChat.classList.remove("chatFocus");
    }
    document.getElementById(chatName).classList.add("chatFocus");
    document.querySelector(".chatName").innerText = chatName;
    Array.from(document.querySelector(".chatBrowser").children).forEach(element => {
        element.parentNode.removeChild(element);        
    });
    $.ajax({
        url: '/ajax/fetchchatmessages/',
        data: {
          'chatName':chatName
        },
        dataType: 'json',
        success: function (data) {
            let message_list = data['messages'];
            message_list.forEach(data => {
                let text, time, sender, receiver;
                [text, time, sender, receiver] = data;
                let newChatBubbleWrapper = document.createElement("div");
                newChatBubbleWrapper.classList.add("chatBubbleWrapper");
                let newChatBubble = document.createElement("div");
                newChatBubble.classList.add("chatBubble");
                newTime = document.createElement("div");
                newTime.innerText = time;
                if (receiver == chatName){
                    newChatBubble.classList.add("rightChat")
                    newTime.style.textAlign= "right";
                }
                newChatBubble.innerText = text;
                newChatBubbleWrapper.appendChild(newChatBubble);
                document.querySelector(".chatBrowser").appendChild(newChatBubbleWrapper);
                document.querySelector(".chatBrowser").appendChild(newTime);

                

            });
        }
    });
};

