const fs = require('fs');
let adminContent = fs.readFileSync('AdminDashboard.tsx', 'utf8');
let instModal = fs.readFileSync('instructor_modal.txt', 'utf8');

instModal = instModal.replace(/handleSubmitUpdate/g, 'handleSaveModule');
instModal = instModal.replace(/alert\('Update submitted for approval!'\);/g, '');

const startToken = '{showModuleModal && (';
const endToken = '{/* User Edit Modal */}';

const startIndex = adminContent.indexOf(startToken);
const endIndex = adminContent.indexOf(endToken);

if (startIndex !== -1 && endIndex !== -1) {
    adminContent = adminContent.slice(0, startIndex) + instModal + '\n\n            ' + adminContent.slice(endIndex);
    fs.writeFileSync('AdminDashboard.tsx', adminContent);
    console.log('Successfully replaced module modal in AdminDashboard');
} else {
    console.log('Could not find tokens in AdminDashboard.tsx');
}

