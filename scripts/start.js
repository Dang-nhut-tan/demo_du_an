const { spawn, execSync } = require('child_process');
const path = require('path');
const net = require('net');

// If running in production (e.g. Render Web Service), start lightweight production static server
if (process.env.NODE_ENV === 'production' || process.env.RENDER === 'true' || (process.env.PORT && !process.env.LOCAL_DEV)) {
  console.log('[System] Production environment detected. Starting production server...');
  require('./prod-server.js');
  return;
}

const ROOT_DIR = path.resolve(__dirname, '..');
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');
const isWin = process.platform === 'win32';

function checkPortInUse(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(400);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

(async () => {
  console.log('\x1b[36m%s\x1b[0m', '==================================================');
  console.log('\x1b[36m%s\x1b[0m', '   Khởi chạy U&I Logistics (Backend + Frontend)   ');
  console.log('\x1b[36m%s\x1b[0m', '   - Backend URL : http://127.0.0.1:8090         ');
  console.log('\x1b[36m%s\x1b[0m', '   - Frontend URL: http://127.0.0.1:5173         ');
  console.log('\x1b[36m%s\x1b[0m', '==================================================\n');

  let pbProcess = null;
  let viteProcess = null;

  // 1. Kiểm tra & Khởi động PocketBase
  const isPbRunning = await checkPortInUse(8090);
  if (isPbRunning) {
    console.log('\x1b[32m%s\x1b[0m', '[Backend] Cổng 8090 đã có PocketBase đang chạy (sẵn sàng kết nối).');
  } else {
    console.log('\x1b[33m%s\x1b[0m', '[System] Đang khởi động PocketBase (Backend)...');
    const pbExe = path.join(BACKEND_DIR, isWin ? 'pocketbase.exe' : 'pocketbase');
    pbProcess = spawn(pbExe, ['serve'], {
      cwd: BACKEND_DIR,
      stdio: 'pipe',
      shell: false,
    });

    pbProcess.stdout.on('data', (data) => {
      data.toString().trim().split('\n').forEach((line) => {
        if (line) console.log('\x1b[34m[Backend]\x1b[0m ' + line);
      });
    });

    pbProcess.stderr.on('data', (data) => {
      data.toString().trim().split('\n').forEach((line) => {
        if (line) console.error('\x1b[31m[Backend Error]\x1b[0m ' + line);
      });
    });
  }

  // 2. Kiểm tra & Khởi động Frontend (Vite)
  const isViteRunning = await checkPortInUse(5173);
  if (isViteRunning) {
    console.log('\x1b[32m%s\x1b[0m', '[Frontend] Cổng 5173 đã có Vite dev server đang chạy: http://127.0.0.1:5173\n');
  } else {
    console.log('\x1b[33m%s\x1b[0m', '[System] Đang khởi động Vite Dev Server (Frontend)...');
    viteProcess = isWin
      ? spawn('cmd.exe', ['/c', 'npm', 'run', 'dev'], { cwd: FRONTEND_DIR, stdio: 'pipe' })
      : spawn('npm', ['run', 'dev'], { cwd: FRONTEND_DIR, stdio: 'pipe' });

    viteProcess.stdout.on('data', (data) => {
      data.toString().trim().split('\n').forEach((line) => {
        if (line) console.log('\x1b[32m[Frontend]\x1b[0m ' + line);
      });
    });

    viteProcess.stderr.on('data', (data) => {
      data.toString().trim().split('\n').forEach((line) => {
        if (line) console.error('\x1b[31m[Frontend Error]\x1b[0m ' + line);
      });
    });
  }

  // Xử lý tắt tiến trình mượt mà khi nhấn Ctrl + C
  let isCleaningUp = false;
  function cleanExit() {
    if (isCleaningUp) return;
    isCleaningUp = true;

    console.log('\n\x1b[33m%s\x1b[0m', '[System] Đang tắt các tiến trình khởi tạo...');
    const killProc = (proc) => {
      if (proc && proc.pid) {
        try {
          if (isWin) {
            execSync(`taskkill /pid ${proc.pid} /T /F`, { stdio: 'ignore' });
          } else {
            proc.kill('SIGTERM');
          }
        } catch (e) {
          // Process already ended
        }
      }
    };

    killProc(pbProcess);
    killProc(viteProcess);
    console.log('\x1b[32m%s\x1b[0m', '[System] Đã đóng.');
    process.exit(0);
  }

  process.on('SIGINT', cleanExit);
  process.on('SIGTERM', cleanExit);

  // Nếu cả 2 đều đã chạy trước đó, giữ process mở để user có thể xem log hoặc nhấn Ctrl+C
  if (!pbProcess && !viteProcess) {
    console.log('\x1b[35m%s\x1b[0m', '[Ready] Cả Backend và Frontend đều đã sẵn sàng phục vụ!');
    console.log('➜ Truy cập App      : http://127.0.0.1:5173');
    console.log('➜ PocketBase Admin : http://127.0.0.1:8090/_\n');
    console.log('Nhấn Ctrl + C để dừng/thoát.');
    process.stdin.resume();
  }
})();
