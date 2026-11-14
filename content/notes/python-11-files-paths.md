---
title: "Python 11：文件、路径与编码：先确认读写的对象"
date: "2026-11-12"
excerpt: "脚本换个启动位置就找不到文件，或者写入后才发现原内容被覆盖，这些都和路径与打开方式有关。用 pathlib 串起定位、文本编码、读写模式和按行处理，说明文件操作的实际边界。"
tags: [ "Python", "函数与程序组织" ]
category: "python-part2"
publication: "published"
display: { "toc": true }
publishedAt: 2026-11-12
---

同一份脚本，在编辑器点击运行能找到 `notes.txt`，从另一个目录启动却找不到。文件没有消失，改变的是相对路径的起点。`Path("notes.txt")` 表示当前工作目录下的文件，不会自动去脚本旁边寻找。

先把运行位置看清楚：

```python
from pathlib import Path

print(Path.cwd())
print(Path("notes.txt").resolve())
```

`resolve()` 可以把路径解析成绝对路径，便于看出实际指向哪里，但它不是“自动找到正确文件”的搜索工具。需要定位脚本自带的资源时，可以从 `Path(__file__).resolve().parent` 出发；用户选择的输入文件，则应该明确接收传入路径，而不是偷偷改变整个进程的工作目录。

## 路径对象不等于文件本身

`pathlib.Path` 让路径拼接和检查更清楚，创建一个 `Path` 对象本身不会创建文件：

```python
from pathlib import Path

path = Path("output") / "notes.txt"
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text("你好，Python\n", encoding="utf-8")
text = path.read_text(encoding="utf-8")
print(text.strip())
```

`/` 在这里是路径拼接，`path.parent` 是父目录。`mkdir(parents=True, exist_ok=True)` 创建所需目录；路径上若有同名普通文件等真正的冲突，仍然会报错。`write_text` 才执行实际写入，`read_text` 再把内容读成字符串。

这两个便捷方法适合小文件，内部会打开并关闭文件。文本编码显式写成UTF-8，使读写双方使用一致的规则。图片、压缩包等二进制数据则使用 `read_bytes`、`write_bytes` 或二进制模式，不要先强行解码成文字再存回去。

还要注意，这里的 `write_text` 会替换已有文件内容。示例输出放在专门的 `output` 目录，实际程序处理用户文档前必须先确定覆盖规则。

## 打开模式决定旧内容会发生什么

`open` 的常见模式各有具体行为：

| 模式 | 目标文件不存在 | 目标文件已存在 |
| --- | --- | --- |
| `r` | 报错 | 读取原内容 |
| `w` | 创建 | 打开时截断原内容 |
| `a` | 创建 | 从末尾追加 |
| `x` | 创建 | 报 `FileExistsError`，不覆盖 |

模式后加 `b` 表示二进制，例如 `rb`，不进行文本编码转换。`w` 的截断在文件打开时就发生，因此不能先用它打开重要文件，再慢慢验证输入能否生成完整结果。

`x` 适合新建报告等“不允许覆盖”的操作。先调用 `exists()` 再使用 `w`，中间仍可能有另一个进程创建文件；让创建操作本身拒绝同名目标，才能处理这个时间差。

对必须整体替换的配置文件，可以先生成同目录临时文件，写完并核对后再替换目标。原子替换主要保证其他读取者看到完整旧文件或完整新文件，断电持久性、权限和跨文件系统行为还需要按平台与文件系统处理，不能把一个“原子”当作所有安全要求的答案。

## 文件很大时，读取方式会影响内存

`read_text()` 一次读入整个文件，后续再 `splitlines()` 还可能增加额外内存。只需要筛出错误日志时，可以逐行处理。下面假定 `large.log` 是已有的UTF-8日志：

```python
with Path("large.log").open(encoding="utf-8") as file:
    for line in file:
        if "ERROR" in line:
            print(line.rstrip("\r\n"))
```

文件对象本身可以迭代，不必先把所有行装进列表。这里的处理仍可能因单行过大而占用较多内存，只是避免了同时保留整个文件。`rstrip("\r\n")` 只去掉行尾换行，保留日志里可能有意义的其他空白。

`with` 离开时会关闭文件，哪怕循环中途抛出异常也是如此。它负责资源清理，不会把读取失败自动变成成功，也不会帮你选对编码。

## 路径来自外部时，还要检查访问范围

用户提供的 `../private.txt` 或绝对路径，可能指向预期目录之外。单纯使用 `base / user_path` 不等于限制了访问范围；绝对路径、父目录和符号链接都需要考虑。对外提供文件访问的服务，应在边界校验允许的路径和文件类型，并结合系统权限限制访问，不能把拼接字符串当作隔离措施。

普通本地脚本也可以从错误类型得到线索：找不到文件是 `FileNotFoundError`，没有权限可能是 `PermissionError`，把目录当文件读取也会失败。先确认真实目标，再决定提示还是终止，不要统一返回空字符串，否则空文件和读失败就无法区分。

最后，用刚创建的 `output/notes.txt` 统计行数：

```python
with Path("output/notes.txt").open(encoding="utf-8") as file:
    line_count = sum(1 for _ in file)
print(line_count)  # 1
```

文件迭代按实际分行读取，没有末尾换行的最后一行也会被统计。若再往文件末尾追加一行，应得到2。这样把路径、模式、编码和处理方式逐一核对，才知道程序读写的确实是那一份内容。

---

[上一篇：异常处理：在哪里接住失败](/notes/python-10-exceptions) · [Python 目录](/notes/python-00-learning-guide) · [下一篇：JSON、CSV 与序列化边界](/notes/python-12-data-formats)

