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
  
  interface IdefaultValueMappings{
    [key: string]: string
  }

  const handleLanguageChange = (e:Event) => {
    // 设置编辑器的语言
    const target = e.target as HTMLInputElement
    const model  = editor.getModel() as monaco.editor.ITextModel
    monaco.editor.setModelLanguage(model, target.value)
    console.log(editor.getValue())
    editor.setValue(defaultValueMappings[target.value])
  }
  const defaultValueMappings : IdefaultValueMappings= {
    css: `.editor-container{
      width: 100%;
      height: 100%;
    }`,
    html: `<div>hello html</div>`,
    javascript: `function printHelloWorld(){
      console.log("hello world")
    }`,
    json: `{
      hello: 'world'
    }`,
    cpp: `#include<iostream>
      using namespace std;
      int main(){
        cout<<"hello world"<<endl;
      }`,
    scss: `$highlight: #ff9900`,
    typescript: `const hello : string = 'world'`,
    xml: `<hello>world</hello>`
  }
</script>

<template>
  <div class="editor-container">
    <select v-model="editorLanguage" @change="handleLanguageChange">
      <option value="css">css</option>
      <option value="html">html</option>
      <option value="javascript">javascript</option>
      <option value="json">json</option>
      <option value="cpp">c++</option>
      <option value="scss">scss</option>
      <option value="typescript">typescript</option>
      <option value="xml">xml</option>
    </select>
    <div id="editor">
    </div>
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
