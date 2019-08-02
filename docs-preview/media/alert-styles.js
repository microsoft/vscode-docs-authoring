var blockquoteTags = document.getElementsByTagName("blockquote");
var alerts = ["Note", "Tip", "Important", "Caution", "Warning"];

alerts.map(aa => {
  for (var i = 0; i < blockquoteTags.length; i++) {
    let tag = blockquoteTags[i];
    if (tag.innerHTML.toUpperCase().indexOf(`[!${aa.toUpperCase()}]`) > -1) {
      tag.setAttribute("class", aa.toUpperCase());
      var alertType = blockquoteTags[i].innerHTML;
      var addBreak = alertType.replace(`[!${aa.toUpperCase()}]`, `<strong>${aa}</strong><br/><hr/>`);
      blockquoteTags[i].innerHTML = addBreak;
    }
  }
});