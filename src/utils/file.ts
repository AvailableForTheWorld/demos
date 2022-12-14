// 获取assets静态资源
export const getAssetsFile = async (url: string) => {
  const path = `/node_modules/monaco-themes/themes/${url}.json`
  const modules = await import.meta.glob('/node_modules/monaco-themes/themes/*')
  return modules[path]
}
