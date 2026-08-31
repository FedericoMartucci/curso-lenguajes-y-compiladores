/* build.js — genera data.js a partir de los módulos en content/.
   content/mod-*.js es la ÚNICA fuente de verdad: cada archivo hace M.push({...})
   con un módulo completo (id, titulo, parcial, resumen, lecciones).
   Este script los junta en orden, valida, y escribe data.js (que se sirve estático).
   Uso:  node build.js   (o  npm run build) */
const vm = require("vm"), fs = require("fs"), path = require("path");
const dir = __dirname;

const files = fs.readdirSync(path.join(dir, "content")).filter(f => f.endsWith(".js")).sort();
let mods = [];
files.forEach(f => {
  const ctx = { M: [] }; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(dir, "content", f), "utf8"), ctx);
  mods = mods.concat(ctx.M);
});
mods.sort((a, b) => a.id - b.id);

// validación
const problems = [], seenLes = {}, seenMod = {};
let total = 0, qa = 0, dic = 0;
mods.forEach(m => {
  if (m.titulo == null || m.parcial == null) problems.push("Módulo " + m.id + " sin titulo/parcial");
  if (seenMod[m.id]) problems.push("Módulo duplicado: " + m.id); seenMod[m.id] = 1;
  m.lecciones.forEach(l => {
    if (seenLes[l.id]) problems.push("Lección duplicada: " + l.id);
    seenLes[l.id] = 1; total++; qa += (l.qa || []).length; if (l.estado === "dictada") dic++;
  });
});

fs.writeFileSync(path.join(dir, "data.js"), "window.CURSO=" + JSON.stringify({ modulos: mods }) + ";\n");

mods.forEach(m => {
  const d = m.lecciones.filter(l => l.estado === "dictada").length;
  const bar = "█".repeat(Math.round(d / m.lecciones.length * 10)).padEnd(10, "·");
  console.log("Mod " + String(m.id).padStart(2) + " [" + bar + "] " + d + "/" + m.lecciones.length + "  " + m.titulo);
});
console.log("---");
console.log("Módulos: " + mods.length + " | Lecciones: " + total + " (" + dic + " en profundidad) | Preguntas: " + qa);
if (problems.length) { console.log("PROBLEMAS:\n- " + problems.join("\n- ")); process.exit(1); }
console.log("OK — data.js generado");
