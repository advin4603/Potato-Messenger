document.querySelector(".dropDown").onclick = linkAdd;
function insertAfter(referenceNode, newNode) {referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);}
function linkAdd() {
  let newLinks = document.querySelector(".links").cloneNode(true);
  newLinks.classList.remove("links");
  newLinks.classList.add("dropDownLinks");
  let dropDown = document.querySelector(".dropDown");
  dropDown.innerHTML = "&times;";
  insertAfter(dropDown, newLinks);
  dropDown.onclick = linkRemove;
}
function linkRemove() {
  document.querySelector(".dropDownLinks").remove();
  let dropDown = document.querySelector(".dropDown");
  dropDown.innerText = "v";
  dropDown.onclick = linkAdd;
}
