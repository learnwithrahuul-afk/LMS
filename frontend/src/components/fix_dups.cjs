const fs = require('fs');
let content = fs.readFileSync('AdminDashboard.tsx', 'utf8');
content = content.replace(/\/\/ --- MCQs Helpers ---\s+const handleAddMCQ = \(\) => {[\s\S]*?const handleUpdateMCQOption = [\s\S]*?setModuleForm\({ \.\.\.moduleForm, mcqs: updatedMCQs }\);\s+};\s+/, '');
content = content.replace(/mcqs\?\: any\[\];\r?\n\s+mcqs\?\: any\[\];/g, 'mcqs?: any[];');
content = content.replace(/mcqs\: \[\],\r?\n\s+mcqs\: \[\]/g, 'mcqs: []');
fs.writeFileSync('AdminDashboard.tsx', content);

