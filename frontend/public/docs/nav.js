/* HubLLM Docs Portal — Shared Navigation (nav.js)
 * Include via <script src="/docs/nav.js"></script> in every page.
 * Injects sidebar nav, current-page highlighting, and simple search.
 */
(function () {
  'use strict';

  var svgHome = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>';
  var svgPlay = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
  var svgTerminal = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>';
  var svgGitHub = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>';
  var svgStar = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
  var svgSettings = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>';

  var pages = [
    { href: '/docs/index.html',           icon: svgHome, label: 'Home' },
    { href: '/docs/welcome.html',         icon: svgPlay, label: 'Getting Started' },
    { href: '/docs/workspace-guide.html', icon: svgTerminal, label: 'Workspace Guide' },
    { href: '/docs/git-github.html',      icon: svgGitHub, label: 'Git & GitHub' },
    { href: '/docs/whats-new.html',       icon: svgStar, label: "What's New" },
    { href: '/docs/harness-guide.html',   icon: svgSettings, label: 'Harness System' }
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
