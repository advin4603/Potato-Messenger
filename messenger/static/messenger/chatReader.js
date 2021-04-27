$.fn.isInViewport = function () {
  var elementTop = $(this).offset().top;
  var elementBottom = elementTop + $(this).outerHeight();

  var viewportTop = $(document.querySelector(".chatBrowser")).offset().top;
  var viewportBottom =
    viewportTop + $(document.querySelector(".chatBrowser")).height();

  return elementBottom > viewportTop && elementTop < viewportBottom;
};

function checkRead() {
  $(".False").each(function () {
    let elem = $(this);
    if ($(this).isInViewport()) {
      $.ajax({
        url: "/ajax/setread/",
        type: "POST",
        data: {
          id: this.id,
          csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val(),
        },
        dataType: "json",
        success: function (data) {
          if (data.success) {
            elem.removeClass("False");
            elem.addClass("True");
          }
        },
      });
    }
  });
}
checkRead();
var ScrollDebounce = true;
$(".chatBrowser").on("resize scroll", function () {
  if (ScrollDebounce) {
    ScrollDebounce = false;
    checkRead();
    setTimeout(function () {
      ScrollDebounce = true;
    }, 100);
  }
});
