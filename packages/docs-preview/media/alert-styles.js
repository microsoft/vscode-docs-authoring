var blockquoteTags = document.getElementsByTagName('blockquote');
var alerts = [
	{
		name: 'Note',
		icon: 'docon-status-error-outline'
	},
	{
		name: 'Tip',
		icon: 'docon-lightbulb'
	},
	{
		name: 'Important',
		icon: 'docon-status-info-outline'
	},
	{
		name: 'Caution',
		icon: 'docon-status-failure-outline'
	},
	{
		name: 'Warning',
		icon: 'docon-status-warning-outline'
	}
];
alerts.map(aa => {
	for (var i = 0; i < blockquoteTags.length; i++) {
		let tag = blockquoteTags[i];
		if (tag.innerHTML.toUpperCase().indexOf(`[!${aa.name.toUpperCase()}]`) > -1) {
			tag.setAttribute('class', `${aa.name.toUpperCase()}`);
			var alertType = blockquoteTags[i].innerHTML;
			var addBreak = alertType.replace(
				new RegExp(`\\[\\!${aa.name}\\]`, 'i'),
				`<strong><span class="docon ${aa.icon}"></span> ${aa.name}</strong><br/><hr/>`
			);
			blockquoteTags[i].innerHTML = addBreak;
		}
	}
});
