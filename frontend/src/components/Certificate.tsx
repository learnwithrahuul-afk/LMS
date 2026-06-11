import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Share2, Download, Award } from 'lucide-react';
import { translations } from '../translations';
import { API_BASE_URL } from '../config';
import QRCode from 'qrcode';

interface CertificateProps {
    userName: string;
    courseName: string;
    courseId?: string;
    language?: string;
    certificateId?: string;
    date?: string;
    userEmail?: string;
}

const Certificate: React.FC<CertificateProps> = ({
    userName,
    courseName,
    courseId,
    language = 'ENGLISH',
    certificateId,
    date = new Date().toLocaleDateString(),
    userEmail
}) => {
    const certificateRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const t = translations[language as keyof typeof translations] || translations.ENGLISH;

    // --- ID STABILITY LOGIC ---
    // Create a key bound to user and course to persist ID
    const storageKey = userEmail ? `cert_id_${userEmail.replace(/[^a-zA-Z0-9]/g, '')}_${(courseId || courseName).replace(/[^a-zA-Z0-9]/g, '')}` : null;

    // 1. Initialize stableId from localStorage (if exists) or generate new fallback
    const [stableId] = useState(() => {
        if (certificateId) return certificateId;
        if (storageKey) {
            const cached = localStorage.getItem(storageKey);
            if (cached) return cached;
        }
        return 'LWR-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    });

    const [backendCertId, setBackendCertId] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    // Prioritize Backend ID > Stable Local ID
    const finalCertificateId = backendCertId || stableId;

    // Persist fallback stableId immediately to prevent regeneration on refresh
    useEffect(() => {
        if (storageKey && !localStorage.getItem(storageKey)) {
            localStorage.setItem(storageKey, stableId);
        }
    }, [stableId, storageKey]);

    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [scale, setScale] = useState(1);

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://learnwithrahuul.com';
    // Use the verification URL pointing to our frontend route
    const verificationUrl = `${origin}/verify/${finalCertificateId}`;

    useEffect(() => {
        const createOrFetchCertificate = async () => {
            // If ID is explicitly passed (e.g. from verification view), use it.
            if (certificateId) return;
            if (!userEmail) return;

            setIsSyncing(true);
            try {
                console.log(`Fetching certificate for ${userEmail}...`);

                const response = await fetch(`${API_BASE_URL}/api/certificate/issue`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: userEmail,
                        courseName: courseName,
                        courseId: courseId
                    })
                });

                const data = await response.json();

                if (data.success && data.certificate) {
                    const realId = data.certificate.certificateId;
                    setBackendCertId(realId);

                    // Update localStorage with real ID to ensure future consistency
                    if (storageKey) {
                        localStorage.setItem(storageKey, realId);
                    }
                }
            } catch (error) {
                console.error("Failed to issue/fetch certificate:", error);
            } finally {
                setIsSyncing(false);
            }
        };

        createOrFetchCertificate();
    }, [userEmail, courseName, courseId, certificateId, storageKey, stableId]);

    // --- AUTO EMAIL LOGIC ---
    useEffect(() => {
        const sendCertificateEmail = async () => {
            // Only proceed if we have a verified backend ID and user email. 
            // Also check userName/courseName to ensure data is populated.
            if (!backendCertId || !userEmail || !userName || !courseName) return;

            // Check localStorage to prevent spamming on refresh
            const emailKey = `email_sent_${backendCertId}`;
            if (localStorage.getItem(emailKey)) return;

            // Wait for fonts/layout to settle
            await document.fonts.ready;
            // Add a small delay to ensure rendering is complete
            await new Promise(resolve => setTimeout(resolve, 2000));

            if (certificateRef.current) {
                try {
                    console.log("Generating certificate image for email...");

                    // Capture logic - must match download logic for high quality
                    // We temporarily reset styles to 1:1 scale for the capture
                    const originalTransform = certificateRef.current.style.transform;
                    const originalMargin = certificateRef.current.style.margin;
                    const originalLeft = certificateRef.current.style.left;

                    // Force reset for capture
                    certificateRef.current.style.transform = 'scale(1)';
                    certificateRef.current.style.margin = '0 auto';
                    certificateRef.current.style.left = '0';

                    const canvas = await html2canvas(certificateRef.current, {
                        scale: 1.5, // Lower scale than download (2 or 3) to keep payload manageable
                        useCORS: true,
                        logging: false,
                        backgroundColor: '#ffffff',
                        width: 1123,
                        height: 794,
                        windowWidth: 1123,
                        windowHeight: 794
                    });

                    // Convert to base64
                    const imageData = canvas.toDataURL('image/jpeg', 0.8); // JPEG is smaller than PNG

                    // Restore styles
                    certificateRef.current.style.transform = originalTransform;
                    certificateRef.current.style.margin = originalMargin;
                    certificateRef.current.style.left = originalLeft;

                    console.log("Sending email...");
                    // Send to Backend
                    const response = await fetch(`${API_BASE_URL}/api/certificate/email`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: userEmail,
                            studentName: userName,
                            courseName: courseName,
                            courseId: courseId,
                            certificateId: backendCertId,
                            imageData: imageData
                        })
                    });

                    const resData = await response.json();
                    if (response.ok && resData.success) {
                        console.log("Certificate email sent successfully.");
                        localStorage.setItem(emailKey, 'true');
                        // Optional: alert or toast
                        // alert("A copy of your certificate has been emailed to you!");
                    } else {
                        console.error("Failed to send email:", resData);
                    }

                } catch (error) {
                    console.error("Error auto-emailing certificate:", error);
                }
            }
        };

        sendCertificateEmail();
    }, [backendCertId, userEmail, userName, courseName]);

    useEffect(() => {
        // Generate QR code as data URL for reliable rendering in html2canvas
        QRCode.toDataURL(verificationUrl, { margin: 0, width: 80, color: { dark: '#000000', light: '#ffffff' } })
            .then(url => setQrCodeUrl(url))
            .catch(err => console.error('Error generating QR code', err));
    }, [verificationUrl]);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const parentWidth = containerRef.current.parentElement?.clientWidth || window.innerWidth;
                const certificateWidth = 1123;
                // Add some padding/margin consideration
                const availableWidth = parentWidth - 40;

                if (availableWidth < certificateWidth) {
                    setScale(availableWidth / certificateWidth);
                } else {
                    setScale(1);
                }
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const downloadCertificate = async () => {
        if (certificateRef.current) {
            try {
                // Temporarily reset scale and centering to ensure clean capture
                const originalTransform = certificateRef.current.style.transform;
                const originalMargin = certificateRef.current.style.margin;
                const originalLeft = certificateRef.current.style.left;
                const originalOrigin = certificateRef.current.style.transformOrigin;

                // Force reset for capture
                certificateRef.current.style.transform = 'scale(1)';
                certificateRef.current.style.margin = '0 auto'; // Center horizontally if needed
                certificateRef.current.style.left = '0';
                certificateRef.current.style.transformOrigin = 'top left';

                // Small delay to let browser reflow
                await new Promise(resolve => setTimeout(resolve, 200));

                const canvas = await html2canvas(certificateRef.current, {
                    scale: 3, // High resolution
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff', // Force white background
                    width: 1123,
                    height: 794,
                    windowWidth: 1123,
                    windowHeight: 794,
                    x: 0,
                    y: 0
                });

                // Restore styles
                certificateRef.current.style.transform = originalTransform;
                certificateRef.current.style.margin = originalMargin;
                certificateRef.current.style.left = originalLeft;
                certificateRef.current.style.transformOrigin = originalOrigin || 'top center';

                const dataUrl = canvas.toDataURL('image/png', 1.0);
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = `${userName.replace(/\s+/g, '_')}_Certificate.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                console.error("Certificate download failed:", error);
                alert("Failed to download certificate. Please try again.");
            }
        }
    };

    const shareOnLinkedIn = () => {
        let issueYear = new Date().getFullYear();
        let issueMonth = new Date().getMonth() + 1;

        try {
            const parsedDate = new Date(date);
            if (!isNaN(parsedDate.getTime())) {
                issueYear = parsedDate.getFullYear();
                issueMonth = parsedDate.getMonth() + 1;
            }
        } catch (e) {
            console.error("Error parsing date for LinkedIn", e);
        }

        const baseUrl = 'https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME';
        const params = new URLSearchParams({
            name: courseName,
            organizationName: 'Learn With Rahuul',
            issueYear: issueYear.toString(),
            issueMonth: issueMonth.toString(),
            certUrl: verificationUrl,
            certId: finalCertificateId
        });

        window.open(`${baseUrl}&${params.toString()}`, '_blank');
    };

    return (
        <div className="flex flex-col items-center justify-start p-4 md:p-8 w-full" ref={containerRef}>
            {/* Custom Premium Styles for Certificate */}
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Montserrat:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&display=swap');

                    @keyframes wrapperEntrance {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    .premium-cert-wrapper {
                        animation: wrapperEntrance 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }

                    .skill-badge {
                        transition: all 0.3s ease;
                    }
                    
                    .premium-cert-container:hover .skill-badge {
                        transform: scale(1.08);
                        filter: drop-shadow(0 6px 12px rgba(16, 185, 129, 0.25));
                    }

                    .cert-title {
                        font-family: 'Cinzel', serif;
                    }

                    .cert-name {
                        font-family: 'Playfair Display', serif;
                    }

                    .cert-text {
                        font-family: 'Montserrat', sans-serif;
                    }
                `}
            </style>

            <div className="mb-8 text-center w-full max-w-2xl">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">{t.congrats}</h2>
                <p className="text-sm md:text-base text-gray-600">{t.congratsMsg}</p>
            </div>

            <div
                className="relative mb-8 flex justify-center overflow-visible premium-cert-wrapper"
                style={{
                    width: '100%',
                    height: `${794 * scale}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {/* Certificate Container */}
                <div
                    ref={certificateRef}
                    className="relative text-gray-800 shadow-2xl flex flex-col justify-between box-border origin-top select-none overflow-hidden premium-cert-container p-[52px]"
                    style={{
                        width: '1123px',
                        height: '794px',
                        minWidth: '1123px',
                        minHeight: '794px',
                        transform: `scale(${scale})`,
                        background: '#ffffff'
                    }}
                >
                    {/* SVG Corner Wave Borders with Gradients */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 1123 794" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            {/* Blue wave gradient */}
                            <linearGradient id="blueWaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#5bb5e8" />
                                <stop offset="100%" stopColor="#1c7eb5" />
                            </linearGradient>
                            
                            {/* Gold wave gradient */}
                            <linearGradient id="goldWaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#f6d365" />
                                <stop offset="100%" stopColor="#dca122" />
                            </linearGradient>
                            
                            {/* Magenta wave gradient */}
                            <linearGradient id="magentaWaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#c8389d" />
                                <stop offset="100%" stopColor="#7e115e" />
                            </linearGradient>
                            
                            {/* Purple wave gradient */}
                            <linearGradient id="purpleWaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#7c35ab" />
                                <stop offset="100%" stopColor="#3a105c" />
                            </linearGradient>
                        </defs>

                        {/* Top-Right Blue Wave */}
                        <path d="M 520 -10 C 650 90, 850 210, 1133 210 L 1133 -10 Z" fill="url(#blueWaveGrad)" />
                        
                        {/* Top-Left Gold Wave */}
                        <path d="M -10 -10 L 650 -10 C 500 50, 200 120, -10 320 Z" fill="url(#goldWaveGrad)" />
                        
                        {/* Bottom-Right Magenta Wave */}
                        <path d="M 1133 500 C 950 650, 700 780, 320 804 L 1133 804 Z" fill="url(#magentaWaveGrad)" />
                        
                        {/* Bottom-Left Purple Wave */}
                        <path d="M -10 620 C 150 600, 350 720, 680 804 L -10 804 Z" fill="url(#purpleWaveGrad)" />
                    </svg>

                    {/* Content Area */}
                    <div className="w-full h-full flex flex-col justify-between relative z-20">
                        
                        {/* Top Section */}
                        <div className="flex flex-col items-center mt-2">
                            {/* Logo */}
                            <div className="mb-4">
                                <img src="/Logo.jpeg" alt="CSV Logo" className="h-16 object-contain" />
                            </div>

                            <h1 className="text-[44px] font-black text-[#0f2942] tracking-[0.1em] uppercase leading-none mb-1 text-center cert-title">
                                Certificate
                            </h1>
                            <div className="flex justify-center items-center gap-2 mt-0.5">
                                <span className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#c5a059]"></span>
                                <span className="text-base italic text-[#c5a059] cert-name">of Completion & Achievement</span>
                                <span className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#c5a059]"></span>
                            </div>
                        </div>

                        {/* Student Name */}
                        <div className="text-center mt-3">
                            <span className="text-[11px] uppercase tracking-[0.2em] text-gray-400 block mb-1 cert-text font-semibold">This is to certify that</span>
                            <h2 className="text-[44px] text-[#0f2942] tracking-wide leading-none mt-2 cert-name font-bold italic">
                                {userName}
                            </h2>
                        </div>

                        {/* Description Section */}
                        <div className="text-center mt-2 max-w-3xl mx-auto">
                            <p className="text-gray-400 text-[11px] italic mb-1.5 cert-name">
                                has successfully completed the curriculum and demonstrated expertise in the program
                            </p>
                            <h3 className="text-[32px] font-bold text-[#0f2942] tracking-[0.05em] leading-tight max-w-4xl mx-auto uppercase cert-title">
                                {courseName}
                            </h3>
                        </div>

                        {/* Skills Hexagonal Badges */}
                        <div className="flex flex-col items-center mt-2">
                            <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-[#0a6635] bg-emerald-50 px-4 py-1 rounded-full border border-emerald-100/80 shadow-sm mb-3 cert-text">
                                Verified Competencies
                            </span>
                            <div className="flex justify-center gap-24">
                                {/* Skill 1 */}
                                <div className="flex flex-col items-center w-48 text-center">
                                    <div className="relative w-14 h-16 flex items-center justify-center mb-1.5">
                                        <svg className="absolute inset-0 w-full h-full filter drop-shadow-sm skill-badge" viewBox="0 0 100 115" xmlns="http://www.w3.org/2000/svg">
                                            <defs>
                                                <linearGradient id="badgeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#10b981" />
                                                    <stop offset="100%" stopColor="#047857" />
                                                </linearGradient>
                                            </defs>
                                            <polygon points="50,5 95,30 95,85 50,110 5,85 5,30" fill="url(#badgeGrad1)" stroke="#c5a059" strokeWidth="4" />
                                        </svg>
                                        <svg className="w-6 h-6 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-bold text-[#0f2942] tracking-wide leading-tight max-w-[140px] cert-text">
                                        GAMP 5 & 21 CFR Part 11 Compliance
                                    </span>
                                </div>

                                {/* Skill 2 */}
                                <div className="flex flex-col items-center w-48 text-center">
                                    <div className="relative w-14 h-16 flex items-center justify-center mb-1.5">
                                        <svg className="absolute inset-0 w-full h-full filter drop-shadow-sm skill-badge" viewBox="0 0 100 115" xmlns="http://www.w3.org/2000/svg">
                                            <defs>
                                                <linearGradient id="badgeGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#10b981" />
                                                    <stop offset="100%" stopColor="#047857" />
                                                </linearGradient>
                                            </defs>
                                            <polygon points="50,5 95,30 95,85 50,110 5,85 5,30" fill="url(#badgeGrad2)" stroke="#c5a059" strokeWidth="4" />
                                        </svg>
                                        <svg className="w-6 h-6 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-bold text-[#0f2942] tracking-wide leading-tight max-w-[140px] cert-text">
                                        Validation Lifecycle & SDLC Documentation
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer (Date & Signatures) */}
                        <div className="flex justify-between items-end px-4 mt-2">
                            {/* Left Column: Date & QR Verification */}
                            <div className="flex items-center gap-4 w-80">
                                <div className="bg-white p-1 border-2 border-[#c5a059] rounded shadow-md flex-shrink-0">
                                    {qrCodeUrl ? (
                                        <img src={qrCodeUrl} alt="Verify" className="w-18 h-18" />
                                    ) : (
                                        <div className="w-18 h-18 bg-gray-100"></div>
                                    )}
                                </div>
                                <div className="text-left">
                                    <p className="text-base font-bold text-[#0f2942] cert-text">{date}</p>
                                    <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 cert-text">Date of Completion</p>
                                </div>
                            </div>

                            {/* Right Column: Rahul Varma Signature */}
                            <div className="text-right w-72 flex flex-col items-end">
                                <div className="h-10 flex items-end justify-end mb-1">
                                    <img src="/Rahul.png" alt="Signature" className="max-h-full object-contain filter contrast-125 scale-110" />
                                </div>
                                <div className="w-40 h-[1.5px] bg-[#c5a059] mb-1 opacity-70"></div>
                                <p className="text-[13px] font-bold text-[#0f2942] leading-none cert-text">Rahuul Varma</p>
                                <p className="text-[9px] uppercase font-bold tracking-wider text-gray-400 mt-1 cert-text">Program Manager & Founder</p>
                            </div>
                        </div>

                        {/* Bottom line: Verification Details */}
                        <div className="w-full border-t border-gray-100 pt-2 flex flex-col items-center justify-center mt-2.5">
                            <p className="text-[9px] text-gray-400 font-mono tracking-wide text-center cert-text">
                                Verify at: <a href={verificationUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600 font-sans">{verificationUrl}</a>
                            </p>
                            <p className="text-[8px] text-gray-400 uppercase tracking-widest mt-0.5 cert-text">Certificate ID: {finalCertificateId}</p>
                        </div>
                    </div>
                </div>
            </div>


            
            <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6 w-full max-w-md md:max-w-none">
                <button onClick={downloadCertificate} className="flex items-center justify-center space-x-2 bg-[#1e3a8a] text-white px-8 py-3 rounded-full hover:bg-[#172554] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    <Download size={20} />
                    <span>{t.downloadCert}</span>
                </button>
                <button onClick={shareOnLinkedIn} className="flex items-center justify-center space-x-2 bg-[#0077b5] text-white px-8 py-3 rounded-full hover:bg-[#006097] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    <Share2 size={20} />
                    <span>{t.shareLinkedIn}</span>
                </button>
            </div>
        </div>
    );
};

export default Certificate;
