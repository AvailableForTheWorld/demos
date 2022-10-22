<script setup lang="ts">
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import { nextTick, onMounted, ref, watch } from "vue";
import {getAssetsFile} from "../utils/file";

let themeData : monaco.editor.IStandaloneThemeData;
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "json") {
      return new jsonWorker();
    }
    if (label === "css" || label === "scss" || label === "less") {
      return new cssWorker();
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new htmlWorker();
    }
    if (label === "typescript" || label === "javascript") {
      return new tsWorker();
    }
    return new editorWorker();
  },
};
let editor: monaco.editor.IStandaloneCodeEditor;
let diff : monaco.editor.IStandaloneDiffEditor;
const editorLanguage = ref<string>();
const currentTheme = ref("Dracula");
// let editorLanguage
onMounted(async () => {
  editor = monaco.editor.create(document.getElementById("editor")!, {
    value: ["function x() {", '\tconsole.log("Hello world!");', "}"].join("\n"),
    theme: "vs-dark",
    language: "javascript",
  });
  const originalModel = monaco.editor.createModel(
    "This line is removed on the right.\njust some text\nabcd\nefgh\nSome more text",
    "text/plain"
  );
  const modifiedModel = monaco.editor.createModel(
    "just some text\nabcz\nzzzzefgh\nSome more text.\nThis line is removed on the left.",
    "text/plain"
  );
  diff = monaco.editor.createDiffEditor(document.getElementById("diff")!,{renderSideBySide: false});
  diff.setModel({
    original: originalModel,
    modified: modifiedModel,
  });
  setTheme(currentTheme.value)
  // 获取编辑器的语言
  editorLanguage.value = editor.getModel()?.getLanguageId();
});
// watch(editorLanguage, (newVal)=>{
//   if(editor){
//     console.log("editorLanguage",newVal)
//     // 设置编辑器的语言
//     const model  = editor.getModel() as monaco.editor.ITextModel
//     monaco.editor.setModelLanguage(model, newVal as string)
//     console.log(editor.getValue())
//   }
// })

// 设置主题
const setTheme = (theme: string) => {
  getAssetsFile(theme).then((res)=>{
    res().then((data)=>{
      const themeName = theme.split(' ').join('')
      monaco.editor.defineTheme(themeName, data);
      console.log("data",data)
      monaco.editor.setTheme(themeName);
    })
  })
};

interface IdefaultValueMappings {
  [key: string]: string;
}

const handleLanguageChange = (e: Event) => {
  // 设置编辑器的语言
  const target = e.target as HTMLInputElement;
  const model = editor.getModel() as monaco.editor.ITextModel;
  monaco.editor.setModelLanguage(model, target.value);
  console.log(editor.getValue());
  editor.setValue(defaultValueMappings[target.value]);
};
const handleThemeChange = (e:Event) => {
  const target = e.target as HTMLInputElement;
  setTheme(target.value)
}
const defaultValueMappings: IdefaultValueMappings = {
  css: `.editor-container{
  width: 100%;
  height: 100%;
}`,
  html: `<div>hello html</div>`,
  javascript: `function printHelloWorld(){
  console.log("hello world")
}`,
  json: `{
    "hello": "world"
}`,
  cpp: `#include<iostream>
using namespace std;
int main(){
  cout<<"hello world"<<endl;
}`,
  scss: `$highlight: #ff9900`,
  typescript: `const hello : string = 'world'`,
  xml: `<hello>world</hello>`,
};
</script>

<template>
  <div class="editor-container">
    <div class="select">
      <select class="select-languages" v-model="editorLanguage" @change="handleLanguageChange">
        <option value="css">css</option>
        <option value="html">html</option>
        <option value="javascript">javascript</option>
        <option value="json">json</option>
        <option value="cpp">c++</option>
        <option value="scss">scss</option>
        <option value="typescript">typescript</option>
        <option value="xml">xml</option>
      </select>
      <select class="select-theme" v-model="currentTheme" @change="handleThemeChange">
        <option value="Active4D">Active4D</option>
        <option value="Amy">Amy</option>
        <option value="Blackboard">Blackboard</option>
        <option value="Cobalt">Cobalt</option>
        <option value="Dawn">Dawn</option>
        <option value="Dracula">Dracula</option>
        <option value="Dreamweaver">Dreamweaver</option>
        <option value="Eiffel">Eiffel</option>
        <option value="Espresso Libre">Espresso Libre</option>
        <option value="GitHub">GitHub</option>
        <option value="idleFingers">Idle Fingers</option>
        <option value="Katzenmilch">Katzenmilch</option>
        <option value="Kuroir Theme">Kuroir</option>
        <option value="Merbivore">Merbivore</option>
        <option value="Merbivore Soft">Merbivore Soft</option>
        <option value="Monokai">Monokai</option>
        <option value="Pastels on Dark">Pastel on Dark</option>
        <option value="Solarized-dark">Solarized Dark</option>
        <option value="Solarized-light">Solarized Light</option>
        <option value="Tomorrow">Tomorrow</option>
        <option value="Tomorrow-Night">Tomorrow Night</option>
        <option value="Tomorrow-Night-Blue">Tomorrow Night Blue</option>
        <option value="Tomorrow-Night-Bright">Tomorrow Night Bright</option>
        <option value="Tomorrow-Night-Eighties">Tomorrow Night Eighties</option>
        <option value="Twilight">Twilight</option>
        <option value="Vibrant Ink">Vibrant Ink</option>
      </select>
    </div>
    <div id="editor"></div>
    <div id="diff"></div>
  </div>
</template>

<style scoped>
body {
  margin: 0;
  padding: 0;
}
.editor-container {
  width: 100%;
  height: 90vh;
  display: flex;
  flex-direction: column;
}
.select {
  display: flex;
  justify-content: flex-start;
  gap: 20px;
  margin: 10px 0;
}
#editor {
  width: 100%;
  height: 50%;
}
#diff {
  width: 100%;
  height: 50%;
}
</style>
