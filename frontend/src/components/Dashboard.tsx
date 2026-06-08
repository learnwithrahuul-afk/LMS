import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { API_BASE_URL } from '../config';
import ReactMarkdown from 'react-markdown';
import Sidebar from './Sidebar';
import Header from './Header';
// import Certificate from './Certificate'; // Lazy loaded now
const Certificate = lazy(() => import('./Certificate'));
import Login from './Login';
import Chatbot from './Chatbot';
import { ArrowRight, CheckCircle, Play, MessageCircle, FileText, Video, Target, Award, Monitor, Clock } from 'lucide-react';
import CourseOverview from './CourseOverview';
import AdminDashboard from './AdminDashboard';
import { translations } from '../translations';

const courseNames: Record<string, string> = {
    'csv-course': 'Computerized System Validation'
};

const getAvailableSteps = (session: any) => {
    const steps: string[] = [];
    if (!session) return steps;
    if (session.pdfUrl) steps.push('document');
    if (session.videoUrl) steps.push('video');
    if (session.image || (session.content && session.content.trim())) steps.push('theory');
    // if (session.code) steps.push('code'); // Disabled terminal for CSV course
    if (session.mcqs && session.mcqs.length > 0) steps.push('mcq');
    return steps;
};

const Dashboard = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isWindowBlurred, setIsWindowBlurred] = useState(false);
    const [progress, setProgress] = useState(0);
    const [user, setUser] = useState<{ email: string; fullName?: string; completedModules?: string[]; state?: string; language?: string; dob?: string; gender?: string; role?: string; isPaid?: boolean; enrolledCourses?: string[]; finalAssessment?: { score: number; passed: boolean; attempts: number; }; courseAssessments?: { courseId: string; score: number; passed: boolean; attempts: number; }[] } | null>(null);
    const [currentModule, setCurrentModule] = useState<any>(null);
    const [modules, setModules] = useState<any[]>([]);
    const [showOutput, setShowOutput] = useState(false);
    const [mcqAnswers, setMcqAnswers] = useState<{ [key: number]: number }>({});

    // New state for step-by-step learning
    const [currentStep, setCurrentStep] = useState<string>('theory');
    const [currentSessionIndex, setcurrentSessionIndex] = useState(0);
    const [code, setCode] = useState('');
    const currentSession = currentModule?.sessions?.[currentSessionIndex];
    const steps = useMemo(() => getAvailableSteps(currentSession), [currentSession]);

    // Profile Modal State
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [fullName, setFullName] = useState('');

    // View State
    const [view, setView] = useState<'home' | 'course' | 'settings' | 'admin' | 'certificate' | 'instructor' | 'assessment'>('home');

    // Assessment State
    const [assessmentQuestions, setAssessmentQuestions] = useState<any[]>([]);
    const [assessmentAnswers, setAssessmentAnswers] = useState<Record<number, string>>({});
    const [assessmentResult, setAssessmentResult] = useState<{ score: number; passed: boolean; feedback: string } | null>(null);
    const [isAssessmentLoading, setIsAssessmentLoading] = useState(false);

    // Settings Form State
    const [settingsName, setSettingsName] = useState('');
    const [settingsState, setSettingsState] = useState('');
    const [settingsLanguage, setSettingsLanguage] = useState('ENGLISH');
    const [settingsDob, setSettingsDob] = useState('');
    const [settingsGender, setSettingsGender] = useState('Male');

    // Video and PDF State
    const [videoCompleted, setVideoCompleted] = useState(false);
    const [pdfCompleted, setPdfCompleted] = useState(false);

    const [executionOutput, setExecutionOutput] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);

    // Certificate State
    const [viewCertificateId, setViewCertificateId] = useState<string | null>(null);

    // Multi-Course State
    const [activeCourseId, setActiveCourseId] = useState<string>('csv-course');
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [outputImage, setOutputImage] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser && parsedUser.email) {
                    // Verify session with backend to get latest data
                    fetchUserFromBackend(parsedUser.email);
                } else {
                    // Invalid data in local storage
                    handleLogout();
                }
            } catch (e) {
                // JSON parse error
                handleLogout();
            }
        }
    }, []);

    const fetchUserFromBackend = async (email: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/${email}`);
            if (res.ok) {
                const data = await res.json();
                // Check payment status again just in case
                if (data.isPaid) {
                    setUser(data);
                    setProgress(data.progress);
                    localStorage.setItem('user', JSON.stringify(data)); // Update local storage with fresh data
                    if (data.role === 'admin') {
                        setView('admin');
                    } else if (data.role === 'instructor') {
                        setView('instructor');
                    }
                } else {
                    handleLogout(); // Force logout if not paid
                    alert("Payment not completed. Please contact support.");
                }
            } else {
                // If user not found in DB, clear local storage
                handleLogout();
            }
        } catch (err) {
            console.error("Error fetching user data:", err);
        }
    };

    useEffect(() => {
        setVideoCompleted(false);
        setPdfCompleted(false);
    }, [currentSessionIndex, currentModule]);

    const handleVideoEnded = () => {
        setVideoCompleted(true);
    };

    // Get current translations
    const t = translations[settingsLanguage as keyof typeof translations] || translations.ENGLISH;

    // Course Mapping moved outside component or memoized (hoisted since static)
    // const courseNames ... (removed from here, will be defined outside)

    // Sync active course with user enrollment
    useEffect(() => {
        if (!user) return;

        // Filter valid courses only
        const validCourses = Object.keys(courseNames);
        const enrolled = (user.enrolledCourses || []).filter(c => validCourses.includes(c));

        // If user has enrolled courses
        if (enrolled.length > 0) {
            // If current active course is NOT in enrolled list, switch to first enrolled
            if (!enrolled.includes(activeCourseId)) {
                setActiveCourseId(enrolled[0]);
            }
        }
        // Fallback for legacy paid users (assume Python course)
        else if (user.isPaid) {
            if (activeCourseId !== 'csv-course') {
                setActiveCourseId('csv-course');
            }
        }
    }, [user, activeCourseId]);

    const fetchModules = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/courses?lang=${settingsLanguage}&email=${user.email}`);
            const data = await res.json();
            setModules(data);
            if (currentModule) {
                const updatedModule = data.find((m: any) => m.id === currentModule.id);
                if (updatedModule) setCurrentModule(updatedModule);
                else if (data.length > 0) setCurrentModule(data[0]);
            } else if (data.length > 0) {
                setCurrentModule(data[0]);
            }
        } catch (error) {
            console.error("Error fetching modules:", error);
        }
    };

    useEffect(() => {
        if (user?.email) {
            fetchModules();
        }
    }, [settingsLanguage, view, user]);

    // Safety Check: Ensure Active Course matches loaded modules
    useEffect(() => {
        if (modules.length > 0) {
            // Check if current active course has any modules in the loaded list
            const currentCourseModules = modules.filter(m => (m.courseId || 'csv-course') === activeCourseId);

            // If current course has no modules, but we have OTHER modules loaded, switch to them
            if (currentCourseModules.length === 0) {
                const availableCourseId = modules[0].courseId || 'csv-course';
                console.warn(`Active course ${activeCourseId} has no modules. Switching to ${availableCourseId}`);
                setActiveCourseId(availableCourseId);
            }
        }
    }, [modules, activeCourseId]);

    useEffect(() => {
        if (currentModule) {
            const sessions = currentModule.sessions || [];
            const firstSession = sessions[0];
            setCode(firstSession?.code || '');
            const firstSteps = getAvailableSteps(firstSession);
            if (firstSteps.length > 0) {
                setCurrentStep(firstSteps[0]);
            } else {
                setCurrentStep('theory');
            }
            setcurrentSessionIndex(0);
            setShowOutput(false);
            setMcqAnswers({});
            setExecutionOutput('');
            setVideoCompleted(false);
            setPdfCompleted(false);
        }
    }, [currentModule]);

    useEffect(() => {
        if (user) {
            setFullName(user.fullName || '');
            setSettingsName(user.fullName || '');
            setSettingsState(user.state || '');
            if (user.language) setSettingsLanguage(user.language);
            setSettingsDob(user.dob || '');
            setSettingsGender(user.gender || 'Male');

            // Set current module based on progress
            if (modules.length > 0) {
                const completedIds = user.completedModules || [];
                if (completedIds.length > 0) {
                    const lastCompletedId = completedIds[completedIds.length - 1];
                    const lastIndex = modules.findIndex(m => m.id === lastCompletedId);
                    if (lastIndex !== -1 && lastIndex < modules.length - 1) {
                        setCurrentModule(modules[lastIndex + 1]);
                    } else if (lastIndex !== -1) {
                        setCurrentModule(modules[lastIndex]);
                    } else {
                        setCurrentModule(modules[0]);
                    }
                } else {
                    setCurrentModule(modules[0]);
                }
            }
        }
    }, [user, modules]);

    // Content Protection
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        const triggerTemporaryBlackout = () => {
            setIsWindowBlurred(true);
            setTimeout(() => {
                setIsWindowBlurred(false);
            }, 1000);
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Check for Print Screen key
            if (e.key === 'PrintScreen') {
                triggerTemporaryBlackout();
                navigator.clipboard.writeText(''); // Clear clipboard
                e.preventDefault();
            }

            // Check for Snipping Tool / OS Screenshot shortcuts:
            // Windows: Win+Shift+S (Meta+Shift+S)
            // Mac: Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5
            const isCmdOrMeta = e.metaKey || e.ctrlKey;
            const isScreenshotKey = ['s', '3', '4', '5'].includes(e.key.toLowerCase());
            if (isCmdOrMeta && e.shiftKey && isScreenshotKey) {
                triggerTemporaryBlackout();
            }

            // Prevent Ctrl+C, Ctrl+X, Ctrl+S, Ctrl+U, Ctrl+P
            if ((e.ctrlKey || e.metaKey) && ['c', 'x', 's', 'u', 'p'].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
        };

        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault();
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsWindowBlurred(true);
            } else {
                setIsWindowBlurred(false);
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('cut', handleCopy);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('cut', handleCopy);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);



    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleLogin = async (email: string) => {
        setIsLoggingIn(true);
        console.log("Starting login process for:", email);
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await res.text();
                console.error("Non-JSON response received:", text);
                alert("Server returned an invalid response. Please try again later.");
                setIsLoggingIn(false);
                return;
            }

            const data = await res.json();
            console.log("Login response:", data);

            if (res.ok) {
                setUser(data);
                setProgress(data.progress || 0);
                localStorage.setItem('user', JSON.stringify(data)); // Persist session
                if (data.role === 'admin') {
                    setView('admin');
                } else if (data.role === 'instructor') {
                    setView('instructor');
                } else {
                    setView('home');
                }
            } else {
                // Show error from backend (e.g., "User not found" or "Payment not completed")
                console.warn("Login failed with status:", res.status, data);
                alert(data.message || "Login failed");
                setUser(null);
            }
        } catch (err) {
            console.error("Backend error during login:", err);
            alert("An error occurred during login. Please check your internet connection.");
            setUser(null);
        } finally {
            setIsLoggingIn(false);
        }
    };

    const startAssessment = async () => {
        setIsAssessmentLoading(true);
        setView('assessment');
        setAssessmentResult(null);
        setAssessmentAnswers({});

        try {
            const res = await fetch(`${API_BASE_URL}/api/assessment/generate?courseId=${activeCourseId}`);
            if (res.ok) {
                const data = await res.json();
                setAssessmentQuestions(data);
            } else {
                console.error("Failed to fetch assessment");
            }
        } catch (error) {
            console.error("Error starting assessment", error);
        } finally {
            setIsAssessmentLoading(false);
        }
    };

    const submitAssessment = async () => {
        setIsAssessmentLoading(true);

        // Transform answers format
        const formattedAnswers = Object.entries(assessmentAnswers).map(([qId, answer]) => ({
            questionId: parseInt(qId),
            selectedOption: answer
        }));

        try {
            const res = await fetch(`${API_BASE_URL}/api/assessment/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user?.email,
                    questions: assessmentQuestions,
                    answers: formattedAnswers,
                    courseId: activeCourseId
                })
            });

            if (res.ok) {
                const result = await res.json();
                setAssessmentResult(result);
                // Refresh user data to update sidebar status
                if (user?.email) fetchUserFromBackend(user.email);
            }
        } catch (error) {
            console.error("Error submitting assessment", error);
        } finally {
            setIsAssessmentLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user'); // Clear from local storage
        setUser(null);
        setProgress(0);
        setCurrentModule(null);
        setView('home');
    };

    const handleUpdateProfile = async () => {
        if (!user) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, fullName }),
            });
            if (res.ok) {
                const updatedUser = await res.json();
                setUser(updatedUser);
                setShowProfileModal(false);
            }
        } catch (err) {
            console.error("Error updating profile:", err);
        }
    };

    const handleSettingsUpdate = async () => {
        if (!user) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    fullName: settingsName,
                    state: settingsState,
                    language: settingsLanguage,
                    dob: settingsDob,
                    gender: settingsGender
                }),
            });
            if (res.ok) {
                const updatedUser = await res.json();
                setUser(updatedUser);
                alert("Settings updated successfully!");
            }
        } catch (err) {
            console.error("Error updating settings:", err);
        }
    };

    const markModuleComplete = async () => {
        console.log("Marking module complete:", currentModule?.id, "for user:", user?.email);
        if (!user || !currentModule) {
            console.error("User or Module missing");
            return;
        }

        // Calculate score
        let score = 0;
        let totalQuestions = 0;
        if (currentModule.sessions[currentSessionIndex].mcqs && currentModule.sessions[currentSessionIndex].mcqs.length > 0) {
            totalQuestions = currentModule.sessions[currentSessionIndex].mcqs.length;
            currentModule.sessions[currentSessionIndex].mcqs.forEach((mcq: any, index: number) => {
                if (mcqAnswers[index] === mcq.correctAnswer) {
                    score++;
                }
            });
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/users/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    moduleId: currentModule.id,
                    score,
                    totalQuestions
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                setProgress(data.progress);

                const currentIndex = modules.findIndex(m => m.id === currentModule.id);
                if (currentIndex < modules.length - 1) {
                    setCurrentModule(modules[currentIndex + 1]);
                    setcurrentSessionIndex(0);
                    setShowOutput(false);
                    setMcqAnswers({});
                    window.scrollTo(0, 0);
                }
            }
        } catch (err) {
            console.error("Backend error:", err);
        }
    };

    const runCode = async () => {
        setIsExecuting(true);
        setShowOutput(true);
        setExecutionOutput("Running...");
        setOutputImage(null);

        try {
            const res = await fetch(`${API_BASE_URL}/api/code/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language: 'python', image: uploadedImage }),
            });
            const data = await res.json();
            setExecutionOutput(data.output);
            if (data.image) {
                setOutputImage(data.image);
            }
        } catch (err) {
            console.error("Execution error:", err);
            setExecutionOutput("Error connecting to server.");
        } finally {
            setIsExecuting(false);
        }
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNextSession = () => {
        if (!currentModule || !currentModule.sessions) return;
        const currentSession = currentModule.sessions[currentSessionIndex];
        const sessionSteps = getAvailableSteps(currentSession);
        const currentIndexInSession = sessionSteps.indexOf(currentStep);

        if (currentIndexInSession !== -1 && currentIndexInSession < sessionSteps.length - 1) {
            // Go to next step in the same session
            setCurrentStep(sessionSteps[currentIndexInSession + 1]);
            window.scrollTo(0, 0);
        } else {
            // No more steps in this session. Advance to next session!
            advanceToNextSession();
        }
    };

    const advanceToNextSession = () => {
        if (currentSessionIndex === currentModule.sessions.length - 1) {
            markModuleComplete();
        } else {
            const nextSessionIdx = currentSessionIndex + 1;
            const nextSession = currentModule.sessions[nextSessionIdx];
            setcurrentSessionIndex(nextSessionIdx);
            setCode(nextSession?.code || '');
            const nextSteps = getAvailableSteps(nextSession);
            if (nextSteps.length > 0) {
                setCurrentStep(nextSteps[0]);
            } else {
                setCurrentStep('theory');
            }
            setVideoCompleted(false);
            setPdfCompleted(false);
            setMcqAnswers({});
            setExecutionOutput('');
            setShowOutput(false);
            window.scrollTo(0, 0);
        }
    };

    const handlePrevSession = () => {
        if (!currentModule || !currentModule.sessions) return;
        const currentSession = currentModule.sessions[currentSessionIndex];
        const sessionSteps = getAvailableSteps(currentSession);
        const currentIndexInSession = sessionSteps.indexOf(currentStep);

        if (currentIndexInSession > 0) {
            // Go to previous step in same session
            setCurrentStep(sessionSteps[currentIndexInSession - 1]);
            window.scrollTo(0, 0);
        } else if (currentSessionIndex > 0) {
            // Go to previous session
            const prevSessionIdx = currentSessionIndex - 1;
            const prevSession = currentModule.sessions[prevSessionIdx];
            setcurrentSessionIndex(prevSessionIdx);
            setCode(prevSession?.code || '');
            const prevSteps = getAvailableSteps(prevSession);
            if (prevSteps.length > 0) {
                setCurrentStep(prevSteps[prevSteps.length - 1]);
            } else {
                setCurrentStep('theory');
            }
            setVideoCompleted(false);
            setPdfCompleted(false);
            setMcqAnswers({});
            setExecutionOutput('');
            setShowOutput(false);
            window.scrollTo(0, 0);
        }
    };

    const handleCodeComplete = () => {
        handleNextSession();
    };

    // Calculate Progress for CURRENT Active Course
    const courseProgress = useMemo(() => {
        if (!modules || modules.length === 0 || !user) return 0;
        const currentCourseModules = modules.filter(m => (m.courseId || 'csv-course') === activeCourseId);
        if (currentCourseModules.length === 0) return 0;
        const completedCount = currentCourseModules.filter(m => user.completedModules?.includes(m.id)).length;
        return (completedCount / currentCourseModules.length) * 100;
    }, [user, modules, activeCourseId]);

    // Calculate Completed Courses for Certificate
    const completedCourses = useMemo(() => {
        if (!user || !user.completedModules || modules.length === 0) return [];

        const modulesByCourse: Record<string, string[]> = {};
        modules.forEach(m => {
            const cid = m.courseId || 'csv-course';
            if (!modulesByCourse[cid]) modulesByCourse[cid] = [];
            modulesByCourse[cid].push(m.id);
        });

        const completed: { id: string, name: string }[] = [];
        for (const [cid, modIds] of Object.entries(modulesByCourse)) {
            const isCompleted = modIds.length > 0 && modIds.every(id => user.completedModules!.includes(id));
            if (isCompleted) {
                completed.push({ id: cid, name: courseNames[cid] || cid.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') });
            }
        }
        return completed;
    }, [user, modules]);

    // Reset Certificate Tab when changing course
    useEffect(() => {
        setViewCertificateId(null);
    }, [activeCourseId]);

    if (!user) {
        return <Login onLogin={handleLogin} isLoading={isLoggingIn} />;
    }

    if (view === 'admin') {
        return <AdminDashboard onLogout={handleLogout} />;
    }

    


    return (
        <div className="flex flex-col bg-[#eef2f7] min-h-screen font-sans select-none relative" onContextMenu={(e) => e.preventDefault()}>

            {/* Watermark Overlay */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.03] flex flex-wrap content-start justify-center select-none" style={{ transform: 'rotate(-45deg) scale(1.5)' }}>
                {Array.from({ length: 100 }).map((_, i) => (
                    <div key={i} className="p-8 text-xl font-bold text-black whitespace-nowrap pointer-events-none">
                        {user?.email} - {user?.fullName}
                    </div>
                ))}
            </div>

            {/* Blur Overlay on Focus Loss */}
            {/* Print Protection Style */}
            <style>
                {`
                    @media print {
                        body {
                            display: none !important;
                        }
                    }
                `}
            </style>

            {/* Black Overlay on Focus Loss */}
            {isWindowBlurred && (
                <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center">
                    <div className="text-center p-8">
                        <h2 className="text-2xl font-bold text-white mb-2">Content Protected</h2>
                        <p className="text-gray-400">Please click here to resume viewing.</p>
                    </div>
                </div>
            )}

            {/* Mobile Header Toggle Removed - Moved to Header */}

            <Header
                user={user}
                onLogout={handleLogout}
                onUpdateProfile={() => setShowProfileModal(true)}
                language={settingsLanguage}
                onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />

            <div className="flex flex-col md:flex-row flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-8 gap-6">
                <div className={`fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:translate-x-0 transition duration-200 ease-in-out z-50 md:block md:w-72 flex-shrink-0`}>
                    <div className="md:sticky md:top-28 h-full md:h-[calc(100vh-9rem)] rounded-2xl overflow-hidden shadow-xl border border-white/20">
                        <Sidebar
                            progress={courseProgress}
                            lessons={modules
                                .filter(m => (m.courseId || 'csv-course') === activeCourseId)
                                .map((m, index, arr) => ({
                                    id: m.id,
                                    title: m.title,
                                    completed: user.completedModules?.includes(m.id) || false,
                                    locked: index > 0 && !user.completedModules?.includes(arr[index - 1].id)
                                }))}
                            currentLessonId={currentModule?.id}
                            onSelectLesson={(id) => {
                                const mod = modules.find(m => m.id === id);
                                if (mod) {
                                    setCurrentModule(mod);
                                    setcurrentSessionIndex(0);
                                    setView('course');
                                    window.scrollTo(0, 0);
                                    setIsMobileMenuOpen(false);
                                }
                            }}
                            onSettingsClick={() => {
                                setView('settings');
                                setIsMobileMenuOpen(false);
                            }}
                            onHomeClick={() => {
                                setView('home');
                                setIsMobileMenuOpen(false);
                            }}
                            view={view}
                            assessmentPassed={user?.courseAssessments?.some(a => a.courseId === activeCourseId && a.passed) || (activeCourseId === 'csv-course' && user?.finalAssessment?.passed)}
                            language={settingsLanguage}
                            isAdmin={user?.role === 'admin'}
                            onAdminClick={() => {
                                setView('admin');
                                setIsMobileMenuOpen(false);
                            }}
                            onCertificateClick={() => {
                                const isPassed = user?.courseAssessments?.some(a => a.courseId === activeCourseId && a.passed) || (activeCourseId === 'csv-course' && user?.finalAssessment?.passed);
                                if (isPassed) {
                                    setView('certificate');
                                } else {
                                    startAssessment();
                                }
                                setIsMobileMenuOpen(false);
                            }}
                            currentScore={user?.courseAssessments?.find(a => a.courseId === activeCourseId)?.score || (activeCourseId === 'csv-course' ? user?.finalAssessment?.score : undefined)}
                            courses={(user?.enrolledCourses || (user?.isPaid ? ['csv-course'] : []))
                                .map(cid => ({
                                    id: cid,
                                    name: courseNames[cid] || cid.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                                }))}
                            activeCourseId={activeCourseId}
                            onCourseSelect={(id) => {
                                setActiveCourseId(id);
                                const firstModule = modules.find(m => (m.courseId || 'csv-course') === id);
                                if (firstModule) {
                                    setCurrentModule(firstModule);
                                    setcurrentSessionIndex(0);
                                    setView('course');
                                }
                                setIsMobileMenuOpen(false);
                            }}
                        />
                    </div>
                </div>

                {/* Mobile Overlay for Sidebar */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    ></div>
                )}

                <div className="flex-1 flex flex-col w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[calc(100vh-9rem)]">
                    {/* Floating WhatsApp Button */}
                    <a
                        href="https://wa.me/917036955133"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="fixed bottom-24 right-6 bg-[#25D366] hover:bg-[#20ba5a] text-white w-14 h-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 z-[9999] flex items-center justify-center group"
                        title="Chat on WhatsApp"
                    >
                        <svg className="w-8 h-8 text-white transition-transform group-hover:rotate-6" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.538 1.958 14.05 .928 11.99.928c-5.433 0-9.857 4.37-9.86 9.8.001 2.058.541 4.07 1.568 5.858L2.73 21.03l4.917-1.288zM17.36 14.39c-.293-.146-1.734-.857-2.002-.954-.268-.097-.463-.146-.658.146-.195.292-.755.954-.926 1.148-.171.195-.341.219-.634.073-.293-.146-1.237-.456-2.355-1.455-.87-.778-1.457-1.74-1.628-2.032-.17-.293-.018-.452.129-.597.132-.13.293-.341.44-.512.146-.17.195-.293.293-.487.097-.195.048-.366-.024-.512-.073-.146-.658-1.586-.902-2.17-.238-.574-.479-.497-.658-.507-.17-.008-.365-.01-.56-.01-.195 0-.512.073-.78.366-.268.293-1.024 1.001-1.024 2.44 0 1.439 1.048 2.83 1.195 3.025.147.195 2.062 3.149 4.996 4.413.698.301 1.244.48 1.668.615.702.223 1.342.192 1.848.116.564-.085 1.734-.708 1.978-1.39.244-.683.244-1.268.17-1.39-.074-.121-.268-.195-.561-.341z"/>
                        </svg>
                    </a>

                    <main className="flex-1 p-6 md:p-10 relative w-full overflow-x-hidden">

                    {view === 'settings' && (
                        <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-xl shadow-sm border border-gray-100 animate-fadeIn">
                            <h2 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">{t.updateSettings}</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div>
                                    <div className="mb-6">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">{t.selectUser}</label>
                                        <select className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0FA958] bg-white">
                                            <option>{user.fullName || user.email}</option>
                                        </select>
                                    </div>

                                    <button className="text-[#0FA958] font-bold text-sm mb-8 hover:underline flex items-center">
                                        {t.addSubUser}
                                    </button>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold mb-2">{t.name}</label>
                                            <input
                                                type="text"
                                                value={settingsName}
                                                onChange={(e) => setSettingsName(e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0FA958]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold mb-2">{t.state}</label>
                                            <input
                                                type="text"
                                                value={settingsState}
                                                onChange={(e) => setSettingsState(e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0FA958]"
                                                placeholder="e.g. Karnataka"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold mb-2">{t.language}</label>
                                            <select
                                                value={settingsLanguage}
                                                onChange={(e) => setSettingsLanguage(e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0FA958] bg-white"
                                            >
                                                <option value="ENGLISH">ENGLISH</option>
                                                <option value="HINDI">HINDI</option>
                                                <option value="KANNADA">KANNADA</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold mb-2">{t.dob}</label>
                                            <input
                                                type="date"
                                                value={settingsDob}
                                                onChange={(e) => setSettingsDob(e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0FA958]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold mb-2">{t.gender}</label>
                                            <div className="flex space-x-4">
                                                <label className="flex items-center space-x-2 cursor-pointer text-gray-700">
                                                    <input
                                                        type="radio"
                                                        name="gender"
                                                        value="Male"
                                                        checked={settingsGender === 'Male'}
                                                        onChange={(e) => setSettingsGender(e.target.value)}
                                                        className="form-radio text-[#0FA958]"
                                                    />
                                                    <span>{t.male}</span>
                                                </label>
                                                <label className="flex items-center space-x-2 cursor-pointer text-gray-700">
                                                    <input
                                                        type="radio"
                                                        name="gender"
                                                        value="Female"
                                                        checked={settingsGender === 'Female'}
                                                        onChange={(e) => setSettingsGender(e.target.value)}
                                                        className="form-radio text-[#0FA958]"
                                                    />
                                                    <span>{t.female}</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex space-x-4">
                                        <button
                                            onClick={handleSettingsUpdate}
                                            className="bg-[#0FA958] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#0c8746] transition-colors shadow-md"
                                        >
                                            {t.update}
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="bg-red-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-red-600 transition-colors shadow-md"
                                        >
                                            {t.logout}
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-8 rounded-xl h-fit">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">{t.sendFeedback}</h3>
                                    <p className="text-gray-600 mb-2 flex items-center">
                                        <span className="font-medium mr-2">{t.email}</span>
                                        <a href="mailto:learnwithrahuul@gmail.com" className="text-[#0FA958] hover:underline">learnwithrahuul@gmail.com</a>
                                    </p>
                                    <p className="text-gray-600 mb-4 flex items-center">
                                        <span className="font-medium mr-2">{t.phone}</span>
                                        <span>7036915353</span>
                                    </p>
                                    <p className="text-sm text-gray-500 mb-6">
                                        {t.hours}
                                    </p>
                                    <a href="#" className="text-[#0FA958] font-bold hover:underline flex items-center">
                                        {t.knowMore} <ArrowRight size={16} className="ml-1" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {view === 'assessment' && (
                        <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-xl shadow-lg border border-gray-100 animate-fadeIn min-h-[600px]">
                            {isAssessmentLoading ? (
                                <div className="flex flex-col items-center justify-center h-96">
                                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
                                    <p className="text-xl font-medium text-gray-600 animate-pulse">
                                        {assessmentResult ? "Grading your assessment with AI..." : "Generating your personalized assessment..."}
                                    </p>
                                </div>
                            ) : assessmentResult ? (
                                <div className="flex flex-col items-center justify-center text-center py-10">
                                    <div className={`p-6 rounded-full mb-6 ${assessmentResult.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {assessmentResult.passed ? <CheckCircle size={64} /> : <Target size={64} />}
                                    </div>
                                    <h2 className="text-4xl font-bold text-gray-800 mb-2">
                                        {assessmentResult.passed ? "Congratulations!" : "Keep Learning!"}
                                    </h2>
                                    <p className="text-xl text-gray-600 mb-8">
                                        You scored <span className={`font-bold ${assessmentResult.passed ? 'text-green-600' : 'text-red-600'}`}>{assessmentResult.score}%</span>
                                    </p>

                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 max-w-2xl w-full text-left">
                                        <h3 className="font-bold text-gray-700 mb-2">AI Instructor Feedback:</h3>
                                        <p className="text-gray-600 leading-relaxed">{assessmentResult.feedback || "Good effort! Review the modules and try again to improve your score."}</p>
                                    </div>

                                    <div className="flex gap-4">
                                        {assessmentResult.passed ? (
                                            <button
                                                onClick={() => setView('certificate')}
                                                className="bg-green-600 text-white px-8 py-3 rounded-full font-bold hover:bg-green-700 transition-all shadow-lg flex items-center"
                                            >
                                                <Award size={20} className="mr-2" />
                                                View Certificate
                                            </button>
                                        ) : (
                                            <button
                                                onClick={startAssessment}
                                                className="bg-[#0FA958] text-white px-8 py-3 rounded-full font-bold hover:bg-[#0c8746] transition-all shadow-lg flex items-center"
                                            >
                                                <Target size={20} className="mr-2" />
                                                Retry Assessment
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setView('course')}
                                            className="px-8 py-3 rounded-full font-bold text-gray-600 hover:bg-gray-100 transition-all"
                                        >
                                            Back to Course
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                                        <div>
                                            <h2 className="text-3xl font-bold text-gray-800">Final Assessment</h2>
                                            <p className="text-gray-500 mt-1">Answer all questions to complete the course certification.</p>
                                        </div>
                                        <div className="bg-[#eef2f7] text-blue-700 px-4 py-2 rounded-lg font-bold">
                                            Pass Mark: 85%
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        {assessmentQuestions.map((q, idx) => (
                                            <div key={q.id || idx} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                                <p className="font-semibold text-lg text-gray-800 mb-4 flex">
                                                    <span className="bg-[#0FA958] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3 flex-shrink-0">
                                                        {idx + 1}
                                                    </span>
                                                    {q.question}
                                                </p>
                                                <div className="space-y-3 ml-11">
                                                    {q.options.map((option: string, optIdx: number) => (
                                                        <label
                                                            key={optIdx}
                                                            className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${assessmentAnswers[q.id || idx] === option
                                                                ? 'border-[#0FA958] bg-[#eef2f7] ring-1 ring-[#0FA958]'
                                                                : 'border-gray-200 hover:bg-white hover:border-blue-300'
                                                                }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`q-${q.id || idx}`}
                                                                className="w-4 h-4 text-[#0FA958] focus:ring-[#0FA958]"
                                                                checked={assessmentAnswers[q.id || idx] === option}
                                                                onChange={() => setAssessmentAnswers(prev => ({ ...prev, [q.id || idx]: option }))}
                                                            />
                                                            <span className="ml-3 text-gray-700">{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-10 flex justify-end gap-4 pb-10">
                                        <button
                                            onClick={() => setView('course')}
                                            className="px-6 py-3 rounded-lg font-medium text-gray-500 hover:text-gray-700"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={submitAssessment}
                                            disabled={Object.keys(assessmentAnswers).length < assessmentQuestions.length}
                                            className={`px-8 py-3 rounded-full font-bold text-white shadow-lg transition-all flex items-center ${Object.keys(assessmentAnswers).length < assessmentQuestions.length
                                                ? 'bg-gray-300 cursor-not-allowed'
                                                : 'bg-[#0FA958] hover:bg-[#0c8746] transform hover:scale-105'
                                                }`}
                                        >
                                            Submit Assessment <ArrowRight size={20} className="ml-2" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {view === 'certificate' && (
                        <div className="flex flex-col items-center justify-start p-4 pt-8 min-h-[600px] w-full">
                            {completedCourses.length > 0 ? (
                                <>
                                    {completedCourses.length > 1 && (
                                        <div className="mb-6 flex space-x-4 bg-white p-2 rounded-lg shadow-sm">
                                            {completedCourses.map(c => (
                                                <button
                                                    key={c.id}
                                                    onClick={() => setViewCertificateId(c.id)}
                                                    className={`px-4 py-2 rounded-md font-medium transition-colors ${(() => {
                                                        const isCompleted = (cid: string) => completedCourses.some(cc => cc.id === cid);
                                                        const initialCertId = isCompleted(activeCourseId) ? activeCourseId : completedCourses[0]?.id;
                                                        const displayCertId = viewCertificateId || initialCertId;
                                                        return displayCertId === c.id;
                                                    })()
                                                        ? 'bg-[#0FA958] text-white'
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {c.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <Suspense fallback={<div className="flex justify-center items-center h-[600px]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div></div>}>
                                        <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
                                            <div className="min-w-[800px] flex justify-center">
                                                {(() => {
                                                    const isCompleted = (cid: string) => completedCourses.some(cc => cc.id === cid);
                                                    const initialCertId = isCompleted(activeCourseId) ? activeCourseId : completedCourses[0]?.id;
                                                    const displayCertId = viewCertificateId || initialCertId || activeCourseId;

                                                    return (
                                                        <Certificate
                                                            key={displayCertId}
                                                            userName={user.fullName || user.email.split('@')[0]}
                                                            courseName={courseNames[displayCertId] || 'Course Completion'}
                                                            courseId={displayCertId}
                                                            language={settingsLanguage}
                                                            userEmail={user.email}
                                                        />
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </Suspense>
                                </>
                            ) : (
                                <div className="text-center p-10 bg-white rounded-xl shadow-lg border border-gray-100 max-w-lg">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Certificates Locked</h2>
                                    <p className="text-gray-600 mb-6">You must complete all modules of a course to unlock its certificate.</p>
                                    <button
                                        onClick={() => setView('course')}
                                        className="bg-[#0FA958] text-white px-6 py-2 rounded-full hover:bg-[#0c8746] transition-colors"
                                    >
                                        Back to Learning
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    {view === 'home' && (
                        <div className="space-y-6 animate-fadeIn">
                            {/* Welcome Banner */}
                            <div className="bg-gradient-to-r from-[#0A2A66] to-blue-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
                                <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-[#0FA958] opacity-20 rounded-full translate-y-1/2 blur-xl"></div>
                                <div className="relative z-10">
                                    <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.fullName || user?.email?.split('@')[0] || 'Learner'}!</h2>
                                    <p className="text-blue-100 max-w-lg text-lg">Ready to continue your learning journey? You're making great progress.</p>
                                    
                                    <div className="mt-8 flex flex-wrap gap-4">
                                        <button 
                                            onClick={() => setView('course')}
                                            className="bg-[#0FA958] hover:bg-[#0c8746] text-white px-8 py-3 rounded-xl font-bold shadow-md transition-all hover:scale-105 flex items-center"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                            </svg>
                                            Resume Course
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Total XP</p>
                                        <h3 className="text-3xl font-extrabold text-[#0A2A66]">
                                            {((user?.completedModules?.length || 0) * 150) + Math.round(courseProgress * 10)}
                                        </h3>
                                    </div>
                                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Current Progress</p>
                                        <h3 className="text-3xl font-extrabold text-[#0A2A66]">{Math.round(courseProgress)}%</h3>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Learning Streak</p>
                                        <h3 className="text-3xl font-extrabold text-[#0A2A66]">3 Days</h3>
                                    </div>
                                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Achievements & Current Focus */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-[#0A2A66]">Recent Badges</h3>
                                        <button className="text-sm text-[#0FA958] font-medium">View All</button>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mr-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800">First Step</h4>
                                                <p className="text-xs text-gray-500">Completed the first module</p>
                                            </div>
                                            <div className="ml-auto text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded">Unlocked</div>
                                        </div>
                                        <div className={`flex items-center p-3 rounded-lg border border-gray-100 transition-colors ${courseProgress >= 50 ? 'hover:bg-gray-50' : 'opacity-60'}`}>
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${courseProgress >= 50 ? 'bg-purple-50 text-purple-500' : 'bg-gray-100 text-gray-400'}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16 10-4 4-4-4"/></svg>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800">Halfway There</h4>
                                                <p className="text-xs text-gray-500">Reach 50% course completion</p>
                                            </div>
                                            <div className="ml-auto text-xs font-bold px-2 py-1 rounded">
                                                {courseProgress >= 50 ? (
                                                    <span className="text-green-500 bg-green-50">Unlocked</span>
                                                ) : (
                                                    <span className="text-gray-400 bg-gray-100">Locked</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`flex items-center p-3 rounded-lg border border-gray-100 transition-colors ${courseProgress >= 100 ? 'hover:bg-gray-50' : 'opacity-60'}`}>
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${courseProgress >= 100 ? 'bg-amber-50 text-amber-500' : 'bg-gray-100 text-gray-400'}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15l-2 5l9 -5l-9 -5l2 5Z"/><circle cx="12" cy="12" r="10"/></svg>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800">Master Achiever</h4>
                                                <p className="text-xs text-gray-500">Complete all course modules</p>
                                            </div>
                                            <div className="ml-auto text-xs font-bold px-2 py-1 rounded">
                                                {courseProgress >= 100 ? (
                                                    <span className="text-green-500 bg-green-50">Unlocked</span>
                                                ) : (
                                                    <span className="text-gray-400 bg-gray-100">Locked</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold text-[#0A2A66]">Current Module</h3>
                                        <p className="text-sm text-gray-500">Pick up exactly where you left off</p>
                                    </div>
                                    <div className="flex-1 bg-gray-50 rounded-xl p-6 border border-gray-100 flex flex-col justify-center items-center text-center">
                                        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-[#0A2A66] mb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                                        </div>
                                        <h4 className="font-bold text-lg text-gray-800 mb-2">{currentModule?.title || 'Course Module'}</h4>
                                        <p className="text-sm text-gray-500 mb-6 max-w-[200px]">{currentModule?.sections?.length || 0} Topics inside</p>
                                        <button 
                                            onClick={() => setView('course')}
                                            className="w-full bg-[#0A2A66] hover:bg-blue-800 text-white py-3 rounded-lg font-bold transition-colors shadow-md"
                                        >
                                            Start Learning
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {view === 'course' && (
                        <>
                            {modules.length > 0 && currentModule && currentModule.id === modules[0].id && (
                                <CourseOverview language={settingsLanguage} />
                            )}
                            <div className="bg-white p-6 md:p-10 rounded-xl shadow-sm border border-gray-100 min-h-[600px] flex flex-col">
                                {currentModule && (
                                    <>
                                        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 gap-4">
                                            <h2 className="text-2xl md:text-3xl font-bold text-[#0A2A66]">{currentModule.title}</h2>
                                            <div className="flex space-x-2 items-center">
                                                {steps.map((step, sIdx) => {
                                                    const stepIndex = steps.indexOf(currentStep);
                                                    const isActive = currentStep === step;
                                                    const isCompleted = sIdx < stepIndex;
                                                    const stepLabel = step === 'document' ? 'Document' :
                                                                      step === 'video' ? 'Video' :
                                                                      step === 'theory' ? 'Content' :
                                                                      step === 'code' ? 'Code Lab' : 'Quiz';
                                                    return (
                                                        <div 
                                                            key={step} 
                                                            className={`h-2 w-10 md:w-12 rounded-full transition-all duration-300 ${
                                                                isActive 
                                                                ? 'bg-[#0FA958] ring-2 ring-green-200 scale-y-110' 
                                                                : isCompleted 
                                                                  ? 'bg-green-500' 
                                                                  : 'bg-gray-200'
                                                            }`}
                                                            title={stepLabel}
                                                        ></div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Session Switcher Tabs */}
                                        <div className="flex flex-wrap gap-2 mb-6 bg-slate-50 p-2 rounded-xl border border-slate-100">
                                            {currentModule.sessions && currentModule.sessions.map((session: any, idx: number) => {
                                                const isActive = idx === currentSessionIndex;
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => {
                                                            setcurrentSessionIndex(idx);
                                                            setCode(session?.code || '');
                                                            const newSteps = getAvailableSteps(session);
                                                            if (newSteps.length > 0) {
                                                                setCurrentStep(newSteps[0]);
                                                            } else {
                                                                setCurrentStep('theory');
                                                            }
                                                            setVideoCompleted(false);
                                                            setPdfCompleted(false);
                                                            setMcqAnswers({});
                                                            setExecutionOutput('');
                                                            setShowOutput(false);
                                                            window.scrollTo(0, 0);
                                                        }}
                                                        className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                                                            isActive
                                                            ? 'bg-[#0A2A66] text-white shadow-sm'
                                                            : 'text-gray-600 hover:bg-slate-200'
                                                        }`}
                                                    >
                                                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#0FA958]' : 'bg-gray-400'}`}></span>
                                                        {session.title.replace(/^MODULE \d+\s*—\s*/i, '').replace(/^\d+\.\d+\s*/, '')}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Meeting Link Banner (if configured) */}
                                        {currentModule.sessions && currentModule.sessions[currentSessionIndex] && (currentModule.sessions[currentSessionIndex].link || currentModule.sessions[currentSessionIndex].isLive) && (
                                            <div className={`mb-6 p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-center gap-4 ${
                                                currentModule.sessions[currentSessionIndex].isLive
                                                ? 'bg-red-50 border-red-200 text-red-900 animate-pulse'
                                                : 'bg-blue-50 border-blue-200 text-blue-900'
                                            }`}>
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-3 h-3 rounded-full ${currentModule.sessions[currentSessionIndex].isLive ? 'bg-red-500 animate-ping' : 'bg-blue-500'}`}></span>
                                                    <div>
                                                        <p className="font-bold text-sm">
                                                            {currentModule.sessions[currentSessionIndex].isLive ? 'LIVE CLASS IN PROGRESS' : 'SESSION MEETING/RECORDING LINK'}
                                                        </p>
                                                        {currentModule.sessions[currentSessionIndex].date && (
                                                            <p className="text-xs text-gray-500">
                                                                Scheduled: {currentModule.sessions[currentSessionIndex].date} at {currentModule.sessions[currentSessionIndex].time} ({currentModule.sessions[currentSessionIndex].duration})
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <a
                                                    href={currentModule.sessions[currentSessionIndex].link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`px-6 py-2.5 rounded-lg text-sm font-black transition-all flex items-center gap-2 transform hover:scale-[1.02] shadow-sm ${
                                                        currentModule.sessions[currentSessionIndex].isLive
                                                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200'
                                                        : 'bg-[#0FA958] hover:bg-[#0c8746] text-white shadow-green-200'
                                                    }`}
                                                >
                                                    <Monitor size={16} />
                                                    {currentModule.sessions[currentSessionIndex].isLive ? 'JOIN LIVE CLASS' : 'VIEW SESSION LINK'}
                                                </a>
                                            </div>
                                        )}

                                        {/* Document Step */}
                                        {currentStep === 'document' && currentModule.sessions && currentModule.sessions.length > 0 && currentModule.sessions[currentSessionIndex] && (
                                            <div className="flex-1 flex flex-col justify-between animate-fadeIn">
                                                <div>
                                                    <h3 className="text-2xl font-bold mb-4 text-[#0A2A66]">{currentModule.sessions[currentSessionIndex].title}</h3>
                                                    <div className="flex flex-col mb-6 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                                                        <div className="bg-gray-50 border-b border-gray-100 p-4 flex justify-between items-center">
                                                            <div className="flex items-center text-gray-700 font-medium">
                                                                <FileText size={20} className="mr-2 text-[#0FA958]" />
                                                                <span>Course Document</span>
                                                            </div>
                                                        </div>
                                                        <div className="w-full h-[75vh] bg-gray-50">
                                                            <iframe
                                                                src={(() => {
                                                                    let url = currentModule.sessions[currentSessionIndex].pdfUrl;
                                                                    if (url.includes('drive.google.com') && url.includes('/view')) {
                                                                        return url.replace('/view', '/preview');
                                                                    }
                                                                    return `${url}#toolbar=0`;
                                                                })()}
                                                                className="w-full h-full border-0"
                                                                title="PDF Viewer"
                                                                allow="autoplay"
                                                            />
                                                        </div>
                                                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                                                            {!pdfCompleted ? (
                                                                <button
                                                                    onClick={() => setPdfCompleted(true)}
                                                                    className="bg-[#0FA958] text-white px-8 py-3 rounded-full font-bold hover:bg-[#0c8746] transition-all shadow-lg flex items-center transform hover:scale-[1.05]"
                                                                >
                                                                    <CheckCircle size={20} className="mr-2" />
                                                                    Mark as Completed
                                                                </button>
                                                            ) : (
                                                                <div className="flex items-center text-green-700 font-bold bg-green-100 px-6 py-3 rounded-full border border-green-300 shadow-sm animate-fadeIn">
                                                                    <CheckCircle size={22} className="mr-2" />
                                                                    Document Status: Completed
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between mt-8 border-t border-gray-100 pt-6">
                                                    <button
                                                        onClick={handlePrevSession}
                                                        disabled={currentSessionIndex === 0 && steps.indexOf(currentStep) === 0}
                                                        className={`px-6 py-2 rounded-lg font-medium ${(currentSessionIndex === 0 && steps.indexOf(currentStep) === 0) ? 'text-gray-300 cursor-not-allowed' : 'text-[#0FA958] hover:bg-[#eef2f7]'}`}
                                                    >
                                                        {t.previous}
                                                    </button>

                                                    {pdfCompleted && (
                                                        <button
                                                            onClick={handleNextSession}
                                                            className="bg-[#0FA958] text-white px-8 py-3 rounded-full hover:bg-[#0c8746] transition-all shadow-lg flex items-center"
                                                        >
                                                            <span>{t.nextTopic}</span>
                                                            <ArrowRight className="ml-2" size={20} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Video Step */}
                                        {currentStep === 'video' && currentModule.sessions && currentModule.sessions.length > 0 && currentModule.sessions[currentSessionIndex] && (
                                            <div className="flex-1 flex flex-col justify-between animate-fadeIn">
                                                <div>
                                                    <h3 className="text-2xl font-bold mb-4 text-[#0A2A66]">{currentModule.sessions[currentSessionIndex].title}</h3>
                                                    <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-800 mb-6">
                                                        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                                                            <div className="flex items-center text-white font-medium">
                                                                <Video size={20} className="mr-2 text-blue-400" />
                                                                <span>Video Lesson</span>
                                                            </div>
                                                        </div>

                                                        {(() => {
                                                            const url = currentModule.sessions[currentSessionIndex].videoUrl;
                                                            const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
                                                            const isGoogleDrive = url.includes('drive.google.com');
                                                            const isOneDrive = url.includes('sharepoint.com') || url.includes('1drv.ms') || url.includes('onedrive.live.com');

                                                            if (isYoutube || isGoogleDrive || isOneDrive) {
                                                                let embedSrc = url;
                                                                if (isYoutube) {
                                                                    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                                                                    const match = url.match(regExp);
                                                                    const videoId = (match && match[2].length === 11) ? match[2] : null;
                                                                    embedSrc = `https://www.youtube.com/embed/${videoId}`;
                                                                } else if (isGoogleDrive && url.includes('/view')) {
                                                                    embedSrc = url.replace('/view', '/preview');
                                                                }

                                                                return (
                                                                    <div className="flex flex-col">
                                                                        <div className="relative pt-[56.25%] w-full bg-black">
                                                                            <iframe
                                                                                className="absolute top-0 left-0 w-full h-full border-0"
                                                                                src={embedSrc}
                                                                                title="Video Player"
                                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                                allowFullScreen
                                                                            ></iframe>
                                                                        </div>
                                                                        <div className="p-4 bg-slate-800 flex justify-end border-t border-slate-700">
                                                                            {!videoCompleted ? (
                                                                                <button
                                                                                    onClick={() => setVideoCompleted(true)}
                                                                                    className="bg-[#0FA958] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#0c8746] shadow-lg"
                                                                                >
                                                                                    Mark as Watched
                                                                                </button>
                                                                            ) : (
                                                                                <div className="flex items-center text-green-400 text-sm font-medium bg-slate-900/50 px-4 py-2 rounded-lg border border-green-900/30">
                                                                                    <CheckCircle size={16} className="mr-2" />
                                                                                    Watched
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            } else {
                                                                return (
                                                                    <div className="flex flex-col">
                                                                        <video
                                                                            controls
                                                                            controlsList="nodownload"
                                                                            className="w-full bg-black aspect-video"
                                                                            onEnded={() => setVideoCompleted(true)}
                                                                            onContextMenu={(e) => e.preventDefault()}
                                                                            onError={(e) => {
                                                                                const target = e.target as HTMLVideoElement;
                                                                                target.style.display = 'none';
                                                                                const errorMsg = document.getElementById(`video-error-${currentSessionIndex}`);
                                                                                if (errorMsg) errorMsg.style.display = 'block';
                                                                            }}
                                                                        >
                                                                            <source src={url} />
                                                                            Your browser does not support the video tag.
                                                                        </video>

                                                                        <div id={`video-error-${currentSessionIndex}`} className="hidden bg-slate-800 text-red-400 p-6 border-t border-slate-700">
                                                                            <p className="font-bold mb-2">Video Unavailable</p>
                                                                            <p className="text-sm mb-4 text-slate-300">The video stream failed to load. Please try opening it directly.</p>
                                                                            <a
                                                                                href={url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-blue-400 hover:text-blue-300 text-sm font-medium inline-flex items-center underline"
                                                                            >
                                                                                Open Video <ArrowRight size={14} className="ml-1" />
                                                                            </a>
                                                                            <div className="mt-4 pt-4 border-t border-slate-700">
                                                                                <button
                                                                                    onClick={() => setVideoCompleted(true)}
                                                                                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                                                                                >
                                                                                    Skip this video
                                                                                </button>
                                                                            </div>
                                                                        </div>

                                                                        {videoCompleted && (
                                                                            <div className="p-4 bg-slate-800 border-t border-slate-700 flex justify-end animate-fadeIn">
                                                                                <div className="flex items-center text-green-400 text-sm font-medium bg-slate-900/50 px-4 py-2 rounded-lg border border-green-900/30">
                                                                                    <CheckCircle size={16} className="mr-2" />
                                                                                    Video Watched & Completed
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            }
                                                        })()}
                                                    </div>
                                                </div>
                                                <div className="flex justify-between mt-8 border-t border-gray-100 pt-6">
                                                    <button
                                                        onClick={handlePrevSession}
                                                        className="px-6 py-2 rounded-lg font-medium text-[#0FA958] hover:bg-[#eef2f7]"
                                                    >
                                                        {t.previous}
                                                    </button>

                                                    {videoCompleted && (
                                                        <button
                                                            onClick={handleNextSession}
                                                            className="bg-[#0FA958] text-white px-8 py-3 rounded-full hover:bg-[#0c8746] transition-all shadow-lg flex items-center"
                                                        >
                                                            <span>{t.nextTopic}</span>
                                                            <ArrowRight className="ml-2" size={20} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Theory/Content Step */}
                                        {currentStep === 'theory' && currentModule.sessions && currentModule.sessions.length > 0 && currentModule.sessions[currentSessionIndex] && (
                                            <div className="flex-1 flex flex-col justify-between animate-fadeIn">
                                                <div>
                                                    <h3 className="text-2xl font-bold mb-4 text-[#0A2A66]">{currentModule.sessions[currentSessionIndex].title}</h3>
                                                    {currentModule.sessions[currentSessionIndex].image && (
                                                        <img
                                                            src={currentModule.sessions[currentSessionIndex].image}
                                                            alt="Topic"
                                                            className="w-full h-64 object-cover rounded-lg mb-8 shadow-md"
                                                        />
                                                    )}
                                                    <div className="prose max-w-none text-gray-700 text-lg leading-relaxed mb-6">
                                                        <ReactMarkdown>{currentModule.sessions[currentSessionIndex].content}</ReactMarkdown>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between mt-8 border-t border-gray-100 pt-6">
                                                    <button
                                                        onClick={handlePrevSession}
                                                        className="px-6 py-2 rounded-lg font-medium text-[#0FA958] hover:bg-[#eef2f7]"
                                                    >
                                                        {t.previous}
                                                    </button>

                                                    <button
                                                        onClick={handleNextSession}
                                                        className="bg-[#0FA958] text-white px-8 py-3 rounded-full hover:bg-[#0c8746] transition-all shadow-lg flex items-center"
                                                    >
                                                        <span>
                                                            {steps.indexOf(currentStep) === steps.length - 1 && currentSessionIndex === currentModule.sessions.length - 1
                                                                ? t.goToPractical
                                                                : t.nextTopic}
                                                        </span>
                                                        <ArrowRight className="ml-2" size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {
                                            currentStep === 'code' && (
                                                <div className="flex-1 flex flex-col animate-fadeIn">
                                                    <h3 className="text-2xl font-semibold mb-4 text-gray-800">{t.practicalLab}</h3>
                                                    <p className="text-gray-600 mb-4">{t.editCode}</p>

                                                    <div className="bg-gray-900 rounded-lg overflow-hidden mb-6 shadow-lg flex-1 flex flex-col min-h-[400px]">
                                                        {activeCourseId === 'cv-course' && (
                                                            <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center">
                                                                <label className="text-gray-300 text-sm mr-3 font-medium">Input Image:</label>
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={handleImageUpload}
                                                                    className="text-sm text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#0FA958] file:text-white hover:file:bg-blue-700"
                                                                />
                                                                {uploadedImage && <span className="text-green-500 text-xs ml-2 flex items-center"><CheckCircle size={12} className="mr-1" /> Loaded</span>}
                                                            </div>
                                                        )}
                                                        <div className="bg-gray-800 px-4 py-2 flex justify-between items-center">
                                                            <span className="text-gray-400 text-sm">main.py</span>
                                                            <button
                                                                onClick={runCode}
                                                                disabled={isExecuting}
                                                                className={`bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-sm font-medium transition-colors flex items-center ${isExecuting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            >
                                                                <Play size={16} className="mr-1" /> {isExecuting ? 'Running...' : t.runCode}
                                                            </button>
                                                        </div>
                                                        <textarea
                                                            value={code}
                                                            onChange={(e) => setCode(e.target.value)}
                                                            className="w-full flex-1 bg-[#1e1e1e] text-gray-300 font-mono p-4 text-sm focus:outline-none resize-none"
                                                            spellCheck={false}
                                                        />
                                                        {showOutput && (
                                                            <div className="border-t border-gray-700 bg-black p-4 h-32 overflow-y-auto">
                                                                <div className="text-gray-500 text-xs mb-2 uppercase tracking-wider">{t.terminalOutput}</div>
                                                                <pre className="text-white font-mono text-sm">{executionOutput || currentModule.sessions[currentSessionIndex].output}</pre>
                                                                {outputImage && (
                                                                    <div className="mt-4 pt-4 border-t border-gray-800">
                                                                        <div className="text-gray-500 text-xs mb-2 uppercase tracking-wider">Output Image</div>
                                                                        <img src={outputImage} alt="Output" className="max-w-md h-auto rounded border border-gray-700 shadow-md" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex justify-between mt-6 border-t border-gray-100 pt-6">
                                                        <button
                                                            onClick={handlePrevSession}
                                                            className="px-6 py-2 rounded-lg font-medium text-[#0FA958] hover:bg-[#eef2f7]"
                                                        >
                                                            {t.previous}
                                                        </button>
                                                        <button
                                                            onClick={handleNextSession}
                                                            className="bg-[#0FA958] text-white px-8 py-3 rounded-full hover:bg-[#0c8746] transition-all shadow-lg flex items-center"
                                                        >
                                                            <span>{steps.includes('mcq') ? t.proceedToQuiz : t.nextTopic}</span>
                                                            <ArrowRight className="ml-2" size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        }



                                        {
                                            currentStep === 'mcq' && (
                                                <div className="flex-1 flex flex-col animate-fadeIn">
                                                    <h3 className="text-2xl font-semibold mb-6 text-gray-800">{t.knowledgeCheck}</h3>
                                                    <div className="flex-1">
                                                        {currentModule.sessions[currentSessionIndex].mcqs && currentModule.sessions[currentSessionIndex].mcqs.map((mcq: any, index: number) => {
                                                            const isAnswered = mcqAnswers.hasOwnProperty(index);
                                                            const isCorrect = isAnswered && mcqAnswers[index] === mcq.correctAnswer;

                                                            return (
                                                                <div key={index} className="mb-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                                                    <p className="font-medium text-lg text-gray-800 mb-4">{index + 1}. {mcq.question}</p>
                                                                    <div className="space-y-3">
                                                                        {mcq.options.map((option: string, optIndex: number) => {
                                                                            let optionClass = "border-gray-200 hover:bg-gray-50";
                                                                            if (isAnswered) {
                                                                                if (optIndex === mcq.correctAnswer) {
                                                                                    optionClass = "border-green-500 bg-green-50";
                                                                                } else if (mcqAnswers[index] === optIndex) {
                                                                                    optionClass = "border-red-500 bg-red-50";
                                                                                } else {
                                                                                    optionClass = "border-gray-200 opacity-50";
                                                                                }
                                                                            } else if (mcqAnswers[index] === optIndex) {
                                                                                optionClass = "border-[#0FA958] bg-[#eef2f7]";
                                                                            }

                                                                            return (
                                                                                <label key={optIndex} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${optionClass}`}>
                                                                                    <input
                                                                                        type="radio"
                                                                                        name={`mcq-${index}`}
                                                                                        className="form-radio h-5 w-5 text-[#0FA958]"
                                                                                        onChange={() => {
                                                                                            if (!isAnswered) {
                                                                                                const newAnswers = { ...mcqAnswers };
                                                                                                newAnswers[index] = optIndex;
                                                                                                setMcqAnswers(newAnswers);
                                                                                            }
                                                                                        }}
                                                                                        checked={mcqAnswers[index] === optIndex}
                                                                                        disabled={isAnswered}
                                                                                    />
                                                                                    <span className="ml-3 text-gray-700">{option}</span>
                                                                                    {isAnswered && optIndex === mcq.correctAnswer && <CheckCircle size={16} className="ml-auto text-green-600" />}
                                                                                </label>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                    {isAnswered && (
                                                                        <div className={`mt-3 text-sm font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                                                            {isCorrect ? "Correct Answer!" : "Incorrect Answer. Try to review the topic."}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )
                                                        })}
                                                    </div>

                                                    <div className="flex justify-between mt-8 border-t border-gray-100 pt-6">
                                                        <button
                                                            onClick={handlePrevSession}
                                                            className="px-6 py-2 rounded-lg font-medium text-[#0FA958] hover:bg-[#eef2f7]"
                                                        >
                                                            {t.previous}
                                                        </button>
                                                        <button
                                                            onClick={currentSessionIndex === currentModule.sessions.length - 1 ? markModuleComplete : handleNextSession}
                                                            className={`flex items-center space-x-2 px-8 py-3 rounded-full transition-all shadow-lg ${
                                                                currentModule.sessions[currentSessionIndex].mcqs && Object.keys(mcqAnswers).length < currentModule.sessions[currentSessionIndex].mcqs.length
                                                                ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                                                                : 'bg-[#0FA958] hover:bg-[#0c8746] text-white'
                                                            }`}
                                                            disabled={currentModule.sessions[currentSessionIndex].mcqs && Object.keys(mcqAnswers).length < currentModule.sessions[currentSessionIndex].mcqs.length}
                                                        >
                                                            <span>
                                                                {currentModule.sessions[currentSessionIndex].mcqs && Object.keys(mcqAnswers).length < currentModule.sessions[currentSessionIndex].mcqs.length
                                                                    ? t.answerAll
                                                                    : currentSessionIndex === currentModule.sessions.length - 1
                                                                      ? t.completeModule
                                                                      : t.nextTopic
                                                                }
                                                            </span>
                                                            <CheckCircle className="ml-2" size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </>
                                )}
                            </div>
                        </>
                    )
                    }

                    {
                        showProfileModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white p-8 rounded-xl shadow-2xl w-96 animate-fadeIn">
                                    <h2 className="text-2xl font-bold mb-6 text-gray-800">{t.updateProfile}</h2>
                                    <p className="text-sm text-gray-600 mb-4">{t.enterFullName}</p>
                                    <div className="mb-6">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">{t.fullName}</label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0FA958]"
                                            placeholder="e.g. John Doe"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={() => setShowProfileModal(false)}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                        >
                                            {t.cancel}
                                        </button>
                                        <button
                                            onClick={handleUpdateProfile}
                                            className="px-6 py-2 bg-[#0FA958] text-white rounded-lg hover:bg-[#0c8746] shadow-md"
                                        >
                                            {t.saveChanges}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    {/* Chatbot */}
                    <Chatbot language={settingsLanguage} />
                </main >
                </div>
            </div >
        </div >
    );
};

export default Dashboard;





