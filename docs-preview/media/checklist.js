var checklists = document.querySelectorAll(".checklist");
for (var i = 0; i < checklists.length; i++) {
    var blockquoteChecklist = upTo(checklists[i], "blockquote");
    blockquoteChecklist.outerHTML = checklists[i].outerHTML;
}
