const noLocRegex = /:::no-loc\stext=\"(.*?)\":::/gm;
const noLocFrontRegex = /:::no-loc\stext=\"/;
const noLocBackRegex = /":::/;
var noLocMatches = document.body.innerHTML.match(noLocRegex);
if (noLocMatches) {
	noLocMatches.map(match => {
		const noLocText = match.replace(noLocFrontRegex, '').replace(noLocBackRegex, '');
		document.body.innerHTML = document.body.innerHTML.replace(match, noLocText);
	});
}
