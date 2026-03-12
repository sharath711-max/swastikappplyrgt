const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '../../frontend/src/App.js');
let app = fs.readFileSync(appPath, 'utf8');

app = app.replace(/<Route path="\/" element=\{\s*<ProtectedRoute>/g, '<Route path="/" element={\n                            <ProtectedRoute roles={[\'admin\', \'manager\']}>');
app = app.replace(/<Route path="\/customers" element=\{\s*<ProtectedRoute>/g, '<Route path="/customers" element={\n                            <ProtectedRoute roles={[\'admin\', \'manager\', \'front_desk\', \'user\']}>');
app = app.replace(/<Route path="\/customers\/:id" element=\{\s*<ProtectedRoute>/g, '<Route path="/customers/:id" element={\n                            <ProtectedRoute roles={[\'admin\', \'manager\', \'front_desk\', \'user\']}>');
app = app.replace(/<Route path="\/certificates" element=\{\s*<ProtectedRoute>/g, '<Route path="/certificates" element={\n                            <ProtectedRoute roles={[\'admin\', \'manager\', \'front_desk\', \'user\']}>');
app = app.replace(/<Route path="\/list-views" element=\{\s*<ProtectedRoute>/g, '<Route path="/list-views" element={\n                            <ProtectedRoute roles={[\'admin\', \'manager\']}>');
app = app.replace(/<Route path="\/workflow" element=\{\s*<ProtectedRoute>/g, '<Route path="/workflow" element={\n                            <ProtectedRoute roles={[\'admin\', \'manager\', \'technician\', \'front_desk\', \'user\']}>');
app = app.replace(/<Route path="\/gold-test" element=\{\s*<ProtectedRoute>/g, '<Route path="/gold-test" element={\n                            <ProtectedRoute roles={[\'admin\', \'manager\', \'technician\', \'front_desk\', \'user\']}>');
app = app.replace(/<Route path="\/weight-loss" element=\{\s*<ProtectedRoute>/g, '<Route path="/weight-loss" element={\n                            <ProtectedRoute roles={[\'admin\', \'manager\']}>');

fs.writeFileSync(appPath, app);
console.log('App.js roles updated.');

const sbPath = path.join(__dirname, '../../frontend/src/components/layout/Sidebar.js');
let sb = fs.readFileSync(sbPath, 'utf8');

sb = sb.replace(/path: '\/',\s*icon: <FaTachometerAlt \/>,\s*exact: true\s*\}/g, 'path: \'/\',\n            icon: <FaTachometerAlt />,\n            exact: true,\n            roles: [\'admin\', \'manager\']\n        }');
sb = sb.replace(/path: '\/customers',\s*icon: <FaUsers \/>,?\s*\}/g, 'path: \'/customers\',\n            icon: <FaUsers />,\n            roles: [\'admin\', \'manager\', \'front_desk\']\n        }');
sb = sb.replace(/path: '\/workflow',\s*icon: <FaCheckDouble \/>\s*\}/g, 'path: \'/workflow\',\n            icon: <FaCheckDouble />,\n            roles: [\'admin\', \'manager\', \'technician\', \'front_desk\']\n        }');
sb = sb.replace(/path: '\/list-views',\s*icon: <FaBars \/>\s*\}/g, 'path: \'/list-views\',\n            icon: <FaBars />,\n            roles: [\'admin\', \'manager\']\n        }');

fs.writeFileSync(sbPath, sb);
console.log('Sidebar.js updated.');
