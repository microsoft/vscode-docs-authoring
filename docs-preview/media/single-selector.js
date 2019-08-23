var singleSelectorDiv = document.querySelectorAll(".op_single_selector");
for (var i = 0; i < singleSelectorDiv.length; i++) {
    var firstListInnerText = singleSelectorDiv[i].firstChild.nextElementSibling.children[0].innerText;
    var selectorHtml = `<button id="azure-single-selector-dropdown" type="button" class="dropdown-trigger is-medium button" aria-controls="azure-selector-menu" aria-expanded="false">
        <span>${firstListInnerText}</span>
        <span class="icon" aria-hidden="true">
            <span class="docon docon-chevron-down-light expanded-indicator"></span>
        </span>
    </button>`;
    var blockquote = upTo(singleSelectorDiv[i], "blockquote");
    blockquote.outerHTML = selectorHtml;
}