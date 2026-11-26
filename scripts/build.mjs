/**
 * 把 src/ 下的分段源码拼成 Harness 能加载的单文件 client.js。
 * 没有打包器：所有 .js 按文件名顺序拼进同一个工厂函数，styles.css 作为字符串嵌入。
 *
 *   npm run build
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = path.join(root, 'src')
const names = (await fs.readdir(src)).filter((name) => name.endsWith('.js')).sort()
const css = await fs.readFile(path.join(src, 'styles.css'), 'utf8')
const pkg = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'))

const indent = (text) => text.split('\n').map((line) => (line ? `    ${line}` : line)).join('\n')
const parts = []
for (const name of names) {
  const body = (await fs.readFile(path.join(src, name), 'utf8')).trimEnd()
  parts.push(`    //#region ${name}\n${indent(body)}\n    //#endregion`)
}

const cssLiteral = css.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
const output = `// 由 scripts/build.mjs 生成，请修改 src/ 下的源码后运行 npm run build。
window.__ModuleLoader__.load({
  id: 'dsh-drama-board',
  factory(require) {
    const VERSION = ${JSON.stringify(pkg.version)}
    const CSS = \`${cssLiteral}\`

${parts.join('\n\n')}

    return plugin
  },
})
`
await fs.writeFile(path.join(root, 'client.js'), output, 'utf8')
console.log(`client.js ← ${names.length} 个源文件 + styles.css（${(output.length / 1024).toFixed(0)} KB）`)
