var mxtdBreakAll = document.querySelectorAll('.mx-tdBreakAll');
for (var i = 0; i < mxtdBreakAll.length; i++) {
	var blockquotemxtdBreakAll = upTo(mxtdBreakAll[i], 'blockquote');
	blockquotemxtdBreakAll.outerHTML = mxtdBreakAll[i].outerHTML;
}
var mxtdCol2BreakAll = document.querySelectorAll('.mx-tdCol2BreakAll');
for (var i = 0; i < mxtdCol2BreakAll.length; i++) {
	var blockquotemxtdCol2BreakAll = upTo(mxtdCol2BreakAll[i], 'blockquote');
	blockquotemxtdCol2BreakAll.outerHTML = mxtdCol2BreakAll[i].outerHTML;
}
