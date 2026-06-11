import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, CheckCircle, XCircle, Award, ArrowRight, ShieldCheck } from 'lucide-react';
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
                setError('Invalid Certificate ID. The ID you entered does not match our records.');
            }
        } catch (err) {
            console.error(err);
            setError('Unable to verify at this time. Please check your connection and try again.');
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
        <div className="min-h-screen bg-[#f8f9fa] relative overflow-hidden flex flex-col font-sans">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#0A2A66] to-[#f8f9fa]"></div>
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]"
                    style={{ backgroundImage: 'radial-gradient(#0A2A66 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            </div>

            {/* Navbar Placeholder / Brand */}
            <div className="relative z-10 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-2">
                    <img src="/Logo.jpeg" alt="Learn With Rahuul" className="h-12 bg-white rounded-lg shadow-sm border border-white/20 object-contain p-1" />
                    <span className="font-bold text-xl tracking-tight text-white ml-2">Learn With Rahuul <span className="text-[#0FA958] font-semibold">Verify</span></span>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-start pt-10 pb-20 px-4">

                {/* Search Card */}
                <div className={`w-full bg-white backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 p-8 transition-all duration-700 ease-out 
                                ${verificationResult ? 'max-w-6xl' : 'max-w-xl translate-y-20'}`}>

                    {!verificationResult && (
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center p-4 rounded-full bg-[#e6f4ea] text-[#0FA958] mb-6 shadow-sm">
                                <ShieldCheck size={48} strokeWidth={1.5} />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-[#0A2A66] mb-4">Verify a Certificate</h1>
                            <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
                                Enter the unique Certificate ID to confirm the authenticity of a Learn With Rahuul certification.
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={`relative z-20 ${verificationResult ? 'mb-8 flex flex-col md:flex-row gap-4 items-end max-w-2xl mx-auto' : 'mb-2'}`}>
                        <div className="w-full">
                            <label className={`block text-xs font-bold uppercase tracking-wider text-[#0A2A66] mb-2 ${verificationResult ? '' : 'ml-1'}`}>
                                Certificate ID
                            </label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={certificateId}
                                    onChange={(e) => setCertificateId(e.target.value)}
                                    placeholder="e.g. QX-A1B2C3D4"
                                    className="w-full px-5 py-4 pl-12 bg-[#f8f9fa] border border-gray-200 rounded-xl text-lg font-medium text-gray-900 
                                               focus:ring-2 focus:ring-[#0FA958]/30 focus:border-[#0FA958] outline-none transition-all shadow-inner group-hover:bg-white"
                                />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#0FA958] transition-colors" size={22} />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !certificateId.trim()}
                            className={`bg-[#0FA958] text-white rounded-xl font-bold tracking-wide hover:bg-[#0d8a47] active:scale-[0.98] transition-all shadow-lg hover:shadow-[#0FA958]/40 disabled:opacity-70 disabled:cursor-not-allowed
                                      ${verificationResult ? 'px-8 py-4 h-[62px] w-full md:w-auto' : 'w-full py-4 mt-4 text-lg'}`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verifying...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Verify Now <ArrowRight size={18} strokeWidth={2.5} />
                                </span>
                            )}
                        </button>
                    </form>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-center gap-4 text-red-800 mt-6 animate-in fade-in slide-in-from-top-2 shadow-sm">
                            <div className="bg-red-100 p-2 rounded-full flex-shrink-0">
                                <XCircle className="text-red-600" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Verification Failed</h3>
                                <p className="text-sm mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    {verificationResult && (
                        <div className="mt-8 pt-8 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex flex-col items-center justify-center text-center mb-10">
                                <div className="bg-[#e6f4ea] p-4 rounded-full mb-4 text-[#0FA958] shadow-sm animate-bounce cursor-default">
                                    <CheckCircle size={36} />
                                </div>
                                <h2 className="text-2xl font-extrabold text-[#0FA958] mb-2">Authentic Certificate</h2>
                                <p className="text-gray-600">This certificate is valid and was officially issued by Learn With Rahuul.</p>
                            </div>

                            {/* Display the Certificate */}
                            <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl border border-gray-200 bg-[#0A2A66] p-2 md:p-4">
                                <div className="overflow-auto pb-2 custom-scrollbar">
                                    <div className="min-w-[800px] md:min-w-full flex justify-center bg-white rounded-xl overflow-hidden">
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

            {/* Footer */}
            <div className="relative z-10 text-center pb-8 text-gray-500 text-sm font-medium">
                <p>&copy; {new Date().getFullYear()} Learn With Rahuul. All rights reserved.</p>
            </div>
        </div>
    );
};

export default CertificateVerification;
