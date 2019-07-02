var xrefTags = document.getElementsByTagName("a");
var apiUrl = "https://xref.docs.microsoft.com/query?uid=";
var XREF_RE = /xref:([A-Za-z_.\-\*\(\)\,\%0-9]+)(\?displayProperty=.+)?/i;
for (var index = 0; index < xrefTags.length; index++) {
  if (xrefTags[index].innerHTML.indexOf("xref:") > -1) {
    var xrefTag = XREF_RE.exec(xrefTags[index].innerHTML);
    const uid = encodeSpecialCharacters(xrefTag[1].trim());
    fetch(apiUrl + uid)
      .then(function (response) {
        if (response) {
          console.log(response)
          let xref = response.data[0];
          xrefTags[index].innerHTML = `<a href="${xref.href}">${xref.fullName}</a>`;
        }
      });
  }
}

function encodeSpecialCharacters(content) {
  content = content.replace("*", "%2A")
  content = content.replace("#", "%23")
  content = content.replace("`", "%60")
  return content;
}


