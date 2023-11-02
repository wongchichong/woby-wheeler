import { defineConfig } from 'vite'
import path from 'path'
import dts from 'vite-plugin-dts'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const config = defineConfig({
    build: {
        minify: false,
        lib: {
            entry: ["./src/index.ts"],
            name: "wheelpicker",
            formats: ['cjs', 'es', 'umd'],
            fileName: (format: string, entryName: string) => `${entryName}.${format}.js`
        },
        sourcemap: true,
        rollupOptions: {
            external: ['woby', 'woby/jsx-runtime', 'oby'],
            output: {
                globals: {
                    'woby': 'woby',
                    'oby': 'oby',
                    'woby/jsx-runtime': 'woby/jsx-runtime',
                }
            }
        }
    },
    esbuild: {
        jsx: 'automatic',
    },
    plugins: [
        dts({ entryRoot: './src', outputDir: './dist/types' }),
        viteStaticCopy({
            targets: [
                {
                    src: 'src/*.scss',
                    dest: './'
                }
            ]
        }),
    ],
    resolve: {
        alias: {
            '~': path.resolve(__dirname, 'src'),
        },
    },
})



export default config
