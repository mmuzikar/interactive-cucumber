import { defineConfig } from 'vite'
import * as fs from 'fs'
import url from 'url'

import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import rollupNodePolyFill from 'rollup-plugin-polyfill-node'

import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
    server: {
        proxy: {
            '^/(java|cucumber)': {
                ws: true,
                target: 'ws://localhost:5115'
            }
        }
    },
    build: {
        target: 'esnext',
        rollupOptions: {
            plugins: [
                rollupNodePolyFill()
            ]
        }
    },
    plugins: [
        {
            // prevent vite from trying to inject code into an extension file du to an `import()` in that file
            name: 'hack-prevent-transform-javascript',
            apply: 'serve',
            load(source) {
                if (source.includes('tsserver.web.js')) {
                    return `eval(${JSON.stringify(fs.readFileSync(source).toString('utf-8'))})`
                }
            }
        }, visualizer()
    ],
    optimizeDeps: {
        esbuildOptions: {
            define: {
                global: 'globalThis'
            },
            plugins: [{
                name: 'import.meta.url',
                setup({ onLoad }) {
                    // Help vite that bundles/move files in dev mode without touching `import.meta.url` which breaks asset urls
                    onLoad({ filter: /.*\.js/, namespace: 'file' }, async args => {
                        const code = fs.readFileSync(args.path, 'utf8')

                        const assetImportMetaUrlRE = /\bnew\s+URL\s*\(\s*('[^']+'|"[^"]+"|`[^`]+`)\s*,\s*import\.meta\.url\s*(?:,\s*)?\)/g
                        let i = 0
                        let newCode = ''
                        for (let match = assetImportMetaUrlRE.exec(code); match != null; match = assetImportMetaUrlRE.exec(code)) {
                            newCode += code.slice(i, match.index)

                            const path = match[1].slice(1, -1)
                            const resolved = await import.meta.resolve!(path, url.pathToFileURL(args.path))

                            newCode += `new URL(${JSON.stringify(url.fileURLToPath(resolved))}, import.meta.url)`

                            i = assetImportMetaUrlRE.lastIndex
                        }
                        newCode += code.slice(i)

                        return { contents: newCode }
                    })
                }
            }, NodeGlobalsPolyfillPlugin({ buffer: true }), NodeModulesPolyfillPlugin()]
        }
    }
})