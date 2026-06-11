import React, { useEffect } from 'react';

const TermsOfService: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-8 md:p-16">
            <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
                <h1 className="text-4xl font-extrabold text-slate-900 mb-8">Terms of Service</h1>
                
                <div className="space-y-6 text-lg leading-relaxed text-slate-600">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>
                    
                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 mb-3 mt-8">1. Agreement to Terms</h2>
                        <p>By accessing our website and using our services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 mb-3 mt-8">2. Use License</h2>
                        <p>Permission is granted to temporarily download one copy of the materials (information or software) on Learn With Rahuul's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                        <ul className="list-disc pl-6 mt-3 space-y-2">
                            <li>Modify or copy the materials;</li>
                            <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                            <li>Attempt to decompile or reverse engineer any software contained on the website;</li>
                            <li>Remove any copyright or other proprietary notations from the materials; or</li>
                            <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
                        </ul>
                        <p className="mt-4">This license shall automatically terminate if you violate any of these restrictions and may be terminated by Learn With Rahuul at any time.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 mb-3 mt-8">3. Disclaimer</h2>
                        <p>The materials on Learn With Rahuul's website are provided on an 'as is' basis. Learn With Rahuul makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 mb-3 mt-8">4. Limitations</h2>
                        <p>In no event shall Learn With Rahuul or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the website, even if Learn With Rahuul or a authorized representative has been notified orally or in writing of the possibility of such damage.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 mb-3 mt-8">5. Accuracy of Materials</h2>
                        <p>The materials appearing on Learn With Rahuul's website could include technical, typographical, or photographic errors. Learn With Rahuul does not warrant that any of the materials on its website are accurate, complete or current. We may make changes to the materials contained on its website at any time without notice.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 mb-3 mt-8">6. Modifications</h2>
                        <p>Learn With Rahuul may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.</p>
                    </section>
                    
                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 mb-3 mt-8">7. Governing Law</h2>
                        <p>These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.</p>
                    </section>
                </div>
                
                <div className="mt-12 pt-8 border-t border-slate-200">
                    <a href="/" className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                        &larr; Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
