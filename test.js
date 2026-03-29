const http = require('http');

const data = {
  customer_id: 'CUST-8EBE-E4E3', 
  type: 'gold',
  includeGst: false,
  items: [
    {
      item_name: 'Ring',
      gross_weight: 10,
      test_weight: 0,
      purity: 91.6,
      rate: 0
    }
  ]
};

const http = require('http');

const data = {
  customer_id: 'CUST-8EBE-E4E3', 
  type: 'gold',
  includeGst: false,
  items: [
    {
      item_name: 'Ring',
      gross_weight: 10,
      test_weight: 0,
      purity: 91.6,
      rate: 0
    }
  ]
};

// Login first
const loginData = JSON.stringify({ username: 'admin', password: 'admin123' });
const loginReq = http.request({
  hostname: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const token = JSON.parse(body).token;
    
    // Now make the real request
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const payload = '--' + boundary + '\r\nContent-Disposition: form-data; name=\"data\"\r\n\r\n' + JSON.stringify(data) + '\r\n--' + boundary + '--\r\n';

    const req = http.request({
      hostname: '127.0.0.1', port: 5000, path: '/api/certificates/with-photo', method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data; boundary=' + boundary, 'Authorization': 'Bearer ' + token }
    }, (res2) => {
      let body2 = '';
      res2.on('data', d => body2 += d);
      res2.on('end', () => console.log('STATUS:', res2.statusCode, 'BODY:', body2));
    });
    req.write(payload);
    req.end();
  });
});
loginReq.write(loginData);
loginReq.end();
