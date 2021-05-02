function searchKnownChats() {
  let inputText = document.getElementById("searchChat").value;
  $.ajax({
    url: "/ajax/getchatname/",
    data: {
      chatName: inputText,
    },
    dataType: "json",
    success: function (data) {
      let unreadCounter = {};
      document.querySelectorAll(".chat").forEach((element) => {
        if (element.children.length > 1){unreadCounter[element.id] = element.children[1].cloneNode(true);}
        element.parentNode.removeChild(element);
      });
      let chat_list = data["chats"];
      let parentElement = document.querySelector(".left");
      let focussedChat = document.querySelector(".chatName").innerText;
      chat_list.forEach((chatName) => {
        let newElem = document.createElement("div");
        newElem.classList.add("chat");
        let newImg = document.createElement("img");
        newImg.src = chatName[1];
        newImg.classList.add("profilePic");
        newElem.appendChild(newImg);
        newElem.innerHTML += chatName[0];
        if (chatName[0] == focussedChat) {newElem.classList.add("chatFocus");}
        newElem.onclick = () => fetchChats(chatName[0]);
        newElem.id = chatName[0];
        if (chatName[0] in unreadCounter){newElem.appendChild(unreadCounter[chatName[0]]);}
        parentElement.appendChild(newElem);
      });
    },
  });
}
document.querySelector(".chatName").onclick = () => {window.open(document.querySelector("#accountUrl").value+document.querySelector(".chatName").innerText+ "/");};
function fetchChats(chatName) {
  let oldFocussedChat = document.querySelector(".chatFocus");
  if (oldFocussedChat) {oldFocussedChat.classList.remove("chatFocus");}
  document.getElementById(chatName).classList.add("chatFocus");
  if (document.querySelector(".chatName").innerText == chatName) {return;}
  removeIncrement(chatName);
  changeOnline(chatName);
  document.querySelector(".chatName").innerText = chatName;
  $(".chatNameWrapper .profilePic").attr('src', $(`#${chatName} .profilePic`).attr('src'))
  reloadChatBrowser(chatName);
}
function reloadChatBrowser(chatName) {
  Array.from(document.querySelector(".chatBrowser").children).forEach((element) => {element.parentNode.removeChild(element);});
  $.ajax({
    url: "/ajax/fetchchatmessages/",
    data: {chatName: chatName},
    dataType: "json",
    success: function (data) {
      let message_list = data["messages"];
      document.querySelector(".isOnline").id = (data["online"])? "Online":"Offline";
      message_list.forEach((item) => {putChat(item);});
      scrollChatToBottom();
      checkRead();
    },
  });
}
function putChat(data) {
  let chatName = document.querySelector(".chatName").innerText;
  let text, time, sender, receiver, read, id;
  [text, time, sender, receiver, read, id] = data;
  let newChatBubbleWrapper = document.createElement("div");
  newChatBubbleWrapper.classList.add("chatBubbleWrapper");
  let newChatBubble = document.createElement("div");
  newChatBubble.classList.add("chatBubble");
  newChatBubble.id = id;
  let newMessageInfoWrapper = document.createElement("div");
  newMessageInfoWrapper.classList.add("messageInfoWrapper");
  let newMessageInfo = document.createElement("span");
  newMessageInfo.classList.add("messageInfo");
  let newTime = document.createElement("div");
  newTime.innerText = time;
  newTime.classList.add("datetime");
  let newInfo = document.createElement("div");
  newInfo.id = id;
  newInfo.classList.add("info");
  newInfo.innerText = "i";
  newInfo.onclick = () => infoButton(newInfo.id);
  if (receiver == chatName) {
    newChatBubble.classList.add("rightChat");
    newMessageInfoWrapper.classList.add("messageInfoRight");
    newMessageInfo.appendChild(newTime);
    newMessageInfo.appendChild(newInfo);
  } else {
    const isRead = read ? "True" : "False";
    newChatBubble.classList.add(isRead);
    newMessageInfo.appendChild(newInfo);
    newMessageInfo.appendChild(newTime);
  }
  newChatBubble.innerText = text;
  $(newChatBubble).linkify();
  newChatBubbleWrapper.appendChild(newChatBubble);
  newMessageInfoWrapper.appendChild(newMessageInfo);
  checkRead();
  document.querySelector(".chatBrowser").appendChild(newChatBubbleWrapper);
  document.querySelector(".chatBrowser").appendChild(newMessageInfoWrapper);
  checkRead();
}
function fetchChat(id) {
  $.ajax({
    url: "/ajax/fetchmessage/",
    data: {id: id},
    dataType: "json",
    success: function (data) {putChat([data.text, data.time, data.sender, data.receiver, data.read, id]);},
  });
}

