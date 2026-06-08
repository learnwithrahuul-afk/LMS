const fs = require('fs');
let adminContent = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');
let instModal = fs.readFileSync('instructor_modal.txt', 'utf8');

// Add activeModalTab state
if (!adminContent.includes('activeModalTab')) {
    adminContent = adminContent.replace('const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(null);', 
        'const [activeModalTab, setActiveModalTab] = useState<''sections'' | ''code'' | ''mcqs'' | ''sessions''>(''sections'');\n    const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(null);');
}

// Replace handleSubmitUpdate with handleSaveModule in the modal code
instModal = instModal.replace(/handleSubmitUpdate/g, 'handleSaveModule');

// Find where showModuleModal starts and ends in AdminDashboard.tsx
const startToken = '{showModuleModal && (';
const endToken = '{/* User Edit Modal */}';

const startIndex = adminContent.indexOf(startToken);
const endIndex = adminContent.indexOf(endToken);

if (startIndex !== -1 && endIndex !== -1) {
    // The instModal also has {showModuleModal && (
    adminContent = adminContent.slice(0, startIndex) + instModal + '\n\n            ' + adminContent.slice(endIndex);
    fs.writeFileSync('src/components/AdminDashboard.tsx', adminContent);
    console.log('Successfully updated AdminDashboard.tsx');
} else {
    console.log('Could not find tokens in AdminDashboard.tsx');
}

