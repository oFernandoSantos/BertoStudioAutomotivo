// Pós-processa o CSS do Tailwind para navegadores antigos (Windows 7: Chrome 109, Firefox 115):
// achata o CSS aninhado, troca color-mix/oklch por rgba quando o valor é fixo e minifica.
import { transform } from "lightningcss";
import { readFileSync, writeFileSync } from "node:fs";
const v = (a, b = 0) => (a << 16) | (b << 8);
const arq = "dist/css/styles.css";
const r = transform({
  filename: arq,
  code: readFileSync(arq),
  minify: true,
  targets: { chrome: v(109), edge: v(109), firefox: v(115), safari: v(14) },
});
writeFileSync(arq, r.code);
console.log("css compatível:", r.code.length, "bytes");
