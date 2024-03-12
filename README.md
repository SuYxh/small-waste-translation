# 小废物翻译-vscode 插件

小废物翻译插件是一款轻量级的Visual Studio Code插件，旨在为开发者提供便捷的代码注释和文档翻译功能。该插件支持DeepL、百度、腾讯等多个翻译平台，能够快速将选中的文本翻译成英文或中文，同时提供生成函数名的辅助功能，帮助全球开发者克服语言障碍，提高编程效率。

## 功能特性

- 支持多个翻译平台（DeepL、百度、腾讯、火山翻译）
- 快速翻译选中的文本
- 支持的文件类型包括但不限于：JavaScript、TypeScript、Vue、Markdown、HTML、CSS、Sass、Scss、React(JSX/TSX)
- 提供生成函数名的功能，助力编写更有语义的代码

## 使用指南

1. **安装插件**：通过Visual Studio Code市场搜索“小废物翻译”，点击安装。

2. **激活插件**：插件将在以下文件类型中自动激活：
   - JavaScript (`.js`)
   - TypeScript (`.ts`)
   - Vue (`.vue`)
   - Markdown (`.md`)
   - HTML (`.html`)
   - CSS (`.css`)
   - Sass (`.sass`)
   - Scss (`.scss`)
   - React (`.jsx`/`.tsx`)

3. **使用翻译功能**：
   - 选中你希望翻译的文本。
   - 右键点击选中的文本，选择“📝 翻译成英文”或“📝 翻译成中文”进行翻译。
   - 如果需要生成函数名，请选择“📝 生成函数名”。



> 安装的时候最好使用 npm 如果使用 pnpm 在vsce package打包的时候会出现一些包找不到的问题，还需要额外安装.
