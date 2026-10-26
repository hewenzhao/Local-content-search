const { execSync } = require('child_process');
const path = require('path');

// 自动配置国内镜像源，解决在国内网络下下载 Electron 核心库超时的难题
process.env.ELECTRON_MIRROR = 'https://npmmirror.com/mirrors/electron/';
process.env.ELECTRON_BUILDER_BINARIES_MIRROR = 'https://npmmirror.com/mirrors/electron-builder-binaries/';

console.log('===================================================');
console.log('  本地文件内容搜索工具 V3.0 (Oct, 2026) - 打包程序');
console.log('  设计者：贺文照');
console.log('  已自动加载国内高速镜像源 (npmmirror.com)');
console.log('===================================================\n');

try {
  console.log('[1/2] 正在构建前端静态资源 (Vite)...');
  execSync('npx vite build', { stdio: 'inherit', env: process.env, cwd: __dirname });

  console.log('\n[2/2] 正在调用 electron-builder 打包 Windows 独立应用 (.exe)...');
  const isPortable = process.argv.includes('--portable');
  const targetFlag = isPortable ? '--win portable' : '--win';
  
  execSync(`npx electron-builder ${targetFlag} --publish never`, { 
    stdio: 'inherit', 
    env: process.env,
    cwd: __dirname 
  });

  console.log('\n===================================================');
  console.log('  ★ 打包成功！');
  console.log('  生成的可执行文件位于: dist-electron 文件夹');
  console.log('  - 便携单文件免安装版 (.exe) [推荐直接使用]');
  console.log('  - 标准安装向导程序 Setup (.exe)');
  console.log('===================================================\n');
} catch (err) {
  console.error('\n[打包终止] 遇到错误，请查看上方详细输出。');
  process.exit(1);
}
