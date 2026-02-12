<script>
(function(){
  var input = document.querySelector('.search-bar input');
  if (!input) return;
  var content = document.querySelector('.docs-content');
  var original = null;
  input.addEventListener('input', function(){
    if (original) { content.innerHTML = original; original = null;
      input = document.querySelector('.search-bar input');
      if (input) { input.value = this.value; input.addEventListener('input', arguments.callee); input.focus(); }
    }
    var q = (input ? input.value : '').trim().toLowerCase();
    if (q.length < 2) return;
    if (!original) original = content.innerHTML;
    var walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, null, false);
    var nodes = [];
    while (walker.nextNode()) {
      var n = walker.currentNode;
      if (n.parentNode.tagName==='SCRIPT'||n.parentNode.tagName==='STYLE') continue;
      if (n.nodeValue.toLowerCase().indexOf(q)!==-1) nodes.push(n);
    }
    for (var i=0;i<nodes.length;i++){
      var t=nodes[i], txt=t.nodeValue, idx=txt.toLowerCase().indexOf(q);
      if(idx===-1)continue;
      var s=document.createElement('span');
      s.appendChild(document.createTextNode(txt.substring(0,idx)));
      var m=document.createElement('mark'); m.textContent=txt.substring(idx,idx+q.length);
      s.appendChild(m); s.appendChild(document.createTextNode(txt.substring(idx+q.length)));
      t.parentNode.replaceChild(s,t);
    }
    var first=content.querySelector('mark');
    if(first) first.scrollIntoView({behavior:'smooth',block:'center'});
  });
})();
</script>