import React, { useState } from 'react';

interface LoginProps {
    onLogin: (email: string) => void;
    isLoading?: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, isLoading = false }) => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email && !isLoading) {
            onLogin(email);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#f8f9fa] to-[#eef2f7]">
            <div className="bg-white p-10 rounded-xl shadow-2xl w-96 transform transition-all hover:scale-105 border-t-4 border-[#D4AF37]">
                <div className="flex flex-col items-center justify-center mb-6 gap-3">
                    <img src="/logo2.png" alt="Learn With Rahuul" className="h-16 object-contain rounded-md" />

                </div>
                <h2 className="text-3xl font-bold mb-2 text-center text-[#0A2A66]">Welcome Back</h2>
                <p className="text-center text-gray-500 mb-8">Enter your email to access your dashboard</p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0FA958] transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full text-white p-3 rounded-lg font-bold transition-colors shadow-lg flex items-center justify-center
                            ${isLoading ? 'bg-[#0FA958] opacity-70 cursor-wait' : 'bg-[#0FA958] hover:bg-[#0c8746]'}`}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Connecting...
                            </>
                        ) : 'Login'}
                    </button>

                    {isLoading && (
                        <div className="mt-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100 animate-pulse">
                            <p className="font-semibold text-center">Please wait...</p>
                            <p className="text-xs text-center mt-1">
                                The server may be waking up from sleep mode. This can take up to 60 seconds.
                            </p>
                        </div>
                    )}

                    <p className="text-center text-xs text-gray-500 mt-4">
                        New user? Please purchase a course to register.
                    </p>
                </form>

                <div className="mt-6 text-center text-xs text-gray-400">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </div>
            </div>
        </div>
    );
};

export default Login;
