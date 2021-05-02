let $image = $("#image");
let cropBoxData;
let canvasData;
let fileInput = document.querySelector("input[type=file]");
let dropzone = document.querySelector(".fileUploadLabel");
fileInput.onclick = function () {
  fileInput.value = null;
  let previewedImage = document.querySelector(".croppedDisplayPic img");
  if (previewedImage) {previewedImage.remove();}
  $("#id_x").val(null);
  $("#id_y").val(null);
  $("#id_length").val(null);
  document.querySelector(".croppedDisplayPicWrapper").classList.add("hide");
};
fileInput.addEventListener("dragenter", function () {
  fileInput.value = null;
  let previewedImg = document.querySelector(".croppedDisplayPic img");
  if (previewedImg) {previewedImg.remove();}
  document.querySelector(".croppedDisplayPicWrapper").classList.add("hide");
  dropzone.classList.add("dragover");
});
fileInput.addEventListener("dragleave", function () {dropzone.classList.remove("dragover");});
function closeCropper() {
  cropBoxData = $image.cropper("getCropBoxData");
  canvasData = $image.cropper("getCanvasData");
  $image.cropper("destroy");
}
function closeModal() {
  document.querySelector(".modal").classList.add("closeModal");
  closeCropper();
}
window.onclick = function (event) {
  if (event.target == document.querySelector(".modal")) {closeModal();}
};
function cancelImage() {document.querySelector("input[type=file]").value = null;}
document.querySelector(".closeCropModal").onclick = function () {
  closeModal();
  cancelImage();
  document.querySelector(".croppedDisplayPicWrapper").classList.add("hide");
};
$("#id_profile_picture").change(function () {
  dropzone.classList.remove("dragover");
  if (this.files && this.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
      $image.attr("src", e.target.result);
      document.querySelector(".cropModal").classList.remove("closeModal");
      document
        .querySelector(".croppedDisplayPicWrapper")
        .classList.remove("hide");
      $image.cropper({
        viewMode: 1,
        preview: ".croppedDisplayPic",
        aspectRatio: 1 / 1,
        minCropBoxWidth: 200,
        minCropBoxHeight: 200,
        ready: function () {
          $image.cropper("setCanvasData", canvasData);
          $image.cropper("setCropBoxData", cropBoxData);
        },
      });
    };
    reader.readAsDataURL(this.files[0]);
  } else {
    document.querySelector(".croppedDisplayPicWrapper").classList.add("hide");
  }
});
$(".zoomIn").click(function () {$image.cropper("zoom", 0.1);});
$(".zoomOut").click(function () {$image.cropper("zoom", -0.1);});
$(".cropAndUpload").click(function () {
  let cropData = $image.cropper("getData");
  $("#id_x").val(cropData["x"]);
  $("#id_y").val(cropData["y"]);
  $("#id_length").val(cropData["height"]);
  closeModal();
  document.querySelector(".croppedDisplayPic").appendChild(document.querySelector(".croppedDisplayPic img").cloneNode(true));
});
$(".cancel").click(function () {
  document.querySelector(".croppedDisplayPicWrapper").classList.add("hide");
  closeModal();
  cancelImage();
});
