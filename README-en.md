<div align=center>
<img src="./doc/pic.png" width="300" height="300" />
</div>

<div align=center>
<a href="./README.md">简体中文</a> | English
</div>

Export DeepSeek conversations to Markdown files

[Chrome Web Store](https://chromewebstore.google.com/detail/deepseek2markdown/jfolcdbejlennfldgbninbjglbahaejn)

> If the button does not respond, please refresh the page and try again.

## Features

Plugin interface

<div align=center>
<img src="./doc/popup.png" width="300"/>
</div>

>If the code blocks do not display correctly when exporting images, try exporting again.

Original conversation / Exported Markdown text (typora theme is bluetex):

<div align=center>
<img src="./doc/example.png"/>
</div>

Original conversation / Exported PDF

<div align=center>
<img src="./doc/example-pdf.png"/>
</div>

Original conversation / Exported image

<div align=center>
<img src="./doc/example-image.png" width="400"/> 
</div>

## Usage

### Method 1: Download directly from the [Chrome Store](https://chromewebstore.google.com/detail/deepseek2markdown/jfolcdbejlennfldgbninbjglbahaejn)

[link](https://chromewebstore.google.com/detail/deepseek2markdown/jfolcdbejlennfldgbninbjglbahaejn)

![add-to-chrome](./doc/add-to-chrome.png)

### Method 2: Load unpacked files

1. Open the Chrome browser's extension loading page chrome://extensions/

<div align=center>
<img src="./doc/step1.png" width="400"/>
</div>

2. Load the unpacked extension. Assuming the downloaded directory is D:\code\github\deepseek2markdown, you should open D:\code\github\deepseek2markdown\src and click "Select Folder" to load the contents of the src folder.

<div align=center>
<img src="./doc/step2.png" width="400"/>
</div>

<div align=center>
<img src="./doc/step3.png" width="400" /> 
</div>

3. Pin the plugin in the plugin bar

**Note: If you have opened the DeepSeek webpage before using the plugin for the first time, you should refresh it first.**

<div align=center>
<img src="./doc/step4.png" width="300" /> 
</div>

4. Click the button to extract the current conversation's markdown file. You can choose whether to export the thought chain.

<div align=center>
<img src="./doc/popup.png" width="300" />
</div>

## To-Do List

- [ ] Support exporting to PDF
    - [x] Titles, thought chains, text styles (bold, italic, strikethrough), lists, tables, links and images, code, quotes, dividers, special symbols
    - [ ] Code block style optimization, support for formula export, support for highlighted text

v0.3

- [x] Support exporting specific messages from a conversation (custom selection of paragraphs, export only questions or answers)
- [x] Popup supports switching between Chinese and English

v0.2

- [x] Support strict mode Markdown export
- [x] Support filtering out server busy messages
- [x] Added image export function

v0.1

- [x] Popup interface beautification
- [x] Optimized markdown text export format
- [x] Option to export thought chain
- [x] Optimized code export style
- [x] Support for exporting tables
- [x] Support for exporting images
- [x] Optimized export style for multi-level lists

## Feedback and Contributions

If you encounter any issues or have suggestions for improvement, please feel free to submit an Issue or PR.

## Acknowledgments

[DeepSeek-Chat-Exporter](https://github.com/blueberrycongee/DeepSeek-Chat-Exporter)

