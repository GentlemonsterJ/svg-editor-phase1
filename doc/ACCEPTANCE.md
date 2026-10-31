# 验收对照

执行：`npm ci && npm run check`。覆盖率报告：`npm run test:coverage`。

| 要求 | 实现位置 | 验证 |
| --- | --- | --- |
| TypeScript、面向对象、类名与文件同名 | `src/domain`、`src/application`、`src/infrastructure`、`src/cli` | strict 编译、AST 架构检查 |
| Command | `application/commands/*Command.ts`、`EditingCommand.ts` | 一条命令一个执行对象；编辑统一进入 CommandHistory |
| Composite | `domain/Shape.ts`、`Group.ts` 与五种叶子类 | nested create/move/scale/set/delete 测试 |
| 六种类型与默认属性 | `domain/ShapeFactory.ts`、Providers | 六类型、浮点数、默认不写 fill/stroke |
| create ... in | `CreateCommand.ts`、`SvgDocument.ts` | 深层创建、目标缺失、非容器失败 |
| 唯一 id 和自动补 id | `SvgDocument.ts`、`SvgXmlCodec.ts` | 大小写、根 id、重复 id、后续显式 id 冲突 |
| delete / move / scale / set | 对应命令类及多态 Shape 方法 | 子树删除恢复、白名单、非正缩放、数值溢出回滚 |
| group / ungroup / addto | `SvgDocument.ts` | 最低公共父级、先序顺序、原位提升、循环拒绝、根级拒绝 |
| front / back | `SvgDocument.reorder()` | 同级绘制顺序，不影响其他分支 |
| tree / show / help | `ShapePresenter.ts`、命令注册表 | 内联几何、文本、父级及全部命令语法 |
| undo / redo | `CommandHistory.ts`、`HistoryEntry.ts` | 完整单元、分支清空、显示跳过、IO 屏障 |
| 失败不改状态 | 文档副本事务、IO 成功后提交 | 失败后的 XML、默认路径、redo 分支均保持；中途溢出回滚 |
| SVG 读写 | `SvgXmlCodec.ts`、`NodeFileGateway.ts` | XML 转义、嵌套、序列化稳定性、真实临时文件 |
| REPL 与脚本 | `cli/CliRunner.ts` | 子进程回放、提示符、空行、颜色、注释、引号路径、错误退出码 |
| 依赖方向与范式 | `scripts/check-architecture.mjs` | 57 个 TS 文件 / 168 处静态 import；无违规、无 switch、无顶层过程函数 |
| 历史完整性 | `history-property.test.ts` | 114 条混合编辑全部 undo 回到空文档、全部 redo 回到最终状态 |
| Git 过程与 final | `.git/` | 分步提交；最终版本标记 final；核对远程 main/final 与本地提交一致 |

测试中的内存文件适配器只用于确定性模拟读写失败；真实 CLI 与文件系统另有集成测试，不以替身测试替代实际磁盘验证。
