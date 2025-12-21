
import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';

const VerifyEmailPage: React.FC = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { email, role } = location.state || {};

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send the code to your backend for verification.
    // For this MVP, we'll mock a successful verification with any 6-digit code.
    if (code.length === 6 && /^\d+$/.test(code)) {
      const user = { id: Date.now().toString(), email, role };
      login(user);
      navigate(role === 'Property Owner' ? '/dashboard' : '/supplier-dashboard');
    } else {
      setError('Please enter a valid 6-digit verification code.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <h2 className="text-2xl font-bold text-center text-brand-light mb-2">Verify Your Email</h2>
          <p className="text-center text-gray-400 mb-6">
            We've sent a 6-digit code to <span className="font-semibold text-brand-gold">{email}</span>. Please enter it below.
          </p>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label htmlFor="code" className="sr-only">Verification Code</label>
              <input
                id="code"
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full text-center text-3xl tracking-[1.5em] bg-brand-dark border border-gray-600 rounded-lg px-4 py-3 text-brand-light focus:outline-none focus:ring-2 focus:ring-brand-gold"
                required
              />
            </div>
            <Button type="submit" variant="primary" className="w-full">Verify &amp; Create Account</Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Didn't receive a code? <button className="text-brand-gold hover:underline">Resend Code</button>
            </p>
             <p className="text-sm mt-4">
              <Link to="/signup" className="text-gray-500 hover:underline">Back to Sign Up</Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
