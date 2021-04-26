let $image = $("#image");
let cropBoxData;
let canvasData;
function closeCropper(){
    cropBoxData = $image.cropper("getCropBoxData");
    canvasData = $image.cropper("getCanvasData");
    $image.cropper("destroy");
}
function closeModal(){
    document.querySelector(".modal").style.display = "none";
    closeCropper();
}
window.onclick = function(event) {
    let modal = document.querySelector(".modal")
    if (event.target == modal) {
        closeModal();
    }
}


document.querySelector(".closeCropModal").onclick = closeModal;

$("#id_profile_picture").change(function () {
    if (this.files && this.files[0]) {
        
        var reader = new FileReader();
        reader.onload = function (e) {
            $image.attr("src", e.target.result);
            document.querySelector(".cropModal").style.display = "flex";
            $image.cropper({
                viewMode: 1,
                aspectRatio: 1/1,
                minCropBoxWidth: 200,
                minCropBoxHeight: 200,
                ready: function () {
                    $image.cropper("setCanvasData", canvasData);
                    $image.cropper("setCropBoxData", cropBoxData);
                }
            })
        }
        reader.readAsDataURL(this.files[0]);
        
    }
});

// Enable zoom in button
$(".zoomIn").click(function () {
    $image.cropper("zoom", 0.1);
});

// Enable zoom out button
$(".zoomOut").click(function () {
    $image.cropper("zoom", -0.1);
});

/* SCRIPT TO COLLECT THE DATA AND POST TO THE SERVER */
$(".cropAndUpload").click(function () {
    var cropData = $image.cropper("getData");
    $("#id_x").val(cropData["x"]);
    $("#id_y").val(cropData["y"]);
    $("#id_length").val(cropData["height"]);
    closeModal();
});