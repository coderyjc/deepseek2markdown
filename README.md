<div align=center>
<img src="./doc/pic.png" width="300" height="300" />
</div>

<div align=center>
简体中文 | <a href="./README-en.md">English</a>
</div>

导出DeepSeek的对话到Markdown文件

## 演示

原始对话 / 导出文本(typora主题为[bluetex](https://github.com/DaYangtuo247/typora-blueTex-theme))：

<div align=center>
<img src="./doc/example.png"/>
</div>

## 使用方法

### 方法一：加载已解压的文件

1. 打开Chrome浏览器的加载扩展程序页面 [chrome://extensions/](chrome://extensions/)

<div align=center>
<img src="./doc/step1.png" width="400"/>
</div>

2. 加载已解压的扩展程序。假设我下载的目录为D:\code\github\deepseek2markdown，则应该打开D:\code\github\deepseek2markdown\src 并点击“选择文件夹”，加载src文件夹中的内容。

<div align=center>
<img src="./doc/step2.png" width="400"/>
</div>

<div align=center>
<img src="./doc/step3.png" width="400" />
</div>

3. 在插件栏固定插件

**注意：首次加载插件使用之前如果打开了DeepSeek的网页，应该先刷新一下。**

<div align=center>
<img src="./doc/step4.png" width="300" />
</div>

4. 点击按钮提取当前对话的markdown文件，可勾选是否导出思维链

<div align=center>
<img src="./doc/step5.png" width="300" />
</div>


### 方法二：安装crx文件

应用暂未上架chrome extension store，建议使用方法一。

安装方法为解压crx之后，按照方法一执行。

## 待办事项

v0.1

- [x] popup界面美化
- [x] 导出markdown文本格式优化
- [x] 可选择是否导出思维链
- [x] 优化代码导出样式
- [ ] 优化多层列表的导出样式
- [ ] 支持导出表格

## 反馈与贡献

如果您在使用过程中遇到问题或有改进建议，欢迎提交 Issue 或 PR

## 致谢

[DeepSeek-Chat-Exporter](https://github.com/blueberrycongee/DeepSeek-Chat-Exporter)
