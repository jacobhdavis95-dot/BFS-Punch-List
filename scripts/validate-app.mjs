diff --git a/scripts/validate-app.mjs b/scripts/validate-app.mjs
new file mode 100644
index 0000000000000000000000000000000000000000..c138835c3fac0c5d4c6d492a21e94f2b42c07132
--- /dev/null
+++ b/scripts/validate-app.mjs
@@ -0,0 +1,18 @@
+import { readFileSync } from 'node:fs';
+
+const requiredFiles = ['index.html', 'src/main.js', 'src/styles.css'];
+for (const file of requiredFiles) {
+  const content = readFileSync(file, 'utf8');
+  if (!content.trim()) throw new Error(`${file} is empty`);
+}
+
+const html = readFileSync('index.html', 'utf8');
+if (!html.includes('/src/main.js')) throw new Error('index.html must load src/main.js');
+if (!html.includes('viewport')) throw new Error('index.html must include a mobile viewport');
+
+const app = readFileSync('src/main.js', 'utf8');
+for (const phrase of ['Builders FirstSource', 'Field Punch List', 'Add Punch Item', 'exportList']) {
+  if (!app.includes(phrase)) throw new Error(`Missing expected app text: ${phrase}`);
+}
+
+console.log('Static app validation passed.');
