var blockquoteTags = document.getElementsByTagName("blockquote");
var alerts = ["NOTE", "TIP", "IMPORTANT", "CAUTION", "WARNING"];

alerts.map(aa => {
  for (var i = 0; i < blockquoteTags.length; i++) {
    let tag = blockquoteTags[i];
    if (tag.innerHTML.toUpperCase().indexOf(`[!${aa}]`) > -1) {
      tag.setAttribute("class", aa);
      var alertType = blockquoteTags[i].innerHTML;
      var addBreak = alertType.replace(`[!${aa}]`, `<strong>${aa}</strong><br>`);
      blockquoteTags[i].innerHTML = addBreak;
    }
  }
});