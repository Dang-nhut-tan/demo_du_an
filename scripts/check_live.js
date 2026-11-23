const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

(async () => {
  const { status, data } = await get('https://demo-du-an-s7j9.onrender.com');
  console.log('Index HTML status:', status);
  console.log('HTML head/body snippet:', data.substring(0, 500));
  
  const scriptRegex = /src="(\/assets\/[^"]+)"/g;
  let match;
  while ((match = scriptRegex.exec(data)) !== null) {
    console.log('Script asset:', match[1]);
    const jsUrl = 'https://demo-du-an-s7j9.onrender.com' + match[1];
    const jsRes = await get(jsUrl);
    console.log('JS length:', jsRes.data.length);
    console.log('Contains ErrorBoundary?', jsRes.data.includes('ErrorBoundary') || jsRes.data.includes('Something went wrong') || jsRes.data.includes('da xay ra loi'));
    console.log('Contains demo-du-an-1?', jsRes.data.includes('demo-du-an-1.onrender.com'));
    console.log('Contains trash/delete in master-data?', jsRes.data.includes('lucide-react') && jsRes.data.includes('Trash2'));
  }
})();
