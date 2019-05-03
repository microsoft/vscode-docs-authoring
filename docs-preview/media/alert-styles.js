var blockquoteTags = document.getElementsByTagName("blockquote");

for (var i = 0; i < blockquoteTags.length; i++) {
  if (blockquoteTags[i].innerHTML.indexOf("[!NOTE]") > -1) {
    blockquoteTags[i].setAttribute("class", "NOTE");
    var note = blockquoteTags[i].innerHTML;
    var addBreak = note.replace("[!NOTE]", "NOTE<br>");
    blockquoteTags[i].innerHTML = addBreak;
  }
  if (blockquoteTags[i].innerHTML.indexOf("[!TIP]") > -1) {
    blockquoteTags[i].setAttribute("class", "TIP");
    var note = blockquoteTags[i].innerHTML;
    var addBreak = note.replace("[!TIP]", "TIP<br>");
    blockquoteTags[i].innerHTML = addBreak;
  }
  if (blockquoteTags[i].innerHTML.indexOf("[!IMPORTANT]") > -1) {
    blockquoteTags[i].setAttribute("class", "IMPORTANT");
    var note = blockquoteTags[i].innerHTML;
    var addBreak = note.replace("[!IMPORTANT]", "IMPORTANT<br>");
    blockquoteTags[i].innerHTML = addBreak;
  }
  if (blockquoteTags[i].innerHTML.indexOf("[!CAUTION]") > -1) {
    blockquoteTags[i].setAttribute("class", "CAUTION");
    var note = blockquoteTags[i].innerHTML;
    var addBreak = note.replace("[!CAUTION]", "CAUTION<br>");
    blockquoteTags[i].innerHTML = addBreak;
  }
  if (blockquoteTags[i].innerHTML.indexOf("[!WARNING]") > -1) {
    blockquoteTags[i].setAttribute("class", "WARNING");
    var note = blockquoteTags[i].innerHTML;
    var addBreak = note.replace("[!WARNING]", "WARNING<br>");
    blockquoteTags[i].innerHTML = addBreak;
  }
}
