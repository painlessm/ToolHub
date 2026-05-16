// 通用工具函数
function clearAll(...ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

// 复制到剪贴板
function copyToClipboard(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.select();
  document.execCommand('copy');
}
