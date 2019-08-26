function insertAfter(el, referenceNode) {
  if (referenceNode && referenceNode.parentNode) {
    referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
  }
}

var h1 = document.querySelectorAll("h1");
if (h1.length > 0) {
  var h2 = document.querySelectorAll("h2");
  if (h2.length > 0) {
    var inThisArticle = document.createElement("nav");
    inThisArticle.classList.add("doc-outline")
    var inThisArticleHeader = document.createElement("h3")
    inThisArticleHeader.innerText = "In this article";
    inThisArticle.appendChild(inThisArticleHeader)
    var articleList = document.createElement("ol")
    inThisArticle.appendChild(articleList)
    for (let index = 0; index < h2.length; index++) {
      let element = document.createElement("li")
      let anchor = document.createElement("a");
      anchor.href = "#" + h2[index].innerText.replace(" ", "-");
      anchor.innerText = h2[index].innerText;
      element.appendChild(anchor);
      articleList.appendChild(element)
    }
    inThisArticle.appendChild(articleList)
    insertAfter(inThisArticle, h1[0])
  }
}
