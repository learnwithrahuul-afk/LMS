import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { Users, BookOpen, Plus, Edit, Trash2, Save, X, BarChart2, Search, LayoutDashboard, FileText, Video, LogOut, Clock, CheckCircle, XCircle } from 'lucide-react';

interface User {
    _id: string;
    email: string;
    fullName: string;
    role: string;
    progress: number;
    completedModules: string[];
    enrolledCourses?: string[];
    quizScores?: {
        moduleId: string;
        score: number;
        totalQuestions: number;
        percentage: number;
    }[];
    referredBy?: string;
    finalAssessment?: {
        score: number;
        passed: boolean;
        attempts: number;
    };
    courseAssessments?: {
        courseId: string;
        score: number;
        passed: boolean;
        attempts: number;
    }[];
}

interface Section {
    title: string;
    content: string;
    videoUrl?: string;
    pdfUrl?: string;
    image?: string;
}

interface ModuleSession {
    title: string;
    date: string;
    time: string;
    link: string;
    duration: string;
    isLive?: boolean;
    content?: string;
    videoUrl?: string;
    pdfUrl?: string;
    code?: string;
    output?: string;
    mcqs?: { question: string; options: string[]; correctAnswer: number }[];
}

interface Module {
    id: string;
    title: string;
    courseId?: string;
    order: number;
    sessions: ModuleSession[];
}

interface ModuleUpdate {
    _id: string;
    moduleId: string;
    title: string;
    courseId?: string;
    instructorEmail: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
    adminComment?: string;
    updates: {
        sessions: ModuleSession[];
    };
}


interface AdminDashboardProps {
    onLogout?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'modules' | 'updates'>('dashboard');
    const [users, setUsers] = useState<User[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [pendingUpdates, setPendingUpdates] = useState<ModuleUpdate[]>([]);
    const [showModuleModal, setShowModuleModal] = useState(false);
    const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const [selectedUpdate, setSelectedUpdate] = useState<ModuleUpdate | null>(null);
    const [reviewTab, setReviewTab] = useState<'sections' | 'code' | 'mcqs' | 'sessions'>('sections');

    // User Editing State
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [userForm, setUserForm] = useState({
        email: '',
        fullName: '',
        role: 'user',
        enrolledCourses: [] as string[]
    });

    // Form State
    const [moduleForm, setModuleForm] = useState<Module>({
        id: '',
        title: '',
        courseId: 'csv-course',
        order: 0,
        sessions: []
    });

    // Section Editing State
    const [activeModalTab, setActiveModalTab] = useState<'sections' | 'code' | 'mcqs' | 'sessions'>('sections');
    const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(null);
    const [activeSessionIndex, setActiveSessionIndex] = useState<number | null>(null);

    // Course Mapping
    const courseNames: Record<string, string> = {
    'csv-course': 'Computerized System Validation'
};

    // Helper to get course color
    const getCourseColor = (courseId: string) => {
        const colors = [
            'bg-[#eef2f7]0', 'bg-purple-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500',
            'bg-indigo-500', 'bg-pink-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500'
        ];
        let hash = 0;
        for (let i = 0; i < courseId.length; i++) {
            hash = courseId.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    useEffect(() => {
        fetchUsers();
        fetchModules();
        fetchPendingUpdates();
    }, []);

    const fetchPendingUpdates = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/instructor/pending-updates`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setPendingUpdates(data);
            } else {
                setPendingUpdates([]);
            }
        } catch (error) {
            console.error("Error fetching updates:", error);
        }
    };

    const handleApproveUpdate = async (id: string) => {
        if (!confirm("Are you sure you want to approve this update?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/instructor/approve-update/${id}`, { method: 'POST' });
            if (res.ok) {
                alert("Update approved!");
                fetchPendingUpdates();
                fetchModules(); // Refresh modules
            } else {
                alert("Failed to approve update");
            }
        } catch (error) {
            console.error("Error approving:", error);
        }
    };

