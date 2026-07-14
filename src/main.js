diff --git a/src/main.js b/src/main.js
new file mode 100644
index 0000000000000000000000000000000000000000..6bb1140b147b230be48e040a230d2997eb7cc3ea
--- /dev/null
+++ b/src/main.js
@@ -0,0 +1,131 @@
+const state = {
+  job: { builder: '', community: '', lot: '', address: '', contact: '', date: new Date().toISOString().slice(0, 10) },
+  newItem: { area: '', task: '', priority: 'Medium' },
+  items: [
+    item('Exterior', 'Verify siding, trim, and caulk are complete', 'High'),
+    item('Interior', 'Check doors, casing, base, and hardware', 'Medium'),
+    item('Jobsite', 'Confirm material cleanup and safety walk', 'Medium'),
+  ],
+};
+
+const statuses = ['Open', 'In Progress', 'Done'];
+const priorities = ['High', 'Medium', 'Low'];
+const root = document.getElementById('root');
+
+function item(area, task, priority = 'Medium') {
+  return { id: crypto.randomUUID(), area, task, status: 'Open', priority, notes: '' };
+}
+
+function progress() {
+  const done = state.items.filter((entry) => entry.status === 'Done').length;
+  const total = state.items.length;
+  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
+}
+
+function render() {
+  const currentProgress = progress();
+  root.innerHTML = `
+    <main class="app-shell">
+      <section class="hero">
+        <div>
+          <p class="eyebrow">Builders FirstSource</p>
+          <h1>Field Punch List</h1>
+          <p class="subtitle">Large tap targets, clear status buttons, and quick export for jobsite closeout.</p>
+        </div>
+        <div class="progress-card" aria-label="${currentProgress.percent}% complete">
+          <span class="icon">✓</span>
+          <strong>${currentProgress.percent}%</strong>
+          <span>${currentProgress.done} of ${currentProgress.total} done</span>
+        </div>
+      </section>
+
+      <section class="panel job-card" aria-labelledby="job-details">
+        <h2 id="job-details">Job Details</h2>
+        <div class="grid two">${jobFields()}</div>
+      </section>
+
+      <form class="panel add-card" id="add-form">
+        <h2>Add Punch Item</h2>
+        <div class="grid add-grid">
+          <label><span>Area</span><input id="new-area" value="${escapeHtml(state.newItem.area)}" placeholder="Kitchen, Exterior, Garage"></label>
+          <label class="task-input"><span>Issue / Task</span><input id="new-task" value="${escapeHtml(state.newItem.task)}" placeholder="Describe what needs to be fixed"></label>
+          <label><span>Priority</span><select id="new-priority">${optionList(priorities, state.newItem.priority)}</select></label>
+        </div>
+        <button class="primary" type="submit"><span>＋</span> Add Item</button>
+      </form>
+
+      <section class="toolbar">
+        <h2>Punch Items</h2>
+        <button class="secondary" id="export-button" type="button"><span>⇩</span> Export</button>
+      </section>
+
+      <section class="list" aria-label="Punch list items">${state.items.map(punchCard).join('')}</section>
+    </main>`;
+  bindEvents();
+}
+
+function jobFields() {
+  return [
+    ['builder', 'Builder / Contractor', 'text'], ['community', 'Community', 'text'], ['lot', 'Lot #', 'text'],
+    ['address', 'Address', 'text'], ['contact', 'Field Contact', 'text'], ['date', 'Walk Date', 'date'],
+  ].map(([field, label, type]) => `<label><span>${label}</span><input data-job="${field}" type="${type}" value="${escapeHtml(state.job[field])}"></label>`).join('');
+}
+
+function punchCard(entry) {
+  return `<article class="punch-card ${entry.status === 'Done' ? 'complete' : ''}" data-id="${entry.id}">
+    <div class="card-top">
+      <input class="area" data-field="area" value="${escapeHtml(entry.area)}">
+      <span class="badge ${entry.priority.toLowerCase()}">${entry.priority}</span>
+    </div>
+    <textarea data-field="task">${escapeHtml(entry.task)}</textarea>
+    <div class="status-row">${statuses.map((status) => `<button class="${entry.status === status ? 'selected' : ''}" data-status="${status}" type="button">${status}</button>`).join('')}</div>
+    <label><span>Notes / Responsible Party</span><input data-field="notes" value="${escapeHtml(entry.notes)}" placeholder="Who owns it? Materials needed?"></label>
+    <button class="danger" data-remove type="button"><span>×</span> Remove</button>
+  </article>`;
+}
+
+function optionList(values, selected) {
+  return values.map((value) => `<option ${value === selected ? 'selected' : ''}>${value}</option>`).join('');
+}
+
+function bindEvents() {
+  document.querySelectorAll('[data-job]').forEach((input) => input.addEventListener('input', (event) => state.job[event.target.dataset.job] = event.target.value));
+  document.getElementById('new-area').addEventListener('input', (event) => state.newItem.area = event.target.value);
+  document.getElementById('new-task').addEventListener('input', (event) => state.newItem.task = event.target.value);
+  document.getElementById('new-priority').addEventListener('change', (event) => state.newItem.priority = event.target.value);
+  document.getElementById('add-form').addEventListener('submit', addItem);
+  document.getElementById('export-button').addEventListener('click', exportList);
+  document.querySelectorAll('.punch-card').forEach((card) => {
+    const entry = state.items.find((candidate) => candidate.id === card.dataset.id);
+    card.querySelectorAll('[data-field]').forEach((input) => input.addEventListener('input', (event) => entry[event.target.dataset.field] = event.target.value));
+    card.querySelectorAll('[data-status]').forEach((button) => button.addEventListener('click', (event) => { entry.status = event.target.dataset.status; render(); }));
+    card.querySelector('[data-remove]').addEventListener('click', () => { state.items = state.items.filter((candidate) => candidate.id !== entry.id); render(); });
+  });
+}
+
+function addItem(event) {
+  event.preventDefault();
+  if (!state.newItem.task.trim()) return;
+  state.items.unshift(item(state.newItem.area || 'General', state.newItem.task.trim(), state.newItem.priority));
+  state.newItem = { area: '', task: '', priority: 'Medium' };
+  render();
+}
+
+function exportList() {
+  const currentProgress = progress();
+  const header = `Builders FirstSource Punch List\nDate: ${state.job.date}\nBuilder: ${state.job.builder}\nCommunity: ${state.job.community}\nLot: ${state.job.lot}\nAddress: ${state.job.address}\nContact: ${state.job.contact}\nProgress: ${currentProgress.done}/${currentProgress.total} complete\n\n`;
+  const body = state.items.map((entry, index) => `${index + 1}. [${entry.status}] ${entry.priority} - ${entry.area}\n   ${entry.task}\n   Notes: ${entry.notes || 'None'}`).join('\n\n');
+  const blob = new Blob([header + body], { type: 'text/plain' });
+  const url = URL.createObjectURL(blob);
+  const link = document.createElement('a');
+  link.href = url;
+  link.download = `bfs-punch-list-${state.job.lot || 'job'}.txt`;
+  link.click();
+  URL.revokeObjectURL(url);
+}
+
+function escapeHtml(value) {
+  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
+}
+
+render();
