## 第一章：入门

### 1. 项目创建

#### (1) 初始化模块化开发项目（创建 package.json）

```
npm init (-y)
```
#### (2) 安装 webpack

```
到本项目: cnpm i webpack webpack-cli -D
到全局: cnpm i webpack webpack-cli -g

webpack: 最新稳定版
webpack@<version>: 指定版本
webpack@beta: 最新体验版

优点: 安装到全局后，可以在任何地方共用一个 webpack.exe ，而不用各个项目重复安装，运行时也只要直接在命令行执行 webpack 命令即可。
缺点: 不同项目依赖不同版本的 webpack 导致冲突
```

#### (3) 使用 webpack

```
1. npx webpack: Node 8.2+ 提供的 npx 命令，可以运行在初始 package.json 安装的 webpack 包的 webpack二进制文件(./node_modules/.bin/webpack)  

2. webpack: 如果 webpack.config.js 存在，则 webpack 命令将默认选择使用它

3. npm run bulid: 在 Npm Script (package.json) 里定义的任务会优先使用本项目下的 webpack
```

#### (4) 配置文件

##### |- package.json

```json
"scripts": {
    "build": "webpack --config webpack.config.js"
}

--config选项: 表明，可以传递任何名称的配置文件，这对于需要拆分成多个文件的复杂配置非常有用
```
##### |- public/index.html

```html
<body>
    <div id="app"></div>

    <!--导入 Webpack 输出的 JavaScript 文件-->
    <script src="../dist/bundle.js"></script>
</body>
```
##### |- src/main.js

```js
function show(content) {
    document.getElementById('app').innerText = 'Hello,' + content;
}
  
show('webpack');
```
##### |- webpack.config.js

```js
const path = require('path');

module.exports = {
    entry: './src/main.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './dist')
    }
}

// webpack 从 entry  指定的入口文件出发，识别出源码中的模块化导入语句，递归地寻找出入口文件的所有依赖，把入口和其所有依赖打包到 output 指定的一个单独的文件中。
// PS: 理解递归寻找这个词
// configuration.output.path: './dist' 报错
	——configuration.output.path: The provided value "./dist" is not an absolute path!
        ——The output directory as **absolute path** (required).
```

#### (5) WARNING in configuration

```
1. The 'mode' option has not been set, webpack will fallback to 'production' for this value. 
2. Set 'mode' option to 'development' or 'production' to enable defaults for each environment.
3. You can also set it to 'none' to disable any default behavior.
```

### 2. 使用 Loader

- webpack 要支持非 JS 类型的文件，需要使用 webpack 的 Loader  机制（具有文件转换功能的翻译员）

#### (1) CSS

- webpack 中一切文件皆模块，因此 CSS文件也可以使用 import 或 require 导入

##### 1. 第一轮

```css
|- src/assets/main.css

#app {
    text-align: center;
}
```

```js
|- src/main.js

import './assets/css/main.css'
```

```
执行 webpack 命令

1. ERROR in ./src/assets/css/main.css 1:0

2. Module parse failed: Unexpected character '#' (1:0)

3. You may need an appropriate loader to handle this file type, currently no loaders
 are configured to process this file.
```
##### 2. 第二轮

```
cnpm i css-loader style-loader -D
```

```js
|- webpack.config.js

module.exports = {
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['css-loader', 'style-loader']
            }
        ]
    }
}

// 遇到以 .css 结尾的文件，使用指定的 Loader 去加载和转换
```

```
执行 webpack 命令

1. ERROR in ./src/assets/css/main.css

2. Module build failed (from ./node_modules/_css-loader@4.2.1@css-loader/dist/cjs.js):
CssSyntaxError
```

##### 3. 第三轮

```js
|- webpack.config.js

use: ['style-loader', 'css-loader']

// Loader 的执行顺序是从下往上、从右往左的

// 先使用 css-loader 读取 CSS 文件
	—— The css-loader interprets @import and url() like import/require() and will resolve them.
// 再交给 style-loader 把 CSS 内容注入到 JS
    ——The style-loader adds CSS to the DOM by injecting a <style> tag.
```

```
执行 webpack 命令

// bundle.js 中被注入了 main.css 中的 CSS 代码，而并不是额外生成一个 CSS 文件
```

### 3. 使用 Plugin

- Plugin 用于扩展 webpack 功能。通过在构建流程中注入钩子实现，Plugin 给 webpack 带来了很大的灵活性

#### （1）extract-text-webpack-plugin

> Extract text from a bundle, or bundles, into a separate file.

>  Since webpack v4 the `extract-text-webpack-plugin` should not be used for css. Use [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin) instead.

#### （2）mini-css-extract-plugin

