$(function () {
  renderTabs();
  highlight();

  function highlight() {
    $('pre code').each(function (i, block) {
      hljs.highlightBlock(block);
    });
    $('pre code[highlight-lines]').each(function (i, block) {
      if (block.innerHTML === "") return;
      var lines = block.innerHTML.split('\n');

      queryString = block.getAttribute('highlight-lines');
      if (!queryString) return;

      var ranges = queryString.split(',');
      for (var j = 0, range; range = ranges[j++];) {
        var found = range.match(/^(\d+)\-(\d+)?$/);
        if (found) {
          // consider region as `{startlinenumber}-{endlinenumber}`, in which {endlinenumber} is optional
          var start = +found[1];
          var end = +found[2];
          if (isNaN(end) || end > lines.length) {
            end = lines.length;
          }
        } else {
          // consider region as a sigine line number
          if (isNaN(range)) continue;
          var start = +range;
          var end = start;
        }
        if (start <= 0 || end <= 0 || start > end || start > lines.length) {
          // skip current region if invalid
          continue;
        }
        lines[start - 1] = '<span class="line-highlight">' + lines[start - 1];
        lines[end - 1] = lines[end - 1] + '</span>';
      }

      block.innerHTML = lines.join('\n');
    });
  }

  function renderTabs() {
    var contentAttrs = {
      id: 'data-bi-id',
      name: 'data-bi-name',
      type: 'data-bi-type'
    };

    var Tab = (function () {
      function Tab(li, a, section) {
        this.li = li;
        this.a = a;
        this.section = section;
      }
      Object.defineProperty(Tab.prototype, "tabId", {
        get: function () { return this.a.getAttribute('data-tab'); },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(Tab.prototype, "condition", {
        get: function () { return this.a.getAttribute('data-condition'); },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(Tab.prototype, "visible", {
        get: function () { return !this.li.hasAttribute('hidden'); },
        set: function (value) {
          if (value) {
            this.li.removeAttribute('hidden');
            this.li.removeAttribute('aria-hidden');
          }
          else {
            this.li.setAttribute('hidden', 'hidden');
            this.li.setAttribute('aria-hidden', 'true');
          }
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(Tab.prototype, "selected", {
        get: function () { return !this.section.hasAttribute('hidden'); },
        set: function (value) {
          if (value) {
            this.a.setAttribute('aria-selected', 'true');
            this.a.tabIndex = 0;
            this.section.removeAttribute('hidden');
            this.section.removeAttribute('aria-hidden');
          }
          else {
            this.a.setAttribute('aria-selected', 'false');
            this.a.tabIndex = -1;
            this.section.setAttribute('hidden', 'hidden');
            this.section.setAttribute('aria-hidden', 'true');
          }
        },
        enumerable: true,
        configurable: true
      });
      Tab.prototype.focus = function () {
        this.a.focus();
      };
      return Tab;
    }());

    initTabs();

    function initTabs() {
      var queryStringTabs = readTabsQueryStringParam();
      var elements = $('.tabGroup');
      var state = { groups: [], selectedTabs: [] };
      for (var i = 0; i < elements.length; i++) {
        initTabGroup(elements[i], state);
      }
      if (state.groups.length === 0) {
        return state;
      }
      document.body.addEventListener('click', function (event) { return handleClick(event, state); });
      selectTabs(queryStringTabs);
      updateTabsQueryStringParam(state);
      return state;
    }

    function initTabGroup(element, state) {
      var group = { tabs: [] };
      var li = element.firstElementChild.firstElementChild;
      while (li) {
        var a = li.firstElementChild;
        a.setAttribute(contentAttrs.name, 'tab');
        var section = document.getElementById(a.getAttribute('aria-controls'));
        var tab = new Tab(li, a, section);
        group.tabs.push(tab);
        li = li.nextElementSibling;
      }
      updateVisibilityAndSelection(group, state);
      element.setAttribute(contentAttrs.name, 'tab-group');
      element.tabGroup = group;
      state.groups.push(group);
    }

    function updateVisibilityAndSelection(group, state) {
      var anySelected = false;
      var firstVisibleTab;
      for (var _i = 0, _a = group.tabs; _i < _a.length; _i++) {
        var tab = _a[_i];
        tab.visible = tab.condition === null || state.selectedTabs.indexOf(tab.condition) !== -1;
        if (tab.visible) {
          if (!firstVisibleTab) {
            firstVisibleTab = tab;
          }
        }
        tab.selected = tab.visible && state.selectedTabs.indexOf(tab.tabId) !== -1;
        anySelected = anySelected || tab.selected;
      }
      if (!anySelected) {
        for (var _b = 0, _c = group.tabs; _b < _c.length; _b++) {
          var tab_1 = _c[_b];
          var index = state.selectedTabs.indexOf(tab_1.tabId);
          if (index === -1) {
            continue;
          }
          state.selectedTabs.splice(index, 1);
        }
        var tab = firstVisibleTab;
        tab.selected = true;
        state.selectedTabs.push(tab.tabId);
      }
    }

    function getTabInfoFromEvent(event) {
      if (!(event.target instanceof HTMLAnchorElement)) {
        return null;
      }
      var tabId = event.target.getAttribute('data-tab');
      if (tabId === null) {
        return null;
      }
      var group = event.target.parentElement.parentElement.parentElement.tabGroup;
      return { tabId: tabId, group: group, anchor: event.target };
    }

    function handleClick(event, state) {
      var info = getTabInfoFromEvent(event);
      if (info === null) {
        return;
      }
      event.preventDefault();
      var tabId = info.tabId, group = info.group;
      if (state.selectedTabs.indexOf(tabId) !== -1) {
        return;
      }
      var originalTop = info.anchor.getBoundingClientRect().top;
      var previousTabId = group.tabs.filter(function (t) { return t.selected; })[0].tabId;
      state.selectedTabs.splice(state.selectedTabs.indexOf(previousTabId), 1, tabId);
      updateTabsQueryStringParam(state);
      for (var _i = 0, _a = state.groups; _i < _a.length; _i++) {
        var group_1 = _a[_i];
        updateVisibilityAndSelection(group_1, state);
      }
      var top = info.anchor.getBoundingClientRect().top;
      if (top !== originalTop && event instanceof MouseEvent) {
        window.scrollTo(0, window.pageYOffset + top - originalTop);
      }
    }

    function selectTabs(tabIds) {
      for (var _i = 0, tabIds_1 = tabIds; _i < tabIds_1.length; _i++) {
        var tabId = tabIds_1[_i];
        var a = document$1.querySelector(".tabGroup > ul > li > a[data-tab=\"" + tabId + "\"]:not([hidden])");
        if (a === null) {
          return;
        }
        a.dispatchEvent(new CustomEvent('click', { bubbles: true }));
      }
    }

    function readTabsQueryStringParam() {
      var qs = parseQueryString();
      var t = qs.tabs;
      if (t === undefined || t === '') {
        return [];
      }
      return t.split(',');
    }

    function updateTabsQueryStringParam(state) {
      var qs = parseQueryString();
      qs.tabs = state.selectedTabs.join();
      var url = location.protocol + "//" + location.host + location.pathname + "?" + toQueryString(qs) + location.hash;
      if (location.href === url) {
        return;
      }
      history.replaceState({}, document.title, url);
    }

    function toQueryString(args) {
      var parts = [];
      for (var name_1 in args) {
        if (args.hasOwnProperty(name_1) && args[name_1] !== '' && args[name_1] !== null && args[name_1] !== undefined) {
          parts.push(encodeURIComponent(name_1) + '=' + encodeURIComponent(args[name_1]));
        }
      }
      return parts.join('&');
    }

    function parseQueryString(queryString) {
      var match;
      var pl = /\+/g;
      var search = /([^&=]+)=?([^&]*)/g;
      var decode = function (s) { return decodeURIComponent(s.replace(pl, ' ')); };
      if (queryString === undefined) {
        queryString = '';
      }
      queryString = queryString.substring(1);
      var urlParams = {};
      while (match = search.exec(queryString)) {
        urlParams[decode(match[1])] = decode(match[2]);
      }
      return urlParams;
    }
  }
})