// ── Tab switching ──
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;

    // update tab active state
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // show matching panel
    panels.forEach(panel => {
      panel.classList.toggle('active', panel.id === 'tab-' + target);
    });
  });
});