> 1. This plugin extracts CSS into separate files. 
> 2. It creates a CSS file per JS file which contains CSS. 
> 3. It supports On-Demand-Loading of CSS and SourceMaps.
> 4. It builds on top of a new webpack v4 feature (module types) and requires webpack 4 to work.

```
cnpm i mini-css-extract-plugin -D
```

- 因为不再通过注入 style 标签把 CSS 代码添加进 DOM 中，而是从 bundle.js 中提取出 CSS 到一个额外的 CSS 文件，因此可以不再依赖 style-loader。同时，html 页面需要使用提取出的 CSS 文件，也需要额外配置。

```js
|- webpack.config.js

const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: './src/main.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './dist')
    },

    module: {
        rules: [
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            }
        ]
    },
    
    plugins: [new MiniCssExtractPlugin()]
}
```

```html
|- public/index.html

<link rel="stylesheet" href="../dist/main.css">
```

### 4. 使用 DevServer

> DevServer 会启动一个 HTTP 服务器用于服务网页请求，同时会帮助启动 webpack，并接受 webpack 发出的文件变更信号，通过 WebSocket 协议自动刷新网页做到实时预览

```
cnpm i webpack-dev-server -D
cnpm i webpack-dev-server -g
```

```js
|- webpack.config.js

module.exports = {
    ...
    devServer: {
        port: '8090',
        open: true,
        contentBase: path.resolve(__dirname, 'public')
    }
    ...
}

// This set of options(devServer) is picked up webpack-dev-server and can be used to change ite behavior in various ways.
```

> 1. DevServer 会把 webpack 构建出的文件保存在内存中，在要访问输出的文件时，必须通过HTTP服务访问
>
> 2. DevServer 会忽略 webpack.config.js 里配置的 output.path 属性，所以 output.filename 指定的文件的正确 URL 是在当前目录
>
> 3. **实时预览**：此时修改 main.js 和 main.css 中的任何一个文件，保存后浏览器会**自动刷新整个网页**，运行出修改后的结果。
>
>    ```
>    1. webpack 在启动时可以开启监听模式，当发生变化时重新执行完构建后通知 DevServer。
>    2. DevServer 会让 webpack 在构建出的 JS 代码里注入一个代理客户端，用于控制网页。
>    3. 网页和 DevServer 之间通过 WebSocket 协议通信，以方便 DevServer 主动向客户端发送命令。
>    4. DevServer 收到来自 webpack 的文件变化通知时通过注入的代理客户端控制网页刷新。
>    ```
>
> 4. index.html 修改不变化？
>
>    ```
>    webpack 在启动时会以配置的 entry 入口去递归解析出 entry 所依赖的文件，只有 entry 本身和依赖的文件才会被 webpack 添加到监听列表中。而 index.html 文件是脱离 JS 模块化系统的，所以 webpack 不知道它的存在，自然也不会把它添加到监听列表中。
>    ```
>
> 5. **模块热替换**（Hot Module Replacement，HMR）：不重新加载整个网页的情况下，通过将被更新过的模块替换老的模块，再重新执行一次来实现实时预览。
>
>    (1) 模块热替换相对于默认的刷新机制：提供更快的响应和更好的开发体验。
>
>    (2) 模块热替换不适用于生产环境，只应当在开发环境中使用。
>
>    (3) 启用：DevServer: { hot: true }
>
>    (4) HMR 插件 为 webpack 内置
> 6. 支持 Source Map：调试工具可以通过 Source Map 映射代码，从而在源代码上断点调试，而不是在编译器编译后输出的代码。 
>
>    启用：webpack 启动时带上 --devtool source-map 参数

### 5. 核心概念

```
1. entry: 入口，webpack 执行构建的第一步将从 entry 开始
2. module: 模块，在 webpack 中一切皆模块，一个模块对应一个文件。webpack会从配置的 entry 开始递归找出所有依赖的模块
3. chunk: 代码块，一个代码块由多个模块组合而成，用于代码合并与分割
4. loader: 模块转换器，用于把模块原内容按照需求转换成新内容
5. plugin: 扩展插件，在 webpack 构建流程中的特定时机注入扩展逻辑来达到预期目标
6. output: 输出结果
```

> webpack 启动后会从 <code>entry</code> 配置的 `Module` 开始递归解析 `entry` 依赖的所有 `Module` 。每找到一个 `Module`，就会根据配置的 `loader` 去找出对应的转换规则，对 `Module` 进行转换后，再解析出当前 `Module` 依赖的 `Module`。这些 `Module` 会以 `entry` 为单位进行分组，一个 `entry` 和其所有依赖的 `Module` 被分到一个 `chunk`。最后 webpack 会把所有 `chunk` 转换成文件输出。在整个流程中，webpack 会在恰当的时机执行 `plugin` 里定义的逻辑。