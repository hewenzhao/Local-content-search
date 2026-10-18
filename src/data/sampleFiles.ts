import { FileRecord } from '../types';

export const SAMPLE_FILES: FileRecord[] = [
  {
    id: 'sample_txt_01',
    name: '2024年度技术路线规划.txt',
    path: 'D:/Documents/Work/2024年度技术路线规划.txt',
    size: 4210,
    lastModified: Date.now() - 86400000 * 5,
    type: 'txt',
    extension: 'txt',
    content: `【2024年度技术路线与架构规划纲要】

一、总体目标与核心技术栈
在 2024 年度，技术研发团队重点推进微服务重构与高性能分布式检索引擎升级。
核心目标包括：
1. 实现本地全文检索毫秒级响应，针对 txt、doc、docx、excel、pdf、html 提供全兼容解析流。
2. 强化全文匹配机制，完整支持精准短语搜索（以半角双引号括起，如 "高可用架构"、"分布式缓存"）。
3. 提供灵活的正则表达式查询引擎，如手机号识别 \\b1[3-9]\\d{9}\\b、日期提取 \\d{4}-\\d{2}-\\d{2}。
4. 增强端侧数据安全与隐私保护，所有文档解析与全文索引完全在本地内存或轻量级存储完成，绝不回传敏感文件。

二、季度里程碑排期
- Q1阶段：完成 PDF 与 Excel 多工作表提取管线优化，降低内存占用 40%。
- Q2阶段：实现智能短语提取与上下文高亮高保真预览，定位行号与片段。
- Q3阶段：落地本地文件系统深度链接与文件管理器互通能力。
- Q4阶段：组织技术复盘与版本大重构。

负责人：张工 (zhang.tech@example.com)
项目代号：Project Horizon-2024
更新时间：2024-03-15`,
    metadata: {
      lineCount: 22,
    },
  },
  {
    id: 'sample_docx_02',
    name: '人工智能行业发展白皮书.docx',
    path: 'D:/Documents/Reports/人工智能行业发展白皮书.docx',
    size: 38450,
    lastModified: Date.now() - 86400000 * 2,
    type: 'docx',
    extension: 'docx',
    content: `人工智能行业发展白皮书（2024年版）

第一章：大模型与多模态AI技术突破
近年来，生成式人工智能技术经历了飞速迭代。各行业对非结构化文档处理的需求持续攀升。
企业内部沉淀了海量的 Word 文档（doc、docx）、Excel 报表以及 PDF 电子书，如何从数以万计的本地文档中快速检索关键信息，成为提升生产力效率的核心课题。

第二章：端侧本地检索与安全合规
传统云端检索方案存在敏感数据泄露风险。采用纯客户端/本地化文件内容搜索工具，能够确保文档不出本地 PC。
短语搜索是精准排查违规词与机密条款的利器，例如检索 "机密级协议" 或 "知识产权归属"。
正则表达式则广泛应用于合规检测，匹配身份证号 \\d{17}[\\dXx] 以及敏感密码格式。

第三章：发展趋势与展望
随着 WebAssembly 与现代化浏览器文件系统 API（File System Access API）的发展，网页端直接操控本地文件目录已无缝普及。未来将进一步向混合语义检索与向量匹配演进。`,
    metadata: {
      lineCount: 16,
    },
  },
  {
    id: 'sample_excel_03',
    name: '2024年第一季度财务预算明细.xlsx',
    path: 'D:/Finance/2024Q1/2024年第一季度财务预算明细.xlsx',
    size: 24500,
    lastModified: Date.now() - 86400000 * 8,
    type: 'excel',
    extension: 'xlsx',
    content: `[工作表: 部门预算汇总]
部门名称,预算科目,预算金额(RMB),实际支出(RMB),执行率,状态说明
研发中心,服务器采购与云资源,580000,420000,72.4%,正常推进中
研发中心,软件许可证与开发工具,120000,115000,95.8%,需追加预算
市场部,年度品牌公关推广,350000,210000,60.0%,按计划执行
人力资源,高层次人才猎聘与培训,80000,65000,81.3%,已签署3名资深架构师
运营中心,办公耗材与行政日常,45000,32000,71.1%,节约开支

[工作表: 重点项目投入]
项目名称,负责团队,预计投资额,立项时间,短语标识
Project Alpha,基础架构组,1200000,2024-01-10,"高优先级"
Project Beta,前端检索组件,450000,2024-02-15,"重点突破"
Project Gamma,数据安全沙箱,680000,2024-03-01,"合规审核"`,
    sheets: [
      {
        sheetName: '部门预算汇总',
        text: '部门名称,预算科目,预算金额(RMB),实际支出(RMB),执行率,状态说明\n研发中心,服务器采购与云资源,580000,420000,72.4%,正常推进中\n研发中心,软件许可证与开发工具,120000,115000,95.8%,需追加预算\n市场部,年度品牌公关推广,350000,210000,60.0%,按计划执行\n人力资源,高层次人才猎聘与培训,80000,65000,81.3%,已签署3名资深架构师\n运营中心,办公耗材与行政日常,45000,32000,71.1%,节约开支',
        rowCount: 6,
        colCount: 6,
      },
      {
        sheetName: '重点项目投入',
        text: '项目名称,负责团队,预计投资额,立项时间,短语标识\nProject Alpha,基础架构组,1200000,2024-01-10,"高优先级"\nProject Beta,前端检索组件,450000,2024-02-15,"重点突破"\nProject Gamma,数据安全沙箱,680000,2024-03-01,"合规审核"',
        rowCount: 4,
        colCount: 5,
      },
    ],
    metadata: {
      sheetCount: 2,
    },
  },
  {
    id: 'sample_pdf_04',
    name: '软件系统用户操作与维护手册.pdf',
    path: 'D:/Manuals/软件系统用户操作与维护手册.pdf',
    size: 112400,
    lastModified: Date.now() - 86400000 * 12,
    type: 'pdf',
    extension: 'pdf',
    content: `[第 1 页]
软件系统用户操作与维护手册（V3.2）
产品名称：本地文件全能检索套件
适用环境：Windows 10/11, macOS, Linux
版权所有：2024 科技创新实验室

[第 2 页]
第一节：搜索语法说明
1. 普通关键词：输入单个或多个词语，系统自动进行模糊与分词匹配。
2. 精确短语搜索：使用半角双引号括起，如 "本地文件内容搜索" 或 "操作与维护手册"。此时系统要求词组顺序与字符完全连续，杜绝分散匹配带来的噪音。
3. 正则表达式检索：支持标准 JavaScript 正则语法，可勾选“正则模式”。
例如：匹配所有包含 IP 地址的日志条目 \\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b。

[第 3 页]
第二节：本地文件链接与浏览联动
搜索命中结果后，系统提供“部分预览”卡片，展示命中语句及其上下文字段，并标记命中行号与页码。
点击“浏览文件”或“查看全文”按钮，可在内置多格式阅览器中完整滚动浏览，同时可点击匹配跳转按钮在文中直接定位。
用户亦可一键复制本地路径至操作系统剪贴板，快速在文件资源管理器（Explorer / Finder）中定位。`,
    pages: [
      {
        pageNumber: 1,
        text: '软件系统用户操作与维护手册（V3.2） 产品名称：本地文件全能检索套件 适用环境：Windows 10/11, macOS, Linux 版权所有：2024 科技创新实验室',
      },
      {
        pageNumber: 2,
        text: '第一节：搜索语法说明 1. 普通关键词：输入单个或多个词语，系统自动进行模糊与分词匹配。 2. 精确短语搜索：使用半角双引号括起，如 "本地文件内容搜索" 或 "操作与维护手册"。此时系统要求词组顺序与字符完全连续，杜绝分散匹配带来的噪音。 3. 正则表达式检索：支持标准 JavaScript 正则语法，可勾选“正则模式”。 例如：匹配所有包含 IP 地址的日志条目 \\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b。',
      },
      {
        pageNumber: 3,
        text: '第二节：本地文件链接与浏览联动 搜索命中结果后，系统提供“部分预览”卡片，展示命中语句及其上下文字段，并标记命中行号与页码。 点击“浏览文件”或“查看全文”按钮，可在内置多格式阅览器中完整滚动浏览，同时可点击匹配跳转按钮在文中直接定位。 用户亦可一键复制本地路径至操作系统剪贴板，快速在文件资源管理器（Explorer / Finder）中定位。',
      },
    ],
    metadata: {
      pageCount: 3,
    },
  },
  {
    id: 'sample_html_05',
    name: '产品发布说明与更新日志.html',
    path: 'D:/WebSites/docs/产品发布说明与更新日志.html',
    size: 8920,
    lastModified: Date.now() - 86400000 * 1,
    type: 'html',
    extension: 'html',
    content: `[Title: 产品发布说明与更新日志 - V2.5.0]

产品发布说明与版本更新记录
当前版本：v2.5.0-release
发布日期：2024-04-01

新特性与功能亮点：
1. 格式兼容性大扩展：全新支持 txt, doc, docx, excel (xls/xlsx), pdf, html 等六大家族格式的纯本地高保真解析。
2. 短语搜索全面增强：引入半角双引号精确包裹语法，支持 "产品发布说明" 级零误差检索。
3. 动态部分预览：即时生成带有前后文缓冲区的摘要卡片，高亮标记每一个命中的字词。
4. 本地文件无缝浏览：在界面内直接查看全文，支持一键复制路径并在操作系统资源管理器中快速定位。
5. 极致速度：基于内存倒排与流式解析，千份文件检索低于 15ms。`,
    metadata: {
      title: '产品发布说明与更新日志 - V2.5.0',
      lineCount: 14,
    },
  },
  {
    id: 'sample_doc_06',
    name: '旧版项目合作备忘录.doc',
    path: 'D:/Archive/Contracts/旧版项目合作备忘录.doc',
    size: 28600,
    lastModified: Date.now() - 86400000 * 60,
    type: 'doc',
    extension: 'doc',
    content: `旧版项目合作备忘录（Word 97-2003 DOC格式存盘）
立约方：北京宏图科技有限公司 与 华东协同数据实验室
协议签署日期：2023-11-20

第一条 合作范围与保密约定
双方就本地化桌面检索系统的算法优化展开战略合作。
任何一方对包含 "核心算法源码"、"客户业务数据" 等敏感资产均负有终身保密责任。
若发生争议，双方应友好协商，协商不成提请北京仲裁委员会仲裁。

第二条 联络与交接
技术对接人：李经理 (li.contact@example.org)
备忘录版本号：REV-DOC-9701`,
    metadata: {
      lineCount: 11,
    },
  },
  {
    id: 'sample_csv_07',
    name: '2024用户访问审计与安全日志.csv',
    path: 'D:/Logs/Audit/2024用户访问审计与安全日志.csv',
    size: 15420,
    lastModified: Date.now() - 86400000 * 3,
    type: 'csv',
    extension: 'csv',
    content: `timestamp,user_id,ip_address,action,status,details
2024-04-10 09:15:22,user_8801,192.168.1.102,LOGIN,SUCCESS,本地身份验证通过
2024-04-10 09:20:45,user_8801,192.168.1.102,SEARCH,SUCCESS,"查询短语: 本地文件搜索"
2024-04-10 10:02:11,user_9903,192.168.1.188,EXPORT_INDEX,SUCCESS,导出解析索引缓存文件
2024-04-10 11:34:00,user_9903,192.168.1.188,FILE_BROWSE,SUCCESS,浏览文件: 财务预算明细.xlsx
2024-04-10 14:12:05,user_7720,192.168.1.55,INDEX_DIRECTORY,SUCCESS,检索文件夹: D:/Documents`,
    sheets: [
      {
        sheetName: '2024用户访问审计与安全日志.csv',
        text: 'timestamp,user_id,ip_address,action,status,details\n2024-04-10 09:15:22,user_8801,192.168.1.102,LOGIN,SUCCESS,本地身份验证通过\n2024-04-10 09:20:45,user_8801,192.168.1.102,SEARCH,SUCCESS,"查询短语: 本地文件搜索"\n2024-04-10 10:02:11,user_9903,192.168.1.188,EXPORT_INDEX,SUCCESS,导出解析索引缓存文件\n2024-04-10 11:34:00,user_9903,192.168.1.188,FILE_BROWSE,SUCCESS,浏览文件: 财务预算明细.xlsx\n2024-04-10 14:12:05,user_7720,192.168.1.55,INDEX_DIRECTORY,SUCCESS,检索文件夹: D:/Documents',
        rowCount: 6,
        colCount: 6,
      },
    ],
    metadata: {
      lineCount: 6,
      sheetCount: 1,
    },
  },
  {
    id: 'sample_json_08',
    name: '系统配置与集群策略.json',
    path: 'D:/Configs/Cluster/系统配置与集群策略.json',
    size: 11200,
    lastModified: Date.now() - 86400000 * 4,
    type: 'json',
    extension: 'json',
    content: `{
  "app_name": "本地文件内容搜索工具",
  "version": "1.0.0",
  "engine": {
    "indexing_mode": "in-memory-inverted-index",
    "supported_extensions": [
      "txt",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "csv",
      "json",
      "pdf",
      "html"
    ],
    "max_file_size_mb": 100,
    "security_sandbox": true
  },
  "search_capabilities": {
    "phrase_search": true,
    "regex_search": true,
    "case_sensitive": true,
    "whole_word": true
  },
  "cache_strategy": {
    "allow_export_index": true,
    "allow_import_index": true,
    "description": "解析索引支持导出为独立文件，便于下次秒级加载与继续未完成工作"
  }
}`,
    metadata: {
      lineCount: 29,
    },
  },
];
