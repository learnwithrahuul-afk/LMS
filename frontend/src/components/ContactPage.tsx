import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import { CheckCircle } from 'lucide-react';

const ContactPage: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [toastState, setToastState] = useState<'hidden' | 'showing' | 'hiding'>('hidden');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (data.success) {
                setToastState('showing');
                setFormData({ name: '', email: '', message: '' });
                setTimeout(() => setToastState('hiding'), 4500);
                setTimeout(() => setToastState('hidden'), 5000);
            } else {
                alert('Failed to send message: ' + data.message);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 font-sans p-12">
            {toastState !== 'hidden' && (
                <div className={`custom-toast ${toastState === 'hiding' ? 'hiding' : ''}`}>
                    <div className="custom-toast-icon">
                        <CheckCircle size={20} strokeWidth={3} />
                    </div>
                    <div className="custom-toast-content">
                        <span className="custom-toast-title">Message Sent!</span>
                        <span className="custom-toast-desc">We will get back to you shortly.</span>
                    </div>
                </div>
            )}
            <h1 className="text-4xl font-bold text-white mb-6">Contact Us</h1>
            <p className="mb-8 text-lg">Have questions? We'd love to hear from you.</p>

            <form onSubmit={handleSubmit} className="max-w-xl bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-800">
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Message</label>
                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    ></textarea>
                </div>
                <button type="submit" disabled={loading} className={`w-full font-bold py-3 rounded-lg transition-colors ${loading ? 'bg-blue-400 cursor-not-allowed text-slate-200' : 'bg-blue-600 text-white hover:bg-blue-500'}`}>
                    {loading ? 'Sending...' : 'Send Message'}
                </button>
            </form>
        </div>
    );
};

export default ContactPage;
