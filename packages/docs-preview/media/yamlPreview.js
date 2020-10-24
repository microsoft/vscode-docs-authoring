const desktopMinWidth = 1088 / 2;
const desktopOnlyQuery = window.matchMedia('screen and (min-width: ' + desktopMinWidth + 'px)');
function setMasonryContainerHeight(masonryElement) {
	const bottomPadding = 128;
	// assumes .columns.is-masonry is the offsetParent because offsetTop returns the distance of the current element relative to the top of the offsetParent node.
	const cards = Array.from(masonryElement.querySelectorAll('.column'));
	const height = Math.max(...cards.map(x => x.offsetTop + x.offsetHeight)) + bottomPadding;
	masonryElement.style.height = height + 'px';
}
document.addEventListener('DOMContentLoaded', function (event) {
	const masonryElement = document.getElementsByClassName('is-masonry')[0];
	setMasonryContainerHeight(masonryElement, desktopMinWidth);
});

window.addEventListener('resize', function (event) {
	const masonryElement = document.getElementsByClassName('is-masonry')[0];
	setMasonryContainerHeight(masonryElement, desktopMinWidth);
});
var prev = document.querySelector('button[data-facet*="featured"]');
var buttons = document.querySelectorAll('button');
for (var i = 0; i < buttons.length; i++) {
	buttons[i].addEventListener('click', function () {
		document.querySelector('h3').innerText = this.innerText;
		//document.querySelector('#category-hub-dropdown').innerText = this.innerHTML;
		if (prev.innerText == undefined)
			prev = document.querySelectorAll('button[data-facet*="featured"]');
		resetButtonStyle(prev);
		setClickedButtonStyle(this);
		switch (this.innerText) {
			case 'All':
				revealAllSection(1);
				break;
			default:
				hideAll();
				revealAllSection(0);
				revealCategory(this.innerText);
				break;
		}
		prev = this;
	});
}

function hideAll() {
	var cards = document.getElementById('product-cards').querySelectorAll('div[class*=item-column]');
	'hideAll ' + cards.length;
	for (var i = 0; i < cards.length; i++) {
		cards[i].setAttribute('hidden', 'hidden');
	}
}

function revealCategory(category) {
	console.log(category);
	var cards = document.querySelectorAll('div[data-categories*=' + '"' + category + '"' + ']');
	console.log('cate ' + cards.length);
	for (var j = 0; j < cards.length; j++) {
		cards[j].removeAttribute('hidden');
	}
}
function setClickedButtonStyle(element) {
	if (element.innerText == 'Featured') {
		element.className =
			'featured-facet button has-inner-focus is-full-width has-flex-justify-content-space-between is-text is-small has-text-weight-semibold justify-content- has-background-secondary-light';
	} else if (element.innerText == 'All') {
		element.className =
			'all-facet button has-inner-focus is-full-width has-flex-justify-content-space-between is-text is-small has-text-weight-semibold justify-content- has-background-secondary-light';
	} else {
		element.className =
			'hub-facet button has-inner-focus is-full-width has-flex-justify-content-space-between is-text is-small has-text-weight-semibold justify-content- has-background-secondary-light';
	}
}

function resetButtonStyle(element) {
	if (element.innerText == 'Featured') {
		element.className =
			'featured-facet button has-inner-focus is-full-width has-flex-justify-content-space-between is-text is-small has-text-weight-semibold justify-content-';
	} else if (element.innerText == 'All') {
		element.className =
			'all-facet button has-inner-focus is-full-width has-flex-justify-content-space-between is-text is-small has-text-weight-semibold justify-content-';
	} else {
		element.className =
			'hub-facet button has-inner-focus is-full-width has-flex-justify-content-space-between is-text is-small has-text-weight-semibold justify-content-';
	}
}
function revealAllSection(t) {
	var e = document.querySelector('#product-cards'),
		n = document.querySelector('#product-cards-all');
	(t ? e : n).setAttribute('hidden', 'hidden'), (t ? n : e).removeAttribute('hidden');
}
