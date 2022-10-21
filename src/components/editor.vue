<script setup lang="ts">
  import * as monaco from 'monaco-editor'
  import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
  import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
  import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
  import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
  import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
  import { onMounted, ref, watch } from 'vue'
  self.MonacoEnvironment = {
    getWorker(_, label) {
      if (label === 'json') {
        return new jsonWorker()
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return new cssWorker()
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return new htmlWorker()
      }
      if (label === 'typescript' || label === 'javascript') {
        return new tsWorker()
      }
      return new editorWorker()
    }
  }
  let editor : monaco.editor.IStandaloneCodeEditor
  const editorLanguage = ref<string>()
  // let editorLanguage
  onMounted(()=>{
    editor = monaco.editor.create(document.getElementById('editor')!, {
      value: [
        'function x() {',
        '\tconsole.log("Hello world!");',
        '}'
      ].join('\n'),
      theme: 'vs-dark',
      language: 'javascript'
    })
    // 获取编辑器的语言
    editorLanguage.value = editor.getModel()?.getLanguageId()
  })
  // watch(editorLanguage, (newVal)=>{
  //   if(editor){
  //     console.log("editorLanguage",newVal)
  //     // 设置编辑器的语言
  //     const model  = editor.getModel() as monaco.editor.ITextModel
  //     monaco.editor.setModelLanguage(model, newVal as string)
  //     console.log(editor.getValue())
  //   }
  // })
  const handleLanguageChange = (e) => {
    // 设置编辑器的语言
    console.log(e.target.value)
    const model  = editor.getModel() as monaco.editor.ITextModel
    monaco.editor.setModelLanguage(model, e.target.value)
    console.log(editor.getValue())
  }
</script>

<template>
  <div class="editor-container">
    <select v-model="editorLanguage" @change="handleLanguageChange">
      <option value="css">css</option>
      <option value="html">html</option>
      <option value="javascript">javascript</option>
      <option value="json">json</option>
      <option value="less">less</option>
      <option value="markdown">markdown</option>
      <option value="php">php</option>
      <option value="python">python</option>
      <option value="scss">scss</option>
      <option value="sql">sql</option>
      <option value="typescript">typescript</option>
      <option value="xml">xml</option>
    </select>
    <div id="editor">
    </div>
    editor
  </div>
</template>

<style scoped>
.editor-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
#editor {
  width: 100%;
  height: 100%;
}
</style>
