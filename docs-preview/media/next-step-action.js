var nextStepActionDiv = document.querySelectorAll(".nextstepaction");
for (var i = 0; i < nextStepActionDiv.length; i++) {
    var nextStepActionInnerHTML = nextStepActionDiv[i].innerHTML;
    var nextStepActionInnerText = nextStepActionDiv[i].textContent.trim();
    var newHtml = nextStepActionInnerHTML.replace(`>${nextStepActionInnerText}`, ` class="button is-primary has-text-wrap">${nextStepActionInnerText}`);
    var blockquote = upTo(nextStepActionDiv[i], "blockquote");
    blockquote.outerHTML = newHtml;
}
