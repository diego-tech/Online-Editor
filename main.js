import './style.css'
import Split from 'split-grid' // Split Grid
import { encode, decode } from 'js-base64' // Codificar Base64 para que no peten los emojis
import * as monaco from 'monaco-editor' // Importamos Monaco Editor

// HTML, CSS, JS Worker
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import JsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

// Select Monaco Editor Environment
window.MonacoEnvironment = {
  getWorker (_, label) {
    if (label === 'html') return new HtmlWorker()
    if (label === 'javascript') return new JsWorker()
    if (label === 'css') return new CssWorker()
  }
}

/* Recuperar elementos del HTML con querySelector */
const $ = selector => document.querySelector(selector)

Split({
  columnGutters: [{
    track: 1,
    element: $('.gutter-col-1')
  }],
  rowGutters: [{
    track: 1,
    element: $('.gutter-row-1')
  }]
})

const $js = $('#js')
const $css = $('#css')
const $html = $('#html')

const { pathname } = window.location

const [rawHtml, rawCss, rawJs] = pathname.slice(1).split('%7C')

const html = rawHtml ? decode(rawHtml) : ''
const css = rawCss ? decode(rawCss) : ''
const js = rawJs ? decode(rawJs) : ''

const COMMON_EDITOR_OPTIONS = {
  automaticLayout: true,
  fontSize: 16,
  theme: 'vs-dark'
}

const htmlEditor = monaco.editor.create($html, {
  value: html,
  language: 'html',
  ...COMMON_EDITOR_OPTIONS
})

const cssEditor = monaco.editor.create($css, {
  value: css,
  language: 'css',
  ...COMMON_EDITOR_OPTIONS
})

const jsEditor = monaco.editor.create($js, {
  value: js,
  language: 'javascript',
  ...COMMON_EDITOR_OPTIONS
})

htmlEditor.onDidChangeModelContent(update)
cssEditor.onDidChangeModelContent(update)
jsEditor.onDidChangeModelContent(update)

const htmlForPreview = createHtml({ html, css, js })
$('iframe').setAttribute('srcdoc', htmlForPreview)

function update () {
  const html = htmlEditor.getValue()
  const css = cssEditor.getValue()
  const js = jsEditor.getValue()

  // Code Base 64
  const hashedCode = `${encode(html)}|${encode(css)}|${encode(js)}`
  window.history.replaceState(null, null, `${hashedCode}`)

  const htmlForPreview = createHtml({ html, css, js })
  $('iframe').setAttribute('srcdoc', htmlForPreview)
}

function createHtml ({ html, js, css }) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <style>
          ${css}
        </style>
      </head>
      <body>
        ${html}
        <script>
        ${js}
        </script>
      </body>
    </html>
  `
}
