function insertAfter(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function editbutton(el_id, data_type = "text") {
  let infoItem = document.getElementById(el_id);
  infoItem.style.marginBottom = "20px";
  let newEl = document.createElement("div");
  newEl.classList.add("editForm");
  newEl.innerHTML = `<input type="${data_type}" oninput="${data_type}Change('${el_id}')"><div class="editSubmit crossed" onclick="undoEditDel()"></div>`;
  insertAfter(infoItem, newEl);
  Array.from(document.getElementsByClassName("editButton")).forEach(
    (element) => {
      element.style.display = "none";
    }
  );
}

function undoEditDel() {
  Array.from(document.getElementsByClassName("editButton")).forEach(
    (element) => {
      element.style.display = "inline";
    }
  );
  document.querySelectorAll(".editForm").forEach((el) => el.remove());
}
function flipped(field) {
  let newVal = document.getElementById(field).children[0].children[0].checked;
  $.ajax({
    url: "/ajax/changefield/",
    type: "POST",
    data: {
      field: field,
      value: newVal,
      csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val(),
    },
    dataType: "json",
    success: function (data) {
      if (!data.success) {
        document.getElementById(
          field
        ).children[0].children[0].checked = !newVal;
      }
    },
  });
}

function textChange(field) {
  textForm = document.getElementById(field).nextSibling;
  textInput = textForm.children[0];
  textSubmit = textForm.children[1];
  if (textInput.value.length > 0 && textInput.value.length <= 128) {
    textSubmit.onclick = () => sendVal(field, textInput.value, true);
    textSubmit.classList.remove("crossed");
    textSubmit.classList.add("ticked");
  } else {
    textSubmit.onclick = undoEditDel;
    textSubmit.classList.remove("ticked");
    textSubmit.classList.add("crossed");
  }
}
function emailChange(field) {
  emailForm = document.getElementById(field).nextSibling;
  emailInput = emailForm.children[0];
  emailSubmit = emailForm.children[1];
  if (emailInput.value.length > 0 && validateEmail(emailInput.value)) {
    emailSubmit.onclick = () => sendVal(field, emailInput.value);
    emailSubmit.classList.remove("crossed");
    emailSubmit.classList.add("ticked");
  } else {
    emailSubmit.onclick = undoEditDel;
    emailSubmit.classList.remove("ticked");
    emailSubmit.classList.add("crossed");
  }
}
function dateChange(field) {
  dateForm = document.getElementById(field).nextSibling;
  dateInput = dateForm.children[0];
  dateSubmit = dateForm.children[1];
  if (dateInput.value.length > 0) {
    dateSubmit.onclick = () => sendVal(field, dateInput.value);
    dateSubmit.classList.remove("crossed");
    dateSubmit.classList.add("ticked");
  } else {
    dateSubmit.onclick = undoEditDel;
    dateSubmit.classList.remove("ticked");
    dateSubmit.classList.add("crossed");
  }
}
function sendVal(field, val, isText = false) {
  newTextField = document.getElementById(field).children[0];
  $.ajax({
    url: "/ajax/changefield/",
    type: "POST",
    data: {
      field: field,
      value: val,
      csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val(),
    },
    dataType: "json",
    success: function (data) {
      if (data.success) {
        if (isText) {
          newTextField.innerHTML = sanitize(val);
        } else {
          newTextField.innerHTML = val;
        }

        undoEditDel();
      }
    },
  });
}
function validateEmail(email) {
  var re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b/;
  return re.test(email);
}
