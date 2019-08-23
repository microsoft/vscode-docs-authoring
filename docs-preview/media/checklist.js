var checklists = document.getElementsByClassName("checklist");
for (var i = 0; i < checklists.length; i++) {
    var blockquoteChecklist = upTo(checklists[i], "blockquote");
    blockquoteChecklist.innerHTML = checklists[i].outerHTML;
    blockquoteChecklist.outerHTML = checklists[i].outerHTML;
}
