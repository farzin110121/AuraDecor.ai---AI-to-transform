
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Logo from '../components/Logo';

const LandingPage: React.FC = () => {
  return (
    <div className="bg-brand-dark min-h-screen text-brand-light">
      <header className="absolute top-0 left-0 right-0 z-10">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 text-2xl font-bold text-brand-gold">
            <Logo />
            <span>AuraDecor.ai</span>
          </Link>
          <div>
            <Link to="/contact" className="text-gray-300 hover:text-brand-gold mr-6">Contact</Link>
            <Link to="/login" className="text-gray-300 hover:text-brand-gold mr-6">Login</Link>
            <Link to="/signup">
              <Button variant="primary">Sign Up</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30" 
          style={{backgroundImage: `url(https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1920&auto=format&fit=crop)`}}
        ></div>
        <div className="relative z-10 text-center px-4">
          <h2 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-4">
            Transform Your Space with AI
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Upload your floorplan, and let our generative AI create stunning, hyper-realistic interior designs in minutes.
          </p>
          <Link to="/signup">
            <Button variant="primary" className="text-lg px-8 py-4">Get Started for Free</Button>
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-brand-gray">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-4xl font-bold text-white mb-4">How It Works</h3>
          <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
            A simple, four-step process to visualize your dream interior.
          </p>
          <div className="grid md:grid-cols-4 gap-10">
            <div className="bg-brand-dark p-8 rounded-xl border border-gray-700">
              <div className="text-4xl text-brand-gold mb-4">1</div>
              <h4 className="text-xl font-semibold mb-2">Upload Floorplan</h4>
              <p className="text-gray-400">Provide your project details and a JPG/PNG of your floorplan.</p>
            </div>
            <div className="bg-brand-dark p-8 rounded-xl border border-gray-700">
              <div className="text-4xl text-brand-gold mb-4">2</div>
              <h4 className="text-xl font-semibold mb-2">AI Analysis</h4>
              <p className="text-gray-400">Our AI analyzes your layout, identifying spaces, dimensions, and features.</p>
            </div>
            <div className="bg-brand-dark p-8 rounded-xl border border-gray-700">
              <div className="text-4xl text-brand-gold mb-4">3</div>
              <h4 className="text-xl font-semibold mb-2">Select Style</h4>
              <p className="text-gray-400">Choose a space and select from a gallery of professional design styles.</p>
            </div>
            <div className="bg-brand-dark p-8 rounded-xl border border-gray-700">
              <div className="text-4xl text-brand-gold mb-4">4</div>
              <h4 className="text-xl font-semibold mb-2">Generate Design</h4>
              <p className="text-gray-400">Watch as the AI generates photorealistic concepts for your space.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section id="marketplace" className="py-20 bg-brand-dark">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-4xl font-bold text-white mb-4">A Marketplace for Design Professionals</h3>
          <p className="text-gray-400 mb-12 max-w-3xl mx-auto">
            AuraDecor.ai is more than a design tool—it's a professional ecosystem. We bridge the gap between property owners' visions and the suppliers who can bring them to life.
          </p>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-brand-gray p-8 rounded-xl border border-gray-700">
              <h4 className="text-xl font-semibold mb-2 text-brand-gold">Connect Directly</h4>
              <p className="text-gray-400">Property owners can send generated material lists to our network of vetted suppliers to get quotes, fostering direct and efficient communication.</p>
            </div>
            <div className="bg-brand-gray p-8 rounded-xl border border-gray-700">
              <h4 className="text-xl font-semibold mb-2 text-brand-gold">Secure Transactions</h4>
              <p className="text-gray-400">Our platform integrates a secure payment system, ensuring that suppliers and contractors are paid reliably upon project milestones.</p>
            </div>
            <div className="bg-brand-gray p-8 rounded-xl border border-gray-700">
              <h4 className="text-xl font-semibold mb-2 text-brand-gold">Grow Your Business</h4>
              <p className="text-gray-400">For suppliers, AuraDecor.ai is a direct channel to active, qualified leads. Showcase your materials and services to clients at the exact moment they're making decisions.</p>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="bg-brand-gray py-8">
        <div className="container mx-auto px-6 text-center text-gray-400">
          <Link to="/contact" className="hover:text-brand-gold">Contact Us</Link>
          <span className="mx-2">|</span>
          © {new Date().getFullYear()} PEYTAM-AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;