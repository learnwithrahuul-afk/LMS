import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, CheckCircle, XCircle, ShieldCheck, Award } from 'lucide-react';
import Certificate from './Certificate';

interface CertificateData {
    studentName: string;
    courseName: string;
    issueDate: string;
    certificateId: string;
}

const CertificateVerification: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [certificateId, setCertificateId] = useState(id || '');
    const [verificationResult, setVerificationResult] = useState<CertificateData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (id) {
            handleVerify(id);
        }
    }, [id]);

    const handleVerify = async (certId: string) => {
        setLoading(true);
        setError(null);
        setVerificationResult(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/certificate/verify/${certId}`);
            const data = await response.json();

            if (data.valid) {
                setVerificationResult(data.data);
            } else {
                setError('We could not find a certificate matching this ID. Please check and try again.');
            }
        } catch (err) {
            console.error(err);
            setError('System is temporarily unavailable. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (certificateId.trim()) {
            navigate(`/verify/${certificateId}`);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans">
            {/* Left Panel - Branding & Context (Sticky on Desktop) */}
            <div className="lg:w-[40%] bg-[#0A2A66] text-white p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden lg:min-h-screen lg:sticky lg:top-0">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-[#0FA958] opacity-20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#d48806] opacity-10 blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-12 lg:mb-20">
                        <img src="/Logo.jpeg" alt="Learn With Rahuul" className="h-12 bg-white rounded object-contain p-1" />
                        <span className="font-bold text-xl tracking-wide">Learn With Rahuul</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                        Global <br />
                        Credential <br />
                        <span className="text-[#0FA958]">Verification</span>
                    </h1>
                    
                    <p className="text-blue-100 text-base lg:text-lg max-w-md leading-relaxed mb-12 opacity-90">
                        Ensure the authenticity of your achievements. Our verifiable credentials guarantee that your skills are recognized globally by top pharmaceutical employers.
                    </p>

                    <div className="space-y-6 hidden md:block">
                        <div className="flex items-center gap-4 text-blue-50">
                            <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/5">
                                <ShieldCheck className="text-[#0FA958]" size={24} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg">Secure & Authentic</h4>
                                <p className="text-sm opacity-70">Directly verified against our central registry</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-blue-50">
                            <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/5">
                                <Award className="text-[#d48806]" size={24} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg">Industry Recognized</h4>
                                <p className="text-sm opacity-70">Trusted by Fortune 500 Pharma Companies</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mt-12 lg:mt-0 text-sm text-blue-200 opacity-60">
                    &copy; {new Date().getFullYear()} Learn With Rahuul. All rights reserved.
                </div>
            </div>

            {/* Right Panel - Interaction & Display */}
            <div className="lg:w-[60%] bg-[#fafbfc] flex flex-col items-center justify-start lg:justify-center p-4 sm:p-8 lg:p-12 xl:p-20 min-h-screen">
                
                <div className="w-full max-w-3xl transition-all duration-700 ease-in-out">
                    
                    {/* Input Section */}
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10 mb-8 w-full">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Certificate ID</h2>
                        <p className="text-gray-500 mb-8 text-sm sm:text-base">You can find the unique ID at the bottom right of your digital certificate.</p>

                        <form onSubmit={handleSubmit} className="relative">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={certificateId}
                                        onChange={(e) => setCertificateId(e.target.value)}
                                        placeholder="LWR-XXXXXXX"
                                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent border-b-gray-200 rounded-xl text-lg sm:text-xl font-bold text-gray-800 tracking-wider focus:bg-white focus:border-[#0FA958] focus:ring-0 outline-none transition-all placeholder:font-medium placeholder:text-gray-300"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || !certificateId.trim()}
                                    className="bg-[#0A2A66] hover:bg-[#061940] text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-md hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 sm:min-w-[160px]"
                                >
                                    {loading ? (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <>Search <Search size={18} /></>
                                    )}
                                </button>
                            </div>
                        </form>

                        {error && (
                            <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start gap-3 animate-in fade-in rounded-r-lg">
                                <XCircle className="shrink-0 mt-0.5" size={20} />
                                <div>
                                    <p className="font-semibold text-sm">Verification Failed</p>
                                    <p className="text-sm mt-1 opacity-90">{error}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Result Section */}
                    {verificationResult && (
                        <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 w-full">
                            <div className="bg-[#0FA958] text-white rounded-t-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-center gap-3 shadow-lg">
                                <CheckCircle size={28} className="text-green-100 shrink-0" />
                                <h3 className="text-lg sm:text-xl font-bold tracking-wide text-center">Authentic Credential Verified</h3>
                            </div>
                            
                            <div className="bg-white p-4 sm:p-8 rounded-b-3xl shadow-2xl border border-t-0 border-gray-100 w-full relative z-10 overflow-hidden">
                                <div className="w-full overflow-x-auto custom-scrollbar pb-4 relative">
                                    <div className="min-w-[min(100%,1123px)] flex justify-center">
                                        <Certificate
                                            userName={verificationResult.studentName}
                                            courseName={verificationResult.courseName}
                                            date={new Date(verificationResult.issueDate).toLocaleDateString()}
                                            certificateId={verificationResult.certificateId}
                                            language="ENGLISH"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CertificateVerification;
