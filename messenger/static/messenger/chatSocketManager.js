const chatSocket = new WebSocket("ws://" + window.location.host + "/ws/chat/");
chatSocket.onmessage = function (e) {
  const data = JSON.parse(e.data);
  let currentChatName = document.querySelector(".chatName").innerText;
  let inputText = document.getElementById("searchChat").value;
  if (!data.chat_name.startsWith(inputText)) {return;}
  $.ajax({
    url: "/ajax/getprofilepicurl/",
    data: {"username":data.chat_name},
    dataType: "json",
    success: function (response) {
      putChatFront(data.chat_name, response.url);
      if (data.chat_name == currentChatName) {
        if (chatIsScrolledBottom()) {
          fetchChat(data.id);
          scrollChatSmoothToBottom();
          checkRead();
        } else {
          fetchChat(data.id);
          incrementUnread(currentChatName);
        }
      } else {
        incrementUnread(data.chat_name);
      }
    }
  });
};
function putChatFront(chatName, profilePicUrl) {
  let chat_name = document.getElementById(chatName);
  let new_chat_name;
  if (chat_name) {
    new_chat_name = chat_name.cloneNode(true);
    chat_name.parentNode.removeChild(chat_name);
  } else {
    newImg = document.createElement("img");
    newImg.src = profilePicUrl;
    newImg.classList.add("profilePic");
    new_chat_name = document.createElement("div");
    new_chat_name.appendChild(newImg);
    let newText = document.createTextNode(chatName);
    new_chat_name.appendChild(newText);
    new_chat_name.id = chatName;
    new_chat_name.classList.add("chat");
    new_chat_name.onclick = () => fetchChats(chatName);
  }
  insertAfter(document.querySelector(".search"), new_chat_name);
}
function incrementUnread(chatName) {
  let chat = document.getElementById(chatName);
  if (chat.children.length > 1) {
    let unreadMessages = chat.children[1];
    unreadMessages.innerText = (unreadMessages.innerText == "99+" || Number(unreadMessages.innerText) + 1 > 99)? "99+" : Number(unreadMessages.innerText) + 1;
  } else {
    let newUnreadMessage = document.createElement("span");
    newUnreadMessage.innerText = "1";
    chat.appendChild(newUnreadMessage);
  }
}
function removeIncrement(chatName) {
  let chat = document.getElementById(chatName);
  if (chat.children.length > 1) {chat.children[1].remove();}
}
chatSocket.onclose = function (e) {console.error("Chat socket closed unexpectedly");};
