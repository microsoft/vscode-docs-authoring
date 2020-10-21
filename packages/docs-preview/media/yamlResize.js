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
