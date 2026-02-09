/* HubLLM Docs Portal — Shared Navigation (nav.js)
 * Include via <script src="/docs/nav.js"></script> in every page.
 * Injects sidebar nav, current-page highlighting, and simple search.
 */
(function () {
  'use strict';

  var pages = [
    { href: '/docs/index.html',           icon: '\u2302', label: 'Home' },
    { href: '/docs/welcome.html',         icon: '\uD83D\uDE80', label: 'Getting Started' },
    { href: '/docs/workspace-guide.html', icon: '\uD83D\uDDA5\uFE0F', label: 'Workspace Guide' },
    { href: '/docs/git-github.html',      icon: '\uD83D\uDD00', label: 'Git & GitHub' },
    { href: '/docs/whats-new.html',       icon: '\u2728', label: "What's New" },
    { href: '/docs/harness-guide.html',   icon: '\u2699\uFE0F', label: 'Harness System' }
  ];

  var currentPath = window.location.pathname;

  // Build sidebar HTML
  var sidebarHTML = '<div class="sidebar-brand">' +
    '<div class="logo"><span class="logo-hub">Hub</span><span class="logo-llm">LLM</span><span class="logo-dev">.dev</span></div>' +
    '<div class="brand-tagline">A VibeShip Creation</div>' +
    '</div>' +
    '<nav>';

  for (var i = 0; i < pages.length; i++) {
    var p = pages[i];
    var isActive = currentPath === p.href || (currentPath.endsWith('/docs/') && p.href === '/docs/index.html');
    sidebarHTML += '<a href="' + p.href + '"' + (isActive ? ' class="active"' : '') + '>' +
      '<span class="nav-icon">' + p.icon + '</span>' +
      '<span>' + p.label + '</span>' +
      '</a>';
  }

  sidebarHTML += '</nav>';

  // Create sidebar element
  var sidebar = document.createElement('div');
  sidebar.className = 'docs-sidebar';
  sidebar.innerHTML = sidebarHTML;

  // Wrap existing body content in docs-layout
  var content = document.createElement('div');
  content.className = 'docs-content';

  // Move all body children into content div
  while (document.body.firstChild) {
    content.appendChild(document.body.firstChild);
  }

  var layout = document.createElement('div');
  layout.className = 'docs-layout';
  layout.appendChild(sidebar);
  layout.appendChild(content);
  document.body.appendChild(layout);

  // Simple search — scans visible text on the current page, highlights matches
  var searchInput = document.querySelector('.search-bar input');
  if (searchInput) {
    var originalContent = null;

    searchInput.addEventListener('input', function () {
      var query = this.value.trim().toLowerCase();

      // Restore original content first
      if (originalContent) {
        restoreOriginal();
      }

      if (query.length < 2) return;

      // Save original HTML of content area before highlighting
      if (!originalContent) {
        originalContent = content.innerHTML;
      }

      // Walk text nodes and highlight
      highlightText(content, query);
    });

    function highlightText(root, query) {
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
      var nodesToProcess = [];

      while (walker.nextNode()) {
        var node = walker.currentNode;
        if (node.parentNode.tagName === 'SCRIPT' || node.parentNode.tagName === 'STYLE') continue;
        if (node.parentNode.classList && node.parentNode.classList.contains('docs-sidebar')) continue;
        if (node.nodeValue.toLowerCase().indexOf(query) !== -1) {
          nodesToProcess.push(node);
        }
      }

      for (var i = 0; i < nodesToProcess.length; i++) {
        var textNode = nodesToProcess[i];
        var text = textNode.nodeValue;
        var lowerText = text.toLowerCase();
        var idx = lowerText.indexOf(query);
        if (idx === -1) continue;

        var span = document.createElement('span');
        var before = document.createTextNode(text.substring(0, idx));
        var mark = document.createElement('mark');
        mark.textContent = text.substring(idx, idx + query.length);
        var after = document.createTextNode(text.substring(idx + query.length));

        span.appendChild(before);
        span.appendChild(mark);
        span.appendChild(after);

        textNode.parentNode.replaceChild(span, textNode);
      }

      // Scroll first match into view
      var firstMark = content.querySelector('mark');
      if (firstMark) {
        firstMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    function restoreOriginal() {
      if (originalContent) {
        // Preserve search bar value
        var val = searchInput.value;
        content.innerHTML = originalContent;
        originalContent = null;
        // Re-bind search input
        searchInput = content.querySelector('.search-bar input');
        if (searchInput) {
          searchInput.value = val;
          searchInput.addEventListener('input', arguments.callee);
          searchInput.focus();
        }
      }
    }
  }
})();
