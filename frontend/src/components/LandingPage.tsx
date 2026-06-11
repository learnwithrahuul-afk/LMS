import React, { useState, useEffect } from 'react';
import './LandingPage.css';
import { CheckCircle, ChevronDown, ChevronUp, Play, Star, BookOpen, PenTool, Layers, Target, GraduationCap, Microscope, Laptop, ClipboardCheck, Download, MessageCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface LandingPageProps {
    onStart: () => void;
    onCourseClick: (courseId: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
    const [openAccordion, setOpenAccordion] = useState<number | null>(0);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [enrollData, setEnrollData] = useState({ name: '', email: '', phone: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toastState, setToastState] = useState<'hidden' | 'showing' | 'hiding'>('hidden');

    const handleEnrollSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: enrollData.name,
                    email: enrollData.email,
                    message: `Enrollment Request - Phone: ${enrollData.phone}`
                }),
            });
            const data = await response.json();
            if (data.success) {
                setToastState('showing');
                setEnrollData({ name: '', email: '', phone: '' });
                
                // Hide animation after 4.5 seconds
                setTimeout(() => setToastState('hiding'), 4500);
                // Completely unmount after 5 seconds
                setTimeout(() => setToastState('hidden'), 5000);
            } else {
                alert('Failed to send request: ' + data.message);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.1 });

        const elements = document.querySelectorAll('.animate-on-scroll');
        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    const toggleAccordion = (index: number) => {
        setOpenAccordion(openAccordion === index ? null : index);
    };

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const curriculum = [
        {
            title: "Module 1: Regulatory Foundations & GxP Compliance",
            duration: "3 Hours",
            content: "Deep-dive into FDA 21 CFR Part 11, EU Annex 11, GAMP 5 framework, and Data Integrity principles. Covers ALCOA+, Audit Trail Review, Metadata, Data Governance, and Hybrid Systems. Understand why every pharma company needs validated systems and how non-compliance leads to FDA Warning Letters, product recalls, and multi-million dollar penalties."
        },
        {
            title: "Module 2: Validation Life Cycle & V-Model Mastery",
            duration: "4 Hours",
            content: "Master the complete V-Model approach — from drafting User Requirement Specifications (URS), Functional Specifications (FS), and Design Specifications (DS) to creating a bulletproof Validation Master Plan (VMP). Includes real-world templates used at Fortune 500 pharma companies."
        },
        {
            title: "Module 3: IQ/OQ/PQ Execution & Deviation Management",
            duration: "5 Hours",
            content: "Hands-on execution of Installation Qualification (IQ), Operational Qualification (OQ), and Performance Qualification (PQ). Learn how to write test scripts, document deviations, conduct root cause analysis, and create Validation Summary Reports (VSR) that pass auditor scrutiny."
        },
        {
            title: "Module 4: CSA — The Future of Validation",
            duration: "4 Hours",
            content: "Master the FDA's modern Computer Software Assurance (CSA) approach — the risk-based methodology replacing traditional CSV. Gain hands-on experience with practical CSA Execution Examples, including Critical Thinking Worksheets, Assurance Cases, Unscripted Testing Workshops, and ready-to-use CSA Templates."
        },
        {
            title: "Module 5: Cloud, Lab & Manufacturing Systems Validation",
            duration: "6 Hours",
            content: "Validate modern platforms including Cloud CSV (Veeva Vault, Salesforce, AWS/Azure environments, SaaS), Lab Systems (HPLC, Empower, Chromeleon, LabVantage LIMS, MODA, Biovia OneLab, Waters NuGenesis), and Manufacturing Systems (MES, DeltaV, PAS-X, Syncade, PI Historian, SCADA, PLC systems, Batch Records)."
        },
        {
            title: "Bonus: Interview Prep & Placement Toolkit",
            duration: "2 Hours",
            content: "50+ real CSV interview questions with expert answers, resume optimization for pharma IT roles, LinkedIn profile strategies, mock interviews with personalized feedback, and direct job referral support to top pharma companies and CROs."
        }
    ];

    const faqs = [
        {
            question: "I have zero pharma experience — can I still succeed in this course?",
            answer: "Absolutely. This course was specifically designed for career switchers. Whether you're from general IT, QA, or are a fresh graduate — the curriculum takes you from foundational concepts to advanced, job-ready skills. Over 60% of our students had no prior pharma background and successfully transitioned into validation roles within 3-6 months."
        },
        {
            question: "What salary can I expect after completing this course?",
            answer: "CSV/CSA professionals are among the highest-paid in pharma IT. Entry-level roles start at ₹6.5-8 LPA, mid-level professionals earn ₹12-18 LPA, and senior validation consultants command ₹25-30+ LPA. With the current industry talent shortage, certified professionals are being fast-tracked into roles at companies like Cognizant, TCS, HCLTech, Accenture, and directly at pharma giants."
        },
        {
            question: "How is this different from free YouTube content or other courses?",
            answer: "Unlike generic content, this course is built by a practitioner with 13+ years of real-world experience at organizations like HCLTech, UHG (Optum), and Aurobindo Pharma. You get industry-grade templates, hands-on capstone projects, mock audit exercises, 1-on-1 interview coaching, and direct job referral support — none of which free content provides."
        },
        {
            question: "Is the certificate recognized by employers?",
            answer: "Yes. Our certificate validates your proficiency in CSV, CSA, GAMP 5, and 21 CFR Part 11 compliance — the exact skills hiring managers screen for. Students have used this certificate to land roles at top pharma companies, CROs, and IT services firms across India, Europe, and the US."
        },
        {
            question: "What if I'm already working — can I learn at my own pace?",
            answer: "100%. You get full lifetime access to all course materials, recordings, templates, and community support. Most working professionals complete the course in 6-8 weeks by dedicating 5-6 hours per week. Learn on your schedule — the content is available 24/7."
        },
        {
            question: "Do you provide job placement assistance?",
            answer: "Yes — this is a core pillar of our program. You receive dedicated interview preparation, resume building workshops, mock interviews, and active job referral support. Rahuul personally leverages his industry network to connect top performers with hiring managers at leading pharmaceutical and IT consulting companies."
        }
    ];

    return (
        <div className="landing-container">
            {toastState !== 'hidden' && (
                <div className={`custom-toast ${toastState === 'hiding' ? 'hiding' : ''}`}>
                    <div className="custom-toast-icon">
                        <CheckCircle size={20} strokeWidth={3} />
                    </div>
                    <div className="custom-toast-content">
                        <span className="custom-toast-title">Request Sent!</span>
                        <span className="custom-toast-desc">We will contact you shortly via email.</span>
                    </div>
                </div>
            )}
            {/* Header */}
            <header className="landing-header">
                <div className="logo-container">
                    <img src="/Logo.jpeg" alt="Learn With Rahuul Logo" className="header-logo-img" />
                    <span className="logo-text">Learn With Rahuul</span>
                </div>
                <nav className="nav-links">
                    <a href="#home">Home</a>
                    <a href="#about">About Course</a>
                    <a href="#curriculum">Curriculum</a>
                    <a href="#testimonials">Customers</a>
                    <a href="#contact">Contact</a>
                </nav>
                <div className="header-actions">
                    <span className="header-call">Call: +91 7036915353</span>
                    <a href="#enroll" className="cta-button secondary" style={{ textDecoration: 'none' }}>Book a Demo</a>
                    <button className="cta-button" onClick={onStart}>Enroll Now</button>
                </div>
            </header>

            {/* Hero Section */}
            <section id="home" className="hero-section">
                <div className="hero-content">
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#fffbe6', padding: '6px 12px', borderRadius: '20px', border: '1px solid #ffe58f', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', color: '#faad14' }}>
                            <Star size={16} fill="currentColor" />
                            <Star size={16} fill="currentColor" />
                            <Star size={16} fill="currentColor" />
                            <Star size={16} fill="currentColor" />
                            <Star size={16} fill="currentColor" />
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#d48806' }}>5.0 Rating by 500+ Professionals</span>
                    </div>
                    <h1 className="hero-title">
                        Break Into Pharma IT & Become a <span style={{ color: '#0FA958' }}>Certified Validation Expert</span>
                    </h1>
                    <p className="hero-subtitle">
                        The pharma industry is facing a massive CSV talent shortage. This 5-module, job-ready program transforms IT professionals and freshers into certified validation specialists — with placement support and real-world project experience.
                    </p>
                    <div className="hero-buttons">
                        <button className="cta-button" onClick={onStart}>Start Your Transformation →</button>
                        <a href="/Brouchure.pdf" download className="cta-button secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                            <Download size={18} /> Download Brochure
                        </a>
                    </div>
                </div>
                <div className="hero-image-container">
                    <div className="hero-image-wrapper">
                        <div className="hero-shape-1"></div>
                        <div className="hero-shape-2"></div>
                        <video
                            src="/download.mp4"
                            className="hero-image"
                            autoPlay
                            loop
                            muted
                            playsInline
                            style={{ display: 'block', objectFit: 'cover' }}
                        />
                    </div>
                </div>
            </section>

            {/* Tools Banner */}
            <div className="tools-banner">
                <p>Trusted by professionals working with industry-leading validation platforms:</p>
                <div className="tools-list">
                    <span>Veeva Vault</span>
                    <span>Kneat Gx</span>
                    <span>ValGenesis VLMS</span>
                    <span>HP ALM / QC</span>
                    <span>TrackWise Digital</span>
                    <span>SAP GxP</span>
                </div>
            </div>

            {/* About Instructor */}
            <section id="about" className="about-section animate-on-scroll">
                <div className="about-image-container">
                    <div className="about-image-wrapper">
                        <div className="about-shape-1"></div>
                        <div className="about-shape-2"></div>
                        <img src="/Founder.jpeg" alt="Rahuul Varma - CSV Expert" className="about-image" />
                    </div>
                </div>
                <div className="about-content">
                    <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>Learn From Working Professionals — Not Just Theorists</h2>
                    <h3 style={{ color: '#0FA958', marginBottom: '0.5rem', fontSize: '1.2rem', fontWeight: '600' }}>Rahuul Varma — 15+ Years of Real-World Hands-on Experience in Pharma IT, CSV, CSA & QMS</h3>
                    <a href="https://www.linkedin.com/in/rahuul-varma-d-793802150/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginBottom: '2rem', color: '#0077b5', fontWeight: 'bold', textDecoration: 'none', fontSize: '0.95rem' }}>View LinkedIn Profile →</a>

                    <div className="about-text-container">
                        <p className="about-text">
                            Our faculty consists of active industry professionals, not just theoretical instructors. Currently leading validation initiatives at <strong>HCLTech for LEO Pharma (Denmark)</strong>, Rahuul has built his career at industry heavyweights including <strong>UHG (Optum)</strong> and <strong>Aurobindo Pharma</strong> — managing end-to-end validation for enterprise GxP systems.
                        </p>
                        <p className="about-text">
                            You won't just learn theory; you will learn from <strong>real-life scenarios, actual audit experiences, and practical compliance frameworks</strong> that working professionals use every day. His mission: bridge the massive gap between what companies need and what candidates know.
                        </p>
                        <ul className="about-list">
                            <li><CheckCircle size={20} color="#0FA958" style={{ flexShrink: 0, marginTop: '2px' }} /> <span><strong>500+ professionals</strong> trained and placed in validation roles</span></li>
                            <li><CheckCircle size={20} color="#0FA958" style={{ flexShrink: 0, marginTop: '2px' }} /> <span>Hands-on expertise in <strong>CSV, CSA, GAMP 5, 21 CFR Part 11, QMS</strong></span></li>
                            <li><CheckCircle size={20} color="#0FA958" style={{ flexShrink: 0, marginTop: '2px' }} /> <span>Active <strong>LinkedIn thought leader</strong> with daily CSV insights</span></li>
                            <li><CheckCircle size={20} color="#0FA958" style={{ flexShrink: 0, marginTop: '2px' }} /> <span>Direct <strong>job referral network</strong> across top pharma & IT companies</span></li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Course Benefits */}
            <section className="benefits-section animate-on-scroll">
                <h2 className="section-title">Why 500+ Professionals Choose This Program</h2>
                <div className="benefits-grid">
                    <div className="benefit-card">
                        <BookOpen className="benefit-icon" />
                        <h3 className="benefit-title">Industry-Grade Curriculum</h3>
                        <p style={{ color: '#666', marginTop: '10px' }}>Covers FDA 21 CFR Part 11, EU Annex 11, GAMP 5, and the modern CSA approach — exactly what hiring managers demand.</p>
                    </div>
                    <div className="benefit-card">
                        <PenTool className="benefit-icon" />
                        <h3 className="benefit-title">Real-World Project Experience</h3>
                        <p style={{ color: '#666', marginTop: '10px' }}>Work on 3 capstone projects simulating actual pharma validation scenarios — system selection to go-live sign-off.</p>
                    </div>
                    <div className="benefit-card">
                        <Layers className="benefit-icon" />
                        <h3 className="benefit-title">50+ Templates & Frameworks</h3>
                        <p style={{ color: '#666', marginTop: '10px' }}>Downloadable VMPs, URS documents, test scripts, risk assessments, and SOPs used by Fortune 500 pharma companies.</p>
                    </div>
                    <div className="benefit-card">
                        <Target className="benefit-icon" />
                        <h3 className="benefit-title">Placement & Interview Support</h3>
                        <p style={{ color: '#666', marginTop: '10px' }}>Dedicated mock interviews, resume optimization, LinkedIn branding, and direct job referrals to top pharma & IT firms.</p>
                    </div>
                </div>
            </section>

            {/* Who is this for */}
            <section className="audience-section animate-on-scroll">
                <h2 className="section-title">Built for Ambitious Professionals Ready to Level Up</h2>
                <div className="audience-grid">
                    <div className="audience-card">
                        <div className="audience-icon-wrapper" style={{ color: '#0A2A66' }}>
                            <GraduationCap size={32} />
                        </div>
                        <h3>Freshers & Graduates</h3>
                        <p>Skip the struggle — enter pharma IT directly with validation skills that companies are desperately hiring for (₹6.5-8 LPA starting).</p>
                    </div>
                    <div className="audience-card">
                        <div className="audience-icon-wrapper" style={{ color: '#0FA958' }}>
                            <Microscope size={32} />
                        </div>
                        <h3>QA & Testing Professionals</h3>
                        <p>Upgrade from generic QA to GxP-regulated validation — the fastest path to ₹15-20 LPA in the life sciences industry.</p>
                    </div>
                    <div className="audience-card">
                        <div className="audience-icon-wrapper" style={{ color: '#0A2A66' }}>
                            <Laptop size={32} />
                        </div>
                        <h3>IT Professionals Pivoting</h3>
                        <p>Transition from saturated IT markets into the recession-proof pharma IT domain where demand outpaces supply by 3x.</p>
                    </div>
                    <div className="audience-card">
                        <div className="audience-icon-wrapper" style={{ color: '#D4AF37' }}>
                            <ClipboardCheck size={32} />
                        </div>
                        <h3>Compliance & Quality Staff</h3>
                        <p>Master CSA, audit readiness, and data integrity frameworks — become the go-to expert your organization needs.</p>
                    </div>
                </div>
            </section>

            {/* Curriculum */}
            <section id="curriculum" className="curriculum-section animate-on-scroll">
                <div className="curriculum-container">
                    <h2 className="section-title" style={{ textAlign: 'center' }}>What You'll Master — The Complete Validation Roadmap</h2>
                    <p style={{ textAlign: 'center', color: '#666', marginBottom: '3rem' }}>
                        6 comprehensive modules covering everything from regulatory foundations to job placement — designed to make you interview-ready in 8 weeks.
                    </p>

                    <div className="accordion">
                        {curriculum.map((module, index) => (
                            <div key={index} className="accordion-item">
                                <div
                                    className="accordion-header"
                                    onClick={() => toggleAccordion(index)}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <CheckCircle size={22} color="#0FA958" style={{ flexShrink: 0 }} />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: '600', color: '#0A2A66', fontSize: '1.05rem' }}>{module.title}</span>
                                            <span style={{ fontSize: '0.85rem', color: '#666', marginTop: '2px', fontWeight: '500' }}>⏱ Duration: {module.duration}</span>
                                        </div>
                                    </span>
                                    {openAccordion === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                                {openAccordion === index && (
                                    <div className="accordion-content">
                                        {module.content}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Certificate Section */}
            <section className="certificate-section animate-on-scroll">
                <div className="certificate-content">
                    <h2 className="section-title">Your Credential. Your Competitive Edge.</h2>
                    <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.1rem' }}>
                        Earn an industry-recognized certificate validating your expertise in CSV, CSA, GAMP 5, and 21 CFR Part 11 — the exact credentials hiring managers at top pharma companies are actively screening for.
                    </p>
                    <div className="certificate-image-wrapper">
                        <img src="/certificate.png" alt="CSV Certification" className="certificate-image" />
                    </div>
                </div>
            </section>

            {/* Customers / Testimonials */}
            <section id="testimonials" className="testimonials-section animate-on-scroll">
                <h2 className="section-title" style={{ color: 'white' }}>Customer Success Stories</h2>
                <div className="testimonials-grid">
                    <div className="testimonial-card">
                        <p className="testimonial-text">
                            "I was stuck in a ₹4.5 LPA QA role for 3 years. After completing Rahuul's CSV program, I landed a Validation Engineer position at ₹12 LPA within 2 months. The capstone projects and mock interviews made all the difference."
                        </p>
                        <p className="testimonial-author">— Priya Sharma, Validation Engineer at Cognizant</p>
                    </div>
                    <div className="testimonial-card">
                        <p className="testimonial-text">
                            "As a fresher with zero pharma experience, I was skeptical. But Rahuul's structured approach and placement support helped me crack interviews at 3 companies. I'm now working in CSV at a top CRO earning ₹7.5 LPA."
                        </p>
                        <p className="testimonial-author">— Ankit Reddy, CSV Analyst at IQVIA</p>
                    </div>
                    <div className="testimonial-card">
                        <p className="testimonial-text">
                            "The CSA module alone is worth the entire investment. No other course covers the FDA's risk-based approach this thoroughly. My team now treats me as the go-to compliance expert."
                        </p>
                        <p className="testimonial-author">— Sneha Kulkarni, IT Compliance Lead at Cipla</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="curriculum-section animate-on-scroll" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="curriculum-container">
                    <h2 className="section-title" style={{ textAlign: 'center' }}>Got Questions? We've Got Answers.</h2>
                    <p style={{ textAlign: 'center', color: '#666', marginBottom: '3rem' }}>
                        Here are the most common questions from professionals considering this career-changing program.
                    </p>

                    <div className="accordion">
                        {faqs.map((faq, index) => (
                            <div key={index} className="accordion-item" style={{ backgroundColor: 'white' }}>
                                <div
                                    className="accordion-header"
                                    onClick={() => toggleFaq(index)}
                                    style={{ backgroundColor: 'white' }}
                                >
                                    <span style={{ fontWeight: '600', color: '#0A2A66' }}>
                                        {faq.question}
                                    </span>
                                    {openFaq === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                                {openFaq === index && (
                                    <div className="accordion-content">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Enrollment Section */}
            <section id="enroll" className="pricing-section animate-on-scroll" style={{ padding: '5rem 5%' }}>
                <div style={{ display: 'flex', gap: '3rem', maxWidth: '950px', width: '100%', alignItems: 'stretch', flexWrap: 'wrap' }}>

                    {/* Left - Form */}
                    <div className="pricing-card" style={{ flex: 1, minWidth: '280px', margin: 0 }}>
                        <div className="pricing-badge">🔥 Limited Seats</div>
                        <h2 className="pricing-title" style={{ fontSize: '1.8rem' }}>Enroll Now</h2>
                        <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Fill in your details and we'll get you started.</p>

                        <form onSubmit={handleEnrollSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0A2A66', marginBottom: '0.4rem' }}>Full Name</label>
                                <input type="text" placeholder="Enter your full name" required value={enrollData.name} onChange={(e) => setEnrollData({...enrollData, name: e.target.value})} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.3s' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0A2A66', marginBottom: '0.4rem' }}>Email Address</label>
                                <input type="email" placeholder="Enter your email" required value={enrollData.email} onChange={(e) => setEnrollData({...enrollData, email: e.target.value})} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.3s' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0A2A66', marginBottom: '0.4rem' }}>Phone Number</label>
                                <input type="tel" placeholder="Enter your phone number" required value={enrollData.phone} onChange={(e) => setEnrollData({...enrollData, phone: e.target.value})} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.3s' }} />
                            </div>
                            <button type="submit" disabled={isSubmitting} className="cta-button pricing-cta" style={{ marginTop: '0.5rem', opacity: isSubmitting ? 0.7 : 1 }}>
                                {isSubmitting ? 'Sending Request...' : 'Secure Your Seat Now →'}
                            </button>
                        </form>
                    </div>

                    {/* Right - Details */}
                    <div style={{ flex: 1, minWidth: '280px' }}>
                        <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>What You Get</h2>
                        <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Everything you need to launch your career in pharma validation.</p>
                        <ul className="pricing-features" style={{ margin: 0 }}>
                            <li><CheckCircle size={18} color="#0FA958" /> 5 comprehensive modules + bonus placement toolkit</li>
                            <li><CheckCircle size={18} color="#0FA958" /> 3 hands-on capstone projects</li>
                            <li><CheckCircle size={18} color="#0FA958" /> 50+ downloadable templates & SOPs</li>
                            <li><CheckCircle size={18} color="#0FA958" /> Interview coaching & job referral support</li>
                            <li><CheckCircle size={18} color="#0FA958" /> Industry-recognized certificate</li>
                            <li><CheckCircle size={18} color="#0FA958" /> Full lifetime access</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Global Communities Section */}
            <section className="community-section animate-on-scroll" style={{ padding: '5rem 5%', backgroundColor: '#ffffff', textAlign: 'center' }}>
                <h2 className="section-title">Join Our Global Communities</h2>
                <p style={{ color: '#666', marginBottom: '3rem', fontSize: '1.1rem' }}>Connect with professionals, get industry updates, and find job opportunities directly on WhatsApp.</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
                    <a href="https://chat.whatsapp.com/LsyHuNyCRs74JYG2Nf2duv?mode=gi_t" target="_blank" rel="noopener noreferrer" className="community-card" style={{ textDecoration: 'none' }}>
                        <div className="community-icon-wrapper" style={{ backgroundColor: '#e6f4ea', color: '#0FA958', padding: '1rem', borderRadius: '50%', display: 'inline-block', marginBottom: '1rem' }}>
                            <MessageCircle size={32} />
                        </div>
                        <h3 style={{ color: '#0A2A66', fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 700 }}>India Community</h3>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>Join the network of CSV professionals in India.</p>
                    </a>
                    
                    <a href="https://chat.whatsapp.com/CtMFPtBCkMy8qv3kBB4axx?mode=gi_t" target="_blank" rel="noopener noreferrer" className="community-card" style={{ textDecoration: 'none' }}>
                        <div className="community-icon-wrapper" style={{ backgroundColor: '#e6f4ea', color: '#0FA958', padding: '1rem', borderRadius: '50%', display: 'inline-block', marginBottom: '1rem' }}>
                            <MessageCircle size={32} />
                        </div>
                        <h3 style={{ color: '#0A2A66', fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 700 }}>Ireland Community</h3>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>Connect with validation experts in Ireland.</p>
                    </a>
                    
                    <a href="https://chat.whatsapp.com/EmUsbRTy1s7KnN2jmJrlPZ?mode=gi_t" target="_blank" rel="noopener noreferrer" className="community-card" style={{ textDecoration: 'none' }}>
                        <div className="community-icon-wrapper" style={{ backgroundColor: '#e6f4ea', color: '#0FA958', padding: '1rem', borderRadius: '50%', display: 'inline-block', marginBottom: '1rem' }}>
                            <MessageCircle size={32} />
                        </div>
                        <h3 style={{ color: '#0A2A66', fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 700 }}>USA Community</h3>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>Network with pharma IT professionals across the US.</p>
                    </a>
                    
                    <a href="https://chat.whatsapp.com/CIXsFhFmxyq7vIGVAglbSg?mode=gi_t" target="_blank" rel="noopener noreferrer" className="community-card" style={{ textDecoration: 'none' }}>
                        <div className="community-icon-wrapper" style={{ backgroundColor: '#fff3cd', color: '#D4AF37', padding: '1rem', borderRadius: '50%', display: 'inline-block', marginBottom: '1rem' }}>
                            <MessageCircle size={32} />
                        </div>
                        <h3 style={{ color: '#0A2A66', fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 700 }}>Jobs & Opportunities</h3>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>Exclusive CSV job postings and referrals.</p>
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer id="contact" className="footer">
                <div style={{ marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <h4 style={{ textAlign: 'center', color: '#a0aec0', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>Our Alumni Work At</h4>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', opacity: 0.7, fontWeight: 'bold', fontSize: '1.2rem' }}>
                        <span>Cognizant</span>
                        <span>TCS</span>
                        <span>HCLTech</span>
                        <span>Accenture</span>
                        <span>IQVIA</span>
                        <span>Cipla</span>
                    </div>
                </div>

                <div className="footer-logo-container">
                    <img src="/Logo.jpeg" alt="Learn With Rahuul" className="footer-logo" />
                    <span className="footer-logo-text">Learn With Rahuul</span>
                </div>
                <h3 className="footer-text">Your Career Transformation Starts Here</h3>

                <div className="footer-links">
                    <a href="#contact">Contact Us</a>
                    <a href="/privacy-policy">Privacy Policy</a>
                    <a href="/terms-of-service">Terms of Service</a>
                </div>

                <div className="footer-bottom">
                    &copy; {new Date().getFullYear()} Learn With Rahuul. All rights reserved.
                </div>
            </footer>
            {/* LinkedIn Floating Button */}
            <a href="https://www.linkedin.com/in/rahuul-varma-d-793802150/" target="_blank" rel="noopener noreferrer" className="linkedin-float">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                </svg>
            </a>
            {/* WhatsApp Floating Button */}
            <a href="https://wa.me/917036915353" target="_blank" rel="noopener noreferrer" className="whatsapp-float">
                <svg viewBox="0 0 24 24" fill="currentColor" width="30" height="30">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
            </a>
        </div>
    );
};

export default LandingPage;