    const handleRejectUpdate = async (id: string) => {
        const reason = prompt("Enter rejection reason:");
        if (reason === null) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/instructor/reject-update/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });
            if (res.ok) {
                alert("Update rejected.");
                fetchPendingUpdates();
            }
        } catch (error) {
            console.error("Error rejecting:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/users`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setUsers(data);
            } else {
                console.error("Expected array of users, got:", data);
                setUsers([]);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            setUsers([]);
        }
    };

    const fetchModules = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/courses?all=true`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setModules(data);
            } else {
                console.error("Expected array of modules, got:", data);
                setModules([]);
            }
        } catch (error) {
            console.error("Error fetching modules:", error);
            setModules([]);
        }
    };

    const handleAddUser = () => {
        setEditingUser(null);
        setUserForm({
            email: '',
            fullName: '',
            role: 'user',
            enrolledCourses: []
        });
        setShowUserModal(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setUserForm({
            email: user.email || '',
            fullName: user.fullName || '',
            role: user.role || 'user',
            enrolledCourses: user.enrolledCourses || []
        });
        setShowUserModal(true);
    };

    const handleSaveUser = async () => {
        try {
            const url = editingUser
                ? `${API_BASE_URL}/api/admin/users/${editingUser._id}`
                : `${API_BASE_URL}/api/admin/users`;

            const method = editingUser ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userForm)
            });

            if (res.ok) {
                setShowUserModal(false);
                setEditingUser(null);
                // Refresh Users
                fetchUsers();
            } else {
                const errorData = await res.json();
                alert(`Error saving user: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Failed to save user");
        }
    };


    const handleSaveModule = async () => {
        try {
            const url = editingModule
                ? `${API_BASE_URL}/api/admin/modules/${editingModule.id}`
                : `${API_BASE_URL}/api/admin/modules`;

            const method = editingModule ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(moduleForm)
            });

            if (res.ok) {
                setShowModuleModal(false);
                fetchModules();
                setEditingModule(null);
                resetForm();
            }
        } catch (error) {
            console.error("Error saving module:", error);
        }
    };

    const handleDeleteModule = async (id: string) => {
        if (!confirm('Are you sure you want to delete this module?')) return;
        try {
            await fetch(`${API_BASE_URL}/api/admin/modules/${id}`, { method: 'DELETE' });
            fetchModules();
        } catch (error) {
            console.error("Error deleting module:", error);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchUsers();
            } else {
                const errorData = await res.json();
                alert(`Failed to delete user: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Error deleting user");
        }
    };

    const resetForm = () => {
        setModuleForm({
            id: '',
            title: '',
            courseId: 'csv-course',
            order: 0,
            sessions: []
        });
        setActiveSectionIndex(null);
        setActiveSessionIndex(null);
    };

    const handleAddSession = () => {
        const newSession = { title: '', date: '', time: '', link: '', duration: '', isLive: false, content: '', videoUrl: '', pdfUrl: '', code: '', output: '', mcqs: [] };
        setModuleForm({ ...moduleForm, sessions: [...(moduleForm.sessions || []), newSession] });
        setActiveSessionIndex(moduleForm.sessions?.length || 0);
    };

    const handleUpdateSession = (index: number, field: string, value: any) => {
        const updatedSessions = [...(moduleForm.sessions || [])];
        updatedSessions[index] = { ...updatedSessions[index], [field]: value };
        setModuleForm({ ...moduleForm, sessions: updatedSessions });
    };

    const handleDeleteSession = (index: number) => {
        const updatedSessions = (moduleForm.sessions || []).filter((_, i) => i !== index);
        setModuleForm({ ...moduleForm, sessions: updatedSessions });
    };

    const renderDashboardTab = () => (
        <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-gray-255/10 pb-4">
                <h3 className="text-2xl font-extrabold text-[#0A2A66]">Dashboard Overview</h3>
                <p className="text-gray-500 text-sm mt-1">Key metrics and administration status at a glance.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-all duration-300">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Users</p>
                        <p className="text-3xl font-black text-gray-800 mt-1">{users.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-all duration-300">
                    <div className="p-4 bg-green-50 text-[#0FA958] rounded-xl"><BookOpen size={24} /></div>
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Modules</p>
                        <p className="text-3xl font-black text-gray-800 mt-1">{modules.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-all duration-300">
                    <div className="p-4 bg-yellow-50 text-yellow-600 rounded-xl"><Clock size={24} /></div>
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Pending Updates</p>
                        <p className="text-3xl font-black text-gray-800 mt-1">{pendingUpdates.length}</p>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <h4 className="text-lg font-bold text-[#0A2A66] mb-4">Quick Administrative Tasks</h4>
                        <div className="space-y-3">
                            <button onClick={() => setActiveTab('modules')} className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#0FA958] hover:bg-green-50/10 transition-all text-left">
                                <div>
                                    <p className="font-bold text-gray-800">Manage Course Content</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Edit, add, or restructure course modules and sessions.</p>
                                </div>
                                <BookOpen size={18} className="text-[#0FA958]" />
                            </button>
                            <button onClick={() => setActiveTab('users')} className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#0FA958] hover:bg-green-50/10 transition-all text-left">
                                <div>
                                    <p className="font-bold text-gray-800">Add or Edit Enrolled Users</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Grant student roles, monitor enrollments, and profiles.</p>
                                </div>
                                <Users size={18} className="text-[#0FA958]" />
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <h4 className="text-lg font-bold text-[#0A2A66] mb-4">Platform Info</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                                <span className="text-gray-500 font-medium">Environment</span>
                                <span className="font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-xs font-bold">Production</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                                <span className="text-gray-500 font-medium">Active Course</span>
                                <span className="font-bold text-[#0A2A66]">Computerized System Validation</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">System Status</span>
                                <span className="inline-flex items-center text-xs text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                                    Healthy
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderUserTab = () => (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h3 className="text-2xl font-extrabold text-[#0A2A66]">User Management</h3>
                    <p className="text-gray-500 text-sm mt-1">Manage enrolled students, instructors, and admin accounts.</p>
                </div>
                <button onClick={handleAddUser} className="flex items-center bg-gradient-to-r from-[#0FA958] to-[#12c467] text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-[#0FA958]/20 hover:opacity-95 transition-all"><Plus size={18} className="mr-2" /> Add New User</button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 text-gray-400 text-xs font-bold uppercase tracking-wider">
                            <th className="pb-4">Name</th>
                            <th className="pb-4">Email</th>
                            <th className="pb-4">Progress</th>
                            <th className="pb-4">Assessment</th>
                            <th className="pb-4">Role</th>
                            <th className="pb-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm text-gray-600">
                        {users.map(u => (
                            <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 font-bold text-gray-800">{u.fullName || 'N/A'}</td>
                                <td className="py-4 font-mono text-xs text-gray-500">{u.email}</td>
                                <td className="py-4">
                                    {(() => {
                                        const completed = u.completedModules?.length || 0;
                                        const total = modules.length > 0 ? modules.length : 1;
                                        const percent = Math.min(100, Math.round((completed / total) * 100));
                                        return (
                                            <div className="flex items-center space-x-2 w-28">
                                                <div className="flex-1 bg-gray-100 rounded-full h-2.5 shadow-inner">
                                                    <div className={`h-2.5 rounded-full shadow-sm transition-all duration-500 ${percent === 100 ? 'bg-[#0FA958]' : 'bg-blue-500'}`} style={{ width: `${percent}%` }}></div>
                                                </div>
                                                <span className="text-xs font-bold text-gray-600">{percent}%</span>
                                            </div>
                                        );
                                    })()}
                                </td>
                                <td className="py-4">
                                    {(() => {
                                        const assessment = u.courseAssessments?.find(a => a.courseId === 'csv-course') || u.finalAssessment;
                                        if (assessment && assessment.attempts > 0) {
                                            return (
                                                <div className="flex flex-col">
                                                    <span className={`text-xs font-bold ${assessment.passed ? 'text-green-600' : 'text-orange-500'}`}>
                                                        {assessment.passed ? 'PASSED' : 'FAILED'} ({assessment.score}%)
                                                    </span>
                                                    <span className="text-[10px] text-gray-400">Attempts: {assessment.attempts}</span>
                                                </div>
                                            );
                                        }
                                        return <span className="text-xs text-gray-400">Not taken</span>;
                                    })()}
                                </td>
                                <td className="py-4">
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                        u.role === 'instructor' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="py-4 text-right">
                                    <button onClick={() => handleEditUser(u)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors mr-2"><Edit size={16} /></button>
                                    <button onClick={() => handleDeleteUser(u._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderModuleTab = () => (
        <div className="animate-fadeIn space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200/85 pb-6">
                <div>
                    <h3 className="text-2xl font-extrabold text-[#0A2A66]">Course Content</h3>
                    <p className="text-gray-500 text-sm mt-1">Organize modules, upload learning materials, configure practical tasks, and define MCQs.</p>
                </div>
                <div className="relative w-full sm:w-64">
                    <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0FA958] focus:ring-2 focus:ring-green-500/10 text-sm bg-white" />
                    <Search className="absolute left-3.5 top-3 text-gray-400" size={18} />
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                <div className="flex items-center space-x-3">
                    <span className="font-bold text-gray-700 text-sm">Filter by Course:</span>
                    <select className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#0FA958] focus:ring-2 focus:ring-[#0FA958]/10 font-medium">
                        <option>All Courses</option>
                        <option value="csv-course">Computerized System Validation (CSV)</option>
                    </select>
                </div>
                <button onClick={() => { resetForm(); setShowModuleModal(true); }} className="flex items-center justify-center bg-gradient-to-r from-[#0FA958] to-[#12c467] text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-[#0FA958]/20 hover:opacity-95 transition-all"><Plus size={18} className="mr-2" /> Add New Module</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((m, i) => (
                    <div key={m.id || i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
                        <div className="absolute top-0 right-0 bg-gradient-to-l from-[#0FA958] to-[#12c467] text-white text-xs font-black px-3 py-1.5 rounded-bl-xl rounded-tr-xl tracking-wider uppercase">
                            {m.courseId || 'csv-course'}
                        </div>
                        <div>
                            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-[#0FA958] font-black text-lg mb-4">
                                {i + 1}
                            </div>
                            <h4 className="font-extrabold text-gray-800 text-lg mb-2 leading-tight h-14 overflow-hidden">{m.title}</h4>
                            <p className="text-sm text-gray-400 font-semibold mb-4">{m.sessions?.length || 0} Sessions</p>
                        </div>
                        <div className="flex space-x-3 pt-4 border-t border-gray-50">
                            <button onClick={() => { setEditingModule(m); setModuleForm(m); setShowModuleModal(true); }} className="flex-1 flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold py-2.5 rounded-xl transition-all duration-200 gap-1.5 text-sm"><Edit size={16} /> Edit</button>
                            <button onClick={() => handleDeleteModule(m.id)} className="flex-1 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 rounded-xl transition-all duration-200 gap-1.5 text-sm"><Trash2 size={16} /> Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderUpdatesTab = () => (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6 animate-fadeIn">
            <div>
                <h3 className="text-2xl font-extrabold text-[#0A2A66]">Pending Updates</h3>
                <p className="text-gray-500 text-sm mt-1">Review changes submitted by instructors before publishing them to students.</p>
            </div>
            {pendingUpdates.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-2xl bg-gray-50 text-gray-400 font-semibold italic">
                    No pending updates.
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingUpdates.map(u => (
                        <div key={u._id} className="border border-gray-100 p-5 rounded-2xl flex justify-between items-center bg-white shadow-sm hover:shadow-md transition-shadow">
                            <div>
                                <p className="font-bold text-gray-800 text-lg">{u.title}</p>
                                <p className="text-sm text-gray-400 mt-1 font-semibold">By: {u.instructorEmail}</p>
                            </div>
                            <div className="flex space-x-3">
                                <button onClick={() => handleApproveUpdate(u._id)} className="bg-[#0FA958] hover:bg-[#0c8746] text-white font-bold px-4 py-2 rounded-xl transition-colors shadow-sm">Approve</button>
                                <button onClick={() => handleRejectUpdate(u._id)} className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-xl transition-colors shadow-sm">Reject</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-[#eef2f7] flex">
            {/* Sidebar */}
            <div className="w-64 bg-gradient-to-b from-[#0A2A66] to-[#081F4D] text-white flex flex-col shadow-2xl z-10 h-screen sticky top-0">
                <div className="p-6 pb-4 border-b border-white/10 flex flex-col items-center">
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 w-full flex items-center justify-center mb-3 shadow-inner">
                        <img src="/Logo.jpeg" alt="Logo" className="h-10 object-contain rounded-lg" />
                    </div>
                    <h2 className="text-lg font-extrabold tracking-wider text-white">Learn With Rahuul</h2>
                    <span className="text-[10px] text-green-400 font-bold tracking-widest mt-1 bg-green-500/10 px-2.5 py-0.5 rounded-full uppercase border border-green-500/20">Admin Panel</span>
                </div>
                
                <div className="flex-1 py-6 space-y-2 px-4 overflow-y-auto">
                    <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-gradient-to-r from-[#0FA958] to-[#12c467] text-white font-bold shadow-md shadow-[#0FA958]/20 translate-x-1' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}><LayoutDashboard size={20} className="mr-3" /> Dashboard</button>
                    <button onClick={() => setActiveTab('users')} className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 ${activeTab === 'users' ? 'bg-gradient-to-r from-[#0FA958] to-[#12c467] text-white font-bold shadow-md shadow-[#0FA958]/20 translate-x-1' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}><Users size={20} className="mr-3" /> User Management</button>
                    <button onClick={() => setActiveTab('modules')} className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 ${activeTab === 'modules' ? 'bg-gradient-to-r from-[#0FA958] to-[#12c467] text-white font-bold shadow-md shadow-[#0FA958]/20 translate-x-1' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}><BookOpen size={20} className="mr-3" /> Course Content</button>
                    <button onClick={() => setActiveTab('updates')} className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 ${activeTab === 'updates' ? 'bg-gradient-to-r from-[#0FA958] to-[#12c467] text-white font-bold shadow-md shadow-[#0FA958]/20 translate-x-1' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}><Clock size={20} className="mr-3" /> Review Updates</button>
                </div>
                
                <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-md">
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0FA958] to-[#12c467] flex items-center justify-center font-extrabold text-white shadow-md shadow-[#0FA958]/30">A</div>
                        <div className="ml-3">
                            <p className="text-sm font-bold tracking-wide">Administrator</p>
                            <p className="text-xs text-gray-400">admin@lwr.com</p>
                        </div>
                    </div>
                    <button onClick={() => onLogout?.()} className="w-full flex items-center justify-center py-2.5 rounded-xl border border-red-500/30 text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"><LogOut size={16} className="mr-2" /> Logout</button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-6">
                    {activeTab === 'dashboard' && renderDashboardTab()}
                    {activeTab === 'users' && renderUserTab()}
                    {activeTab === 'modules' && renderModuleTab()}
                    {activeTab === 'updates' && renderUpdatesTab()}
                </div>
            </div>

            {showModuleModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-[#0A2A66]">{editingModule ? 'Edit Module' : 'Create New Module'}</h2>
                            <button onClick={() => setShowModuleModal(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
                        </div>
                        <div className="flex flex-1 overflow-hidden">
                            {/* Left Panel: Module Info */}
                            <div className="w-1/3 p-6 border-r border-gray-200 overflow-y-auto bg-gray-50 space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Module Title</label>
                                    <input type="text" value={moduleForm.title} onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#0FA958]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Course ID</label>
                                    <select value={moduleForm.courseId} onChange={(e) => setModuleForm({ ...moduleForm, courseId: e.target.value })} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#0FA958]">
                                        <option value="csv-course">Computerized System Validation</option>
                                        <option value="python-ai-course">Python for AI & Life Sciences</option>
                                        <option value="lifesciences-ai-course">AI in Life Sciences & Healthcare</option>
                                        <option value="pharma-gen-ai-course">Generative AI in Pharma</option>
                                        <option value="neural-networks-course">Neural Networks & Deep Learning</option>
                                        <option value="ai-risk-course">AI Safety & Risk Management</option>
                                        <option value="med-writing-course">Basics of Medical Writing</option>
                                        <option value="csv-course">Computerized System Validation (CSV)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Order</label>
                                    <input type="number" value={moduleForm.order} onChange={(e) => setModuleForm({ ...moduleForm, order: parseInt(e.target.value) || 0 })} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#0FA958]" />
                                </div>
                            </div>

                            {/* Right Panel: Sessions Editor */}
                            <div className="w-2/3 p-6 overflow-y-auto bg-white">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-800">Module Sessions</h3>
                                    <button onClick={handleAddSession} className="flex items-center text-sm bg-[#0FA958] text-white px-4 py-2 rounded hover:bg-[#0c8746] shadow-md font-bold">
                                        <Plus size={16} className="mr-1" /> Add New Session
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {(moduleForm.sessions || []).map((session, index) => (
                                        <div key={index} className={`border rounded-lg p-4 transition-all ${activeSessionIndex === index ? 'border-[#0FA958] shadow-md bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <div className="flex justify-between items-center cursor-pointer" onClick={() => setActiveSessionIndex(activeSessionIndex === index ? null : index)}>
                                                <h4 className="font-bold text-gray-800 text-lg">{session.title || `Session ${index + 1}`}</h4>
                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteSession(index); }} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={20} /></button>
                                            </div>
                                            
                                            {activeSessionIndex === index && (
                                                <div className="mt-6 space-y-8 animate-fadeIn border-t pt-4">
                                                    {/* Session Details */}
                                                    <div>
                                                        <h5 className="font-bold text-gray-700 mb-3 border-b pb-1 text-sm uppercase tracking-wider">Session Details</h5>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div><label className="block text-sm font-bold text-gray-700 mb-1">Title</label><input type="text" value={session.title} onChange={(e) => handleUpdateSession(index, 'title', e.target.value)} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#0FA958]" /></div>
                                                            <div><label className="block text-sm font-bold text-gray-700 mb-1">Live Meeting Link</label><input type="text" value={session.link || ''} onChange={(e) => handleUpdateSession(index, 'link', e.target.value)} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#0FA958]" placeholder="https://..." /></div>
                                                            <div><label className="block text-sm font-bold text-gray-700 mb-1">Date</label><input type="date" value={session.date || ''} onChange={(e) => handleUpdateSession(index, 'date', e.target.value)} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#0FA958]" /></div>
                                                            <div><label className="block text-sm font-bold text-gray-700 mb-1">Time</label><input type="time" value={session.time || ''} onChange={(e) => handleUpdateSession(index, 'time', e.target.value)} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#0FA958]" /></div>
                                                        </div>
                                                    </div>

                                                    {/* Media Uploads */}
                                                    <div>
                                                        <h5 className="font-bold text-gray-700 mb-3 border-b pb-1 text-sm uppercase tracking-wider">Learning Materials</h5>
                                                        <div className="space-y-4">
                                                            <div><label className="block text-sm font-bold text-gray-700 mb-1">Video URL (e.g., YouTube/Vimeo/MP4)</label><input type="text" value={session.videoUrl || ''} onChange={(e) => handleUpdateSession(index, 'videoUrl', e.target.value)} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#0FA958]" placeholder="https://..." /></div>
                                                            <div><label className="block text-sm font-bold text-gray-700 mb-1">File/PDF URL</label><input type="text" value={session.pdfUrl || ''} onChange={(e) => handleUpdateSession(index, 'pdfUrl', e.target.value)} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#0FA958]" placeholder="https://..." /></div>
                                                            <div><label className="block text-sm font-bold text-gray-700 mb-1">Markdown Content</label><textarea value={session.content || ''} onChange={(e) => handleUpdateSession(index, 'content', e.target.value)} className="w-full p-2 border rounded h-32 focus:outline-none focus:ring-2 focus:ring-[#0FA958] font-mono text-sm" placeholder="Add reading materials here..." /></div>
                                                        </div>
                                                    </div>

                                                    {/* Practical Code Session */}
                                                    <div>
                                                        <h5 className="font-bold text-gray-700 mb-3 border-b pb-1 text-sm uppercase tracking-wider">Practical Challenge</h5>
                                                        <div className="space-y-4">
                                                            <div><label className="block text-sm font-bold text-gray-700 mb-1">Initial Code</label><textarea value={session.code || ''} onChange={(e) => handleUpdateSession(index, 'code', e.target.value)} className="w-full p-3 border rounded bg-gray-900 text-gray-100 font-mono h-32 focus:outline-none focus:ring-2 focus:ring-[#0FA958]" placeholder="def solve():..." /></div>
                                                            <div><label className="block text-sm font-bold text-gray-700 mb-1">Expected Output</label><textarea value={session.output || ''} onChange={(e) => handleUpdateSession(index, 'output', e.target.value)} className="w-full p-3 border rounded bg-black text-green-400 font-mono h-20 focus:outline-none focus:ring-2 focus:ring-[#0FA958]" placeholder="> Output..." /></div>
                                                        </div>
                                                    </div>

                                                    {/* MCQs for this Session */}
                                                    <div>
                                                        <div className="flex justify-between items-center mb-3 border-b pb-1">
                                                            <h5 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Session MCQs</h5>
                                                            <button onClick={(e) => {
                                                                e.stopPropagation();
                                                                const newMcqs = [...(session.mcqs || []), { question: '', options: ['', '', '', ''], correctAnswer: 0 }];
                                                                handleUpdateSession(index, 'mcqs', newMcqs);
                                                            }} className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center">
                                                                <Plus size={12} className="mr-1" /> Add MCQ
                                                            </button>
                                                        </div>
                                                        
                                                        <div className="space-y-4">
                                                            {(session.mcqs || []).map((mcq, mcqIdx) => (
                                                                <div key={mcqIdx} className="bg-white border rounded p-4 relative shadow-sm">
                                                                    <button onClick={() => {
                                                                        const updatedMcqs = [...session.mcqs!];
                                                                        updatedMcqs.splice(mcqIdx, 1);
                                                                        handleUpdateSession(index, 'mcqs', updatedMcqs);
                                                                    }} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                                                                    <div className="mb-3 pr-6">
                                                                        <label className="block text-xs font-bold text-gray-700 mb-1">Question {mcqIdx + 1}</label>
                                                                        <input type="text" value={mcq.question} onChange={(e) => {
                                                                            const updatedMcqs = [...session.mcqs!];
                                                                            updatedMcqs[mcqIdx] = { ...mcq, question: e.target.value };
                                                                            handleUpdateSession(index, 'mcqs', updatedMcqs);
                                                                        }} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#0FA958] text-sm" />
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        {mcq.options.map((opt, oIdx) => (
                                                                            <div key={oIdx} className="flex items-center space-x-2">
                                                                                <input type="radio" name={`correct-${index}-${mcqIdx}`} checked={mcq.correctAnswer === oIdx} onChange={() => {
                                                                                    const updatedMcqs = [...session.mcqs!];
                                                                                    updatedMcqs[mcqIdx] = { ...mcq, correctAnswer: oIdx };
                                                                                    handleUpdateSession(index, 'mcqs', updatedMcqs);
                                                                                }} className="form-radio text-[#0FA958]" />
                                                                                <input type="text" value={opt} onChange={(e) => {
                                                                                    const updatedMcqs = [...session.mcqs!];
                                                                                    const newOpts = [...mcq.options];
                                                                                    newOpts[oIdx] = e.target.value;
                                                                                    updatedMcqs[mcqIdx] = { ...mcq, options: newOpts };
                                                                                    handleUpdateSession(index, 'mcqs', updatedMcqs);
                                                                                }} className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#0FA958] text-sm ${mcq.correctAnswer === oIdx ? 'bg-green-50 border-green-300' : ''}`} placeholder={`Option ${oIdx + 1}`} />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {(!session.mcqs || session.mcqs.length === 0) && <p className="text-sm text-gray-400 italic">No MCQs added for this session.</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {(!moduleForm.sessions || moduleForm.sessions.length === 0) && (
                                        <div className="text-center text-gray-400 py-12 border-2 border-dashed rounded-lg bg-gray-50">
                                            <p className="mb-2">This module has no sessions yet.</p>
                                            <button onClick={handleAddSession} className="text-[#0FA958] font-bold hover:underline">Create the first session</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
                            <button onClick={() => setShowModuleModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors font-medium">Cancel</button>
                            <button onClick={handleSaveModule} className="px-6 py-2 bg-[#0FA958] text-white rounded-lg hover:bg-[#0c8746] shadow-md font-bold">{editingModule ? 'Save Changes' : 'Create Module'}</button>
                        </div>
                    </div>
                </div>
            )}

                        {showUserModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md animate-fadeIn">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">{editingUser ? 'Edit User' : 'Add New User'}</h2>
                            <button onClick={() => setShowUserModal(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
                        </div>
                        <div className="space-y-4">
                            <div><label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label><input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0FA958]" disabled={!!editingUser} /></div>
                            <div><label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label><input type="text" value={userForm.fullName} onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0FA958]" /></div>
                            <div><label className="block text-sm font-bold text-gray-700 mb-2">Role</label><select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0FA958]"><option value="user">User</option><option value="admin">Admin</option></select></div>
                        </div>
                        <div className="flex justify-end mt-6 space-x-3">
                            <button onClick={() => setShowUserModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button onClick={handleSaveUser} className="px-6 py-2 bg-[#0FA958] text-white rounded-lg">{editingUser ? 'Save Changes' : 'Create User'}</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminDashboard;
