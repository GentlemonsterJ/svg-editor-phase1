# SVG Editor — Lab1 Phase 1

TypeScript 面向对象 SVG 命令行编辑器。支持任务说明中的全部 Phase 1 命令、六种内置类型、嵌套容器、单命令撤销/重做、SVG 读写和脚本回放。

## 快速开始

环境：Node.js 22 或更新版本，npm。

```bash
npm ci
npm run cli
```

```text
svg> init 800 600
svg> create g scene
svg> create rect r1 30 70 120 60 #4a90d9 in scene
svg> create text t1 50 105 "开始" in scene
svg> move scene 20 10
svg> undo
svg> redo
svg> tree
svg> save demo.svg
```

用浏览器打开生成的 `demo.svg` 查看效果。`help` 显示完整语法；Ctrl+D（EOF）退出。

脚本模式省略欢迎信息与提示符；出现错误仍继续后面的命令，最终退出码为 1。交互模式会持续接受输入。

```bash
npm run cli -- --script < examples/flowchart.cli
npm run cli -- --script < examples/history.cli
npm run check
npm run test:coverage
```

也可先 `npm run build`，再运行 `node dist/src/cli/main.js --script`。脚本内相对文件路径以启动 CLI 时的工作目录为准。

## 命令

| 分类 | 命令 |
| --- | --- |
| 文档 | `init [w] [h]`、`read <file.svg>`、`save [file.svg]`、`canvas [w h]` |
| 编辑 | `create`、`delete`、`move`、`scale`、`set`、`group`、`ungroup`、`addto`、`front`、`back` |
| 显示 | `tree [id]`、`show <id>`、`help` |
| 历史 | `undo`、`redo` |

`create` 支持 `rect / circle / ellipse / line / text / g` 和尾部 `in <containerId>`。文本与含空格文件路径用双引号；双引号内支持 `\"`、`\\`，其他反斜杠保持原样。只有整行首个非空白字符为 `#` 时才是注释，因此 `#4a90d9` 可正常作为颜色。

## 语义说明

- 所有 id 大小写敏感、文档内唯一；CLI 中必须显式给出非空且不含空白的 id。SVG 根元素已有的 id 也会保留并参与冲突检查。
- 不给 fill/stroke 就不生成该属性。`set` 严格使用作业白名单，不能通过它改 id、父子关系或 `font-size`。
- `move` 为增量；`scale` 以坐标原点为基准缩放全部几何坐标及尺寸；字体大小和描边粗细不属于本阶段 scale 命令修改的几何属性。
- `set g fill ...` 设置 SVG 容器的继承属性，不覆盖子元素已有属性；不实现 box 的 fill/label 转发语义。
- `group` 的细节见 [架构文档](doc/README.md)：按原文档先序保持成员顺序；插入最低公共父级的最早选中分支位置。跨父级移动保留元素的几何属性；不重算 CSS 继承。
- `front` 移到同级数组末端（最后绘制，视觉最前）；`back` 移到开头。`ungroup` 提升子节点后移除容器，容器自身的属性也随之移除；根级 g 按作业要求拒绝解散。
- init/read/save/canvas 修改尺寸成功后清空历史并阻止 undo/redo，直到下一次编辑成功。查询 canvas、tree/show/help、失败命令都不改变历史。
- `save file.svg` 成功后，该路径成为后续 `save` 的默认路径；`read` 更新路径，`init` 重置路径。

## SVG 范围

读入六种内置类型及嵌套 g；先预留文件中的全部显式 id，再为缺失 id 自动分配并警告。未知元素、重复 id 或格式错误会使整个 read 失败，保留原文档。支持 px / 无单位数值、viewBox、XML 转义与基本展示属性；保留其他普通属性用于往返。

额外支持将 `translate(...)` 与正数均匀 `scale(...)` 及其嵌套组合归一化到几何坐标，同时处理基本 font-size/stroke-width。旋转、非均匀缩放、矩阵、百分比尺寸、tspan、path、DTD/实体声明及缩放时的内联 CSS 明确拒绝。此阶段处理的是基本 SVG 子集，不是通用 SVG/CSS 渲染器。

未注册的 `data-kind="box"` 作为普通 g 读入并保留标记；`create box` 按要求报 unknown shape type。

## 工程与提交

- 必交文档：[doc/README.md](doc/README.md)，包括架构、PlantUML 图、过程记录、一致性自查与质量保证。
- 验收对照：[doc/ACCEPTANCE.md](doc/ACCEPTANCE.md)。
- `examples/flowchart.cli` / `history.cli` 可回放；对应 `.svg` 可直接在浏览器中查看。
- 工程包包含 `.git/`，保留分步提交与 `final` 标签。用 `git log --oneline --decorate` 查看，不要删除 `.git/` 后再提交成一个大包。
- 远程提交目标：[GentlemonsterJ/svg-editor-phase1](https://github.com/GentlemonsterJ/svg-editor-phase1)。以该仓库的 `main` 和 `final` 标签为准；本地标签不能代替远程提交要求。截止时间以课程通知为准。

如需从保留历史的工程包手动同步到该仓库，可使用以下命令（已有 origin 时跳过第一条）：

```bash
git remote add origin https://github.com/GentlemonsterJ/svg-editor-phase1.git
git push -u origin main
git push origin final
```

如果之后继续修改，按实际修改分次提交；最终验收后更新 `final`。若标签已发布，先遵守课程关于标签修订的规则，不要直接强制覆盖远程历史。
