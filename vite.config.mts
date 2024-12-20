import { defineConfig } from 'vite'
import path from 'path'
// import dts from 'vite-plugin-dts'
// import { viteStaticCopy } from 'vite-plugin-static-copy'

const config = defineConfig({
    build: {
        minify: false,
        lib: {
            entry: ["./src/index.ts"],
            name: "wheelpicker",
            formats: [/*'cjs', '*/'es'/*, 'umd'*/],
            fileName: (format: string, entryName: string) => `${entryName}.${format}.js`
        },
        sourcemap: true,
        rollupOptions: {
            external: ['woby', 'woby/jsx-runtime', 'oby', 'use-woby', 'nanoid'],
            output: {
                globals: {
                    'use-woby': 'use-woby',
                    'woby': 'woby',
                    'oby': 'oby',
                    'woby/jsx-runtime': 'woby/jsx-runtime',
                    'nanoid': 'nanoid',
                }
            }
        }
    },
    esbuild: {
        jsx: 'automatic',
    },
    plugins: [
        // dts({ entryRoot: './src', outDir: './dist/types' }),
        // viteStaticCopy({
        //     targets: [
        //         {
        //             src: 'src/*.scss',
        //             dest: './'
        //         }
        //     ]
        // }),
    ],
    resolve: {
        alias: {
            '~': path.resolve(__dirname, 'src'),
        },
    },
})



export default config
