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
            console.log(focussedChat)
            chat_list.forEach(chatName => {
                let newElem = document.createElement("div");
                newElem.innerHTML = chatName;
                newElem.classList.add("chat");
                if (chatName == focussedChat){
                    newElem.classList.add("chatFocus");
                }
                parentElement.appendChild(newElem);
            });
        }
    });
};