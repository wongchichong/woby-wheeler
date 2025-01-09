import { defineConfig } from 'vite'
import path from 'path'
// import dts from 'vite-plugin-dts'
// import { viteStaticCopy } from 'vite-plugin-static-copy'

const config = defineConfig({
    build: {
        minify: false,
        lib: {
            entry: ["./index.html"],
            name: "wheelpicker",
            formats: [/*'cjs', '*/'es'/*, 'umd'*/],
            fileName: (format: string, entryName: string) => `${entryName}.${format}.js`
        },
        sourcemap: true,
        outDir: './build'
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
            'woby/jsx-dev-runtime': "woby",
            'woby/jsx-runtime':'woby', //'woby/jsx-runtime',
            "woby":"woby"
        },
    },
})



export default config
