const desktopMinWidth = 1088 / 2;
const desktopOnlyQuery = window.matchMedia(`screen and (min-width: ${desktopMinWidth}px)`);
function setMasonryContainerHeight(masonryElement) {
	const bottomPadding = 128;
	// assumes .columns.is-masonry is the offsetParent because offsetTop returns the distance of the current element relative to the top of the offsetParent node.
	const cards = Array.from(masonryElement.querySelectorAll('.column'));
	const height = Math.max(...cards.map(x => x.offsetTop + x.offsetHeight)) + bottomPadding;
	masonryElement.style.height = `${height}px`;
}
document.addEventListener('DOMContentLoaded', function (event) {
	const masonryElement = document.getElementsByClassName('is-masonry')[0];
	setMasonryContainerHeight(masonryElement, desktopMinWidth);
});

window.addEventListener('resize', function (event) {
	const masonryElement = document.getElementsByClassName('is-masonry')[0];
	setMasonryContainerHeight(masonryElement, desktopMinWidth);
});

var buttons = document.querySelectorAll('button');
var prev = document.querySelectorAll('button[data-facet="featured"]');
for (var i = 0; i < buttons.length; i++) {
	buttons[i].addEventListener('click', function () {
		prev.className = `all-facet button has-inner-focus is-full-width has-flex-justify-content-space-between is-text is-small has-text-weight-semibold justify-content-`;
		this['aria-pressed'] = 'false';
		document.querySelector('h3').innerText = this.innerText;
		//document.querySelector('#category-hub-dropdown').innerText = this.innerHTML;
		if (this.innerHTML == 'All') {
			revealAll(1);
		} else {
			var cards = document.querySelectorAll('#product-directory .item-column');
			for (var i = 0; i < cards.length; i++) {
				cards[i].setAttribute('hidden', 'hidden');
			}
			$card = $(`li[data-categories*='${this.innerHTML}']`);
			for (var i = 0; i < $card.length; i++) {
				$card[i].removeAttribute('hidden');
			}
		}
		this.className =
			'all-facet button has-inner-focus is-full-width has-flex-justify-content-space-between is-text is-small has-text-weight-semibold justify-content- has-background-secondary-light';
		this['aria-pressed'] = 'true';
		prev = this;
	});
}

// Show section

function revealAll(t) {
	var e = document.querySelector('#product-cards'),
		n = document.querySelector('#product-cards-all');
	(t ? e : n).setAttribute('hidden', 'hidden'), (t ? n : e).removeAttribute('hidden');
}
