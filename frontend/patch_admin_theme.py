import re

with open(r'd:\Projects\R-LMS\frontend\src\components\AdminDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

new_render = '''
    return (
        <div className="min-h-screen bg-[#f4f7f6] flex">
            {/* Sidebar */}
            <div className="w-64 bg-[#0A2A66] text-white flex flex-col shadow-2xl z-10">
                <div className="p-6 pb-2 border-b border-white/10 flex flex-col items-center">
                    <div className="bg-white rounded-lg p-2 w-full flex justify-center mb-4">
                        <img src="/logo.svg" alt="Logo" className="h-10" onError={(e) => {e.currentTarget.src='https://via.placeholder.com/150x50?text=LWR'}} />
                    </div>
                    <h2 className="text-xl font-bold tracking-wider">Admin Panel</h2>
                </div>
                
                <div className="flex-1 py-6 space-y-2 px-4">
                    <button onClick={() => setActiveTab('dashboard')} className={w-full flex items-center p-3 rounded-lg transition-colors \}><LayoutDashboard size={20} className="mr-3" /> Dashboard</button>
                    <button onClick={() => setActiveTab('users')} className={w-full flex items-center p-3 rounded-lg transition-colors \}><Users size={20} className="mr-3" /> User Management</button>
                    <button onClick={() => setActiveTab('modules')} className={w-full flex items-center p-3 rounded-lg transition-colors \}><BookOpen size={20} className="mr-3" /> Course Content</button>
                    <button onClick={() => setActiveTab('updates')} className={w-full flex items-center p-3 rounded-lg transition-colors \}><Clock size={20} className="mr-3" /> Review Updates</button>
                </div>
                
                <div className="p-4 border-t border-white/10 bg-black/10">
                    <div className="flex items-center mb-4">
                        <div className="w-8 h-8 rounded-full bg-[#0FA958] flex items-center justify-center font-bold text-sm mr-3">A</div>
                        <div>
                            <p className="text-sm font-bold">Administrator</p>
                            <p className="text-xs text-yellow-500">admin@lwr.com</p>
                        </div>
                    </div>
                    <button onClick={onLogout} className="w-full flex items-center text-sm text-red-400 hover:text-red-300 transition-colors"><LogOut size={16} className="mr-2" /> Logout</button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-full">
                    {activeTab === 'dashboard' && renderDashboardTab()}
                    {activeTab === 'users' && renderUserTab()}
                    {activeTab === 'modules' && renderModuleTab()}
                    {activeTab === 'updates' && renderUpdatesTab()}
                </div>
            </div>
'''

content = re.sub(r'return \(\s*<div className="min-h-screen bg-gray-50 p-6">.*?<div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-8">.*?</div>\s*</div>', new_render, content, flags=re.DOTALL)

with open(r'd:\Projects\R-LMS\frontend\src\components\AdminDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
