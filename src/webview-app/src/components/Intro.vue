<template>
  <div class="intro-component">
    <p>
      小废物翻译插件是一款轻量级的Visual Studio Code插件，旨在为开发者提供便捷的代码注释和文档翻译功能。
      该插件支持DeepL、百度、腾讯等多个翻译平台，能够快速将选中的文本翻译成英文或中文，
      同时提供生成函数名的辅助功能，帮助全球开发者克服语言障碍，提高编程效率。
    </p>
    <h2>功能特性</h2>
    <ul>
      <li>支持多个翻译平台（DeepL、百度、腾讯、火山翻译）</li>
      <li>快速翻译选中的文本</li>
      <li>
        支持的文件类型包括但不限于：JavaScript、TypeScript、Vue、Markdown、HTML、CSS、Sass、Scss、React(JSX/TSX)
      </li>
      <li>提供生成函数名的功能，助力编写更有语义的代码</li>
    </ul>
    <h2>使用指南</h2>
    <ol>
      <li><strong>安装插件</strong>：通过Visual Studio Code市场搜索“小废物翻译”，点击安装。</li>
      <li><strong>激活插件</strong>：插件将在以下文件类型中自动激活：
        <ul>
          <li>JavaScript (.js)</li>
          <li>TypeScript (.ts)</li>
          <li>Vue (.vue)</li>
          <li>Markdown (.md)</li>
          <li>HTML (.html)</li>
          <li>CSS (.css)</li>
          <li>Sass (.sass)</li>
          <li>Scss (.scss)</li>
          <li>React (.jsx/.tsx)</li>
        </ul>
      </li>
      <li><strong>使用翻译功能</strong>：
        <ul>
          <li>选中你希望翻译的文本。</li>
          <li>右键点击选中的文本，选择“📝 翻译成英文”或“📝 翻译成中文”进行翻译。</li>
          <li>如果需要生成函数名，请选择“📝 生成函数名”。</li>
        </ul>
      </li>
    </ol>
    <p>安装的时候最好使用 npm 如果使用 pnpm 在vsce package打包的时候会出现一些包找不到的问题，还需要额外安装.</p>
  </div>
</template>

<script>
export default {
  name: 'IntroComponent',
};
</script>

<style>
.intro-component h1, .intro-component h2 {
  color: #1890ff;
}

.intro-component p, .intro-component li {
  color: #333;
}

.intro-component ul, .intro-component ol {
  padding-left: 20px;
}

.intro-component .checkbox-group, .intro-component .submit-button, .intro-component .form {
  margin-top: 20px;
}

.intro-component .checkbox-wrapper {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.intro-component .checkbox-input {
  margin-right: 10px;
}

.intro-component .submit-button {
  cursor: pointer;
  padding: 10px 20px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 5px;
}

.intro-component .form {
  display: flex;
  flex-direction: column;
}
</style>
