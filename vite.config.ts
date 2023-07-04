/// <reference types='vitest' />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx, defineManifest } from '@crxjs/vite-plugin'
import viteSvgr from 'vite-plugin-svgr'
import zipPack from 'vite-plugin-zip-pack'

const manifest = defineManifest({
  manifest_version: 3,
  version: '2.1.1',
  name: '__MSG_Name__',
  description: '__MSG_Description__',
  default_locale: 'en',
  icons: {
    16: 'assets/icon16.png',
    48: 'assets/icon48.png',
    128: 'assets/icon128.png'
  },
  action: {
    default_popup: 'src/popup/index.html',
    default_icon: {
      19: 'assets/icon19.png'
    }
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content_script/index.ts']
    },
    {
      matches: ['<all_urls>'],
      js: ['src/content_script/message_listener/index.ts'],
      run_at: 'document_start'
    }
  ],
  background: {
    service_worker: 'src/background/index.ts'
  },
  web_accessible_resources: [
    {
      resources: ['assets/icon48.png'],
      matches: ['<all_urls>']
    }
  ]
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    viteSvgr(),
    react(),
    crx({ manifest }),
    zipPack({
      outDir: './',
      outFileName: 'maimodorun.zip'
    })
  ],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./tests/vitest.setup.ts'],
  }
})