document.querySelector(".messageSend").onclick = function () {
  let text = document.querySelector("#messageInput").value;
  document.querySelector("#messageInput").value = "";
  let receiver = document.querySelector(".chatName").innerText;
  if (text){
    $.ajax({
      url: "/ajax/sendmessage/",
      type: "POST",
      data: {
        receiver: receiver,
        text: text,
        csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val(),
      },
      dataType: "json",
      success: function (data) {
        fetchChat(data["id"]);
        putChatFront(receiver);
        removeIncrement(receiver);
        scrollChatSmoothToBottom();
      },
    })}
};
function scrollChatSmoothToBottom(time = 500) {$(".chatBrowser").animate({scrollTop: $(".chatBrowser")[0].scrollHeight},time);}
function scrollChatToBottom() {document.querySelector(".chatBrowser").scroll(0, document.querySelector(".chatBrowser").scrollHeight);}
function chatIsScrolledBottom() {
  let browser = document.querySelector(".chatBrowser");
  let $browser = $(browser);
  return (browser.scrollHeight - $browser.scrollTop() - $browser.outerHeight() < 1);
}
document.querySelector(".newChat").onclick = function () {document.querySelector(".newChatModal").style.display = "flex";};
document.querySelectorAll(".modalContent span").forEach((modal) => {modal.onclick = function () {document.querySelectorAll(".modal").forEach((modal) => {modal.style.display = "none";});};});
window.onclick = function (event) {
  document.querySelectorAll(".modal").forEach((modal) => {
    if (event.target == modal) {modal.style.display = "none";}
  });
};
function searchNewChats() {
  const queryText = document.querySelector("#addChat").value;
  document.querySelectorAll(".newChatNameWrapper").forEach((elem) => elem.remove());
  $.ajax({
    url: "/ajax/getnewchats/",
    data: {chatName: queryText},
    dataType: "json",
    success: function (data) {
      let chatBrowser = document.querySelector(".newChatNameBrowser");
      data["chats"].forEach((chatName) => {
        let newElem = document.createElement("div");
        newElem.classList.add("newChatNameWrapper");
        newElem.innerHTML = `<div class="newChatName" onclick="addNewChat('${chatName[0]}', '${chatName[1]}')"><img src="${chatName[1]}" class="profilePic">${chatName[0]}</div>`;
        chatBrowser.appendChild(newElem);
      });
    },
  });
}
function addNewChat(chatName, picUrl) {
  document.querySelector(".modal").style.display = "none";
  putChatFront(chatName, picUrl);
  fetchChats(chatName);
}
function infoButton(id) {
  document.querySelector(".infoModal").style.display = "flex";
  $.ajax({
    url: "/ajax/getchatinfo/",
    data: {id: id},
    dataType: "json",
    success: function (data) {
      let parent = document.querySelector(".infoBrowser ul");
      parent.innerHTML = "";
      let sentOn = document.createElement("li");
      sentOn.innerText = "Sent On : " + data.sent_on;
      parent.appendChild(sentOn);
      let read = document.createElement("li");
      read.innerText = (data.read)? "Message Read on " + data.read_on : "Message Not Read";
      parent.appendChild(read);
    },
  });
}
document.querySelectorAll(".info").forEach((elem) => {elem.onclick = () => {infoButton(elem.id);};});
document.querySelector(".toggleLeft").onclick = closeChats;
document.querySelector(".collapseLeft").onclick = closeChats;
function openChats(){
  document.querySelector(".toggleLeft").onclick = closeChats;
  document.querySelector(".leftWrapper").classList.remove("leftClose");
  document.querySelector(".rightWrapper").classList.remove("rightLeftClose");
  document.querySelector(".chatFooterWrapper").classList.remove("inputLeftClose");
  document.querySelector(".toggleLeft").innerText = "<";
}
function closeChats(){
  document.querySelector(".toggleLeft").onclick = openChats;
  document.querySelector(".leftWrapper").classList.add("leftClose");
  document.querySelector(".rightWrapper").classList.add("rightLeftClose");
  document.querySelector(".chatFooterWrapper").classList.add("inputLeftClose");
  document.querySelector(".toggleLeft").innerText = ">";
}
$(function () {
  $("pre").linkify();
  scrollChatToBottom();
});
