import React from 'react';
import { Settings, CheckCircle, Circle, Lock, Award } from 'lucide-react';
import { translations } from '../translations';

interface Lesson {
    id: string;
    title: string;
    completed: boolean;
    locked?: boolean;
}

interface SidebarProps {
    progress: number;
    lessons: Lesson[];
    currentLessonId: string;
    onSelectLesson: (id: string) => void;
    onSettingsClick: () => void;
    language: string;
    isAdmin?: boolean;
    onAdminClick?: () => void;
    onCertificateClick?: () => void;
    courses?: { id: string; name: string }[];
    activeCourseId?: string;
    onCourseSelect?: (id: string) => void;
    assessmentPassed?: boolean;
    currentScore?: number;
    onHomeClick?: () => void;
    view?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
    progress,
    lessons,
    currentLessonId,
    onSelectLesson,
    onSettingsClick,
    language,
    isAdmin,
    onAdminClick,
    onCertificateClick,
    courses = [],
    activeCourseId,
    onCourseSelect,
    assessmentPassed,
    currentScore,
    onHomeClick,
    view
}) => {
    const t = translations[language as keyof typeof translations] || translations.ENGLISH;

    return (
        <div className="w-64 bg-white h-full flex flex-col z-10">
            <div className="p-4 border-b border-gray-200 bg-[#0A2A66] text-white">
                <div className="flex items-center space-x-2 mb-4 bg-white p-2 rounded-lg justify-center shadow-inner">
                    <img src="/logo2.png" alt="Learn With Rahuul" className="h-10 object-contain" />

                </div>

                {/* Course Switcher */}
                {courses.length > 1 && onCourseSelect && (
                    <div className="mb-4">
                        <label className="text-xs text-[#D4AF37] uppercase tracking-wider font-bold mb-1 block">Current Course</label>
                        <select
                            value={activeCourseId}
                            onChange={(e) => onCourseSelect(e.target.value)}
                            className="w-full bg-white/10 text-white text-sm rounded border border-white/20 p-2 focus:outline-none focus:ring-1 focus:ring-[#0FA958]"
                        >
                            {courses.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Cover Image only if single course or simplified view */}
                {courses.length <= 1 && (
                    <div className="relative h-32 bg-cover bg-center rounded-lg overflow-hidden mb-2" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80")' }}>
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end p-2">
                            <div>
                                <div className="text-sm font-bold">AI For All</div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                        <span>{Math.min(100, Math.round(progress))}% {t.completed}</span>
                    </div>
                    <div className="w-full bg-white/20 h-2 rounded-full">
                        <div className="bg-[#0FA958] h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, progress)}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <div className="px-4 mb-2 space-y-2">
                    {onHomeClick && (
                        <div
                            onClick={onHomeClick}
                            className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${view === 'home' ? 'bg-[#0FA958] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                            <span className="font-medium">Dashboard Home</span>
                        </div>
                    )}
                    <div className="flex items-center space-x-2 p-2 bg-[#eef2f7] text-[#0A2A66] rounded-lg cursor-pointer">
                        <div className="border-2 border-[#0A2A66] rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">100</div>
                        <span className="font-medium">{t.accessibility}</span>
                    </div>
                </div>

                <div className="px-4 mt-6">
                    <h2 className="font-bold text-gray-700 mb-4 uppercase text-xs tracking-wider">{t.lesson}</h2>
                    <ul className="space-y-4">
                        {lessons.map((lesson, index) => (
                            <li
                                key={lesson.id || `lesson-${index}`}
                                onClick={() => !lesson.locked && onSelectLesson(lesson.id)}
                                className={`flex items-center space-x-3 p-2 rounded transition-colors ${lesson.locked
                                    ? 'opacity-50 cursor-not-allowed bg-gray-50'
                                    : 'cursor-pointer hover:bg-gray-50'
                                    } ${currentLessonId === lesson.id ? 'bg-[#eef2f7]' : ''}`}
                            >
                                {lesson.locked ? (
                                    <Lock size={24} className="text-gray-400" />
                                ) : lesson.completed ? (
                                    <CheckCircle size={24} className="text-[#0FA958]" />
                                ) : (
                                    <Circle size={24} className="text-gray-400" />
                                )}
                                <span className={`text-sm font-medium ${currentLessonId === lesson.id ? 'text-[#0A2A66]' : 'text-gray-600'}`}>{lesson.title}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="p-4 border-t border-gray-200">
                {Math.round(progress) >= 100 && (
                    <button
                        onClick={onCertificateClick}
                        className={`flex items-center justify-center space-x-2 w-full p-2.5 rounded transition-all mb-3 font-semibold shadow-sm ${assessmentPassed
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 hover:shadow-md'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200 hover:shadow-md animate-pulse'
                            }`}
                    >
                        <Award size={20} />
                        <span>
                            {assessmentPassed
                                ? t.certificate
                                : (currentScore !== undefined ? `Retake Assessment (${currentScore}%)` : 'Take Final Assessment')
                            }
                        </span>
                    </button>
                )}

                <button
                    onClick={onSettingsClick}
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 w-full p-2 rounded hover:bg-gray-50 transition-colors"
                >
                    <Settings size={20} />
                    <span className="font-medium">{t.settings}</span>
                </button>
                {isAdmin && (
                    <button
                        type="button"
                        onClick={onAdminClick}
                        className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 w-full p-2 rounded hover:bg-purple-50 transition-colors mt-2"
                    >
                        <Settings size={20} />
                        <span className="font-medium">Admin Panel</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
