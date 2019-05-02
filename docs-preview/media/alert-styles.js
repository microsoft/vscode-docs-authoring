var blockquoteTags = document.getElementsByTagName('blockquote');

for (var i = 0; i < blockquoteTags.length; i++) {
    if (blockquoteTags[i].innerHTML.indexOf('[!NOTE]') > -1) {
        blockquoteTags[i].setAttribute('class', 'NOTE');
    }
    if (blockquoteTags[i].innerHTML.indexOf('[!TIP]') > -1) {
        blockquoteTags[i].setAttribute('class', 'TIP');
    }
    if (blockquoteTags[i].innerHTML.indexOf('[!IMPORTANT]') > -1) {
        blockquoteTags[i].setAttribute('class', 'IMPORTANT');
    }
    if (blockquoteTags[i].innerHTML.indexOf('[!CAUTION]') > -1) {
        blockquoteTags[i].setAttribute('class', 'CAUTION');
    }
    if (blockquoteTags[i].innerHTML.indexOf('[!WARNING]') > -1) {
        blockquoteTags[i].setAttribute('class', 'WARNING');
    }
}