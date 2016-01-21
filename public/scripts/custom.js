(function() {
  var videos = document.querySelectorAll("[data-video]");
  for (var i = 0; i < videos.length; i++) {
    var video  = videos[i];
    video.src = "http://placehold.it/" + video.width + "x" + video.height + "?text=►";
    video.onclick = function() { this.src = this.getAttribute("data-video"); };
  }
})();
