import React, { useEffect } from 'react';

const PrivacyPolicy: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-8 md:p-16">
            <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
                <h1 className="text-4xl font-extrabold text-slate-900 mb-8">Privacy Policy</h1>
                
                <div className="space-y-6 text-lg leading-relaxed text-slate-600">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>
                    
                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 mb-3 mt-8">1. Introduction</h2>
                        <p>Welcome to Learn With Rahuul. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice or our practices with regard to your personal information, please contact us at learnwithrahuul@gmail.com.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 mb-3 mt-8">2. Information We Collect</h2>
                        <p>We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, or otherwise contact us.</p>
                        <ul className="list-disc pl-6 mt-3 space-y-2">
                            <li><strong>Personal Information Provided by You:</strong> We collect names; phone numbers; email addresses; and other similar information.</li>
                            <li><strong>Payment Data:</strong> We may collect data necessary to process your payment if you make purchases, such as your payment instrument number, and the security code associated with your payment instrument. All payment data is stored by our payment processors.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 mb-3 mt-8">3. How We Use Your Information</h2>
                        <p>We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>
                        <ul className="list-disc pl-6 mt-3 space-y-2">
                            <li>To facilitate account creation and logon process.</li>
                            <li>To fulfill and manage your orders.</li>
                            <li>To send administrative information to you.</li>
                            <li>To post testimonials.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 mb-3 mt-8">4. Will Your Information Be Shared?</h2>
                        <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We do not sell your personal information to third parties.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 mb-3 mt-8">5. How Long Do We Keep Your Information?</h2>
                        <p>We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements).</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 mb-3 mt-8">6. How Do We Keep Your Information Safe?</h2>
                        <p>We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 mb-3 mt-8">7. Contact Us</h2>
                        <p>If you have questions or comments about this notice, you may email us at learnwithrahuul@gmail.com.</p>
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

export default PrivacyPolicy;
