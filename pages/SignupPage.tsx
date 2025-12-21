
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Property Owner' | 'Material Supplier'>('Property Owner');
  const [error, setError] = useState<string | React.ReactNode>('');
  const navigate = useNavigate();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    // Check for existing mock users
    const mockUsers = ['owner@example.com', 'supplier@example.com', 'admin@example.com'];
    if (mockUsers.includes(email)) {
      setError(
        <span>
          This account already exists. Please <Link to="/login" className="text-brand-gold underline font-semibold">log in</Link>.
        </span>
      );
      return;
    }

    // In a real app, you would call your backend here to register the user
    // and send a verification email. For now, we simulate this by
    // redirecting to the verification page.
    navigate('/verify-email', { state: { email, password, role } });
  };
  
  const handleGoogleSignup = () => {
     // In a real app, this would trigger the Google OAuth flow.
     // For now, we simulate a successful signup and verification.
     const { login } = useAuth();
     const user = { id: 'google-user', email: 'google.user@example.com', role: role };
     login(user);
     navigate(role === 'Property Owner' ? '/dashboard' : '/supplier-dashboard');
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex justify-center mb-6">
          <h1 className="text-3xl font-bold text-brand-gold">AuraDecor.ai</h1>
        </Link>
        <Card>
          <h2 className="text-2xl font-bold text-center text-brand-light mb-2">Create an Account</h2>
          <p className="text-center text-gray-400 mb-6">Join the future of interior design.</p>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleSignup} className="space-y-6">
            <Input id="email" label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">I am a...</label>
              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => setRole('Property Owner')} className={`p-4 rounded-lg border-2 ${role === 'Property Owner' ? 'border-brand-gold bg-brand-gold/10' : 'border-gray-600'}`}>Property Owner</button>
                <button type="button" onClick={() => setRole('Material Supplier')} className={`p-4 rounded-lg border-2 ${role === 'Material Supplier' ? 'border-brand-gold bg-brand-gold/10' : 'border-gray-600'}`}>Material Supplier</button>
              </div>
            </div>
            
            <Button type="submit" variant="primary" className="w-full">Sign Up</Button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="mx-4 text-gray-400">OR</span>
            <div className="flex-grow border-t border-gray-600"></div>
          </div>
          
          <Button onClick={handleGoogleSignup} variant="secondary" className="w-full flex items-center justify-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.153,44,30.024,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
            </svg>
            Sign Up with Google
          </Button>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account? <Link to="/login" className="text-brand-gold hover:underline">Log In</Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;
