var nextStepActionData = document.getElementsByClassName("nextstepaction");
var nextStepActionInnerHTML = nextStepActionData[0].innerHTML;
var nextStepActionInnerText = nextStepActionData[0].textContent.trim();

var newHtml = nextStepActionInnerHTML.replace(`>${nextStepActionInnerText}`, ` class="button is-primary has-text-wrap">${nextStepActionInnerText}`);
nextStepActionData[0].innerHTML = newHtml;