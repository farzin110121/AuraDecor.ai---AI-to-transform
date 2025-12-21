
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Logo from '../components/Logo';

const teamMembers = [
    { name: 'Alex Johnson', role: 'CEO & Founder', imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&auto=format&fit=crop' },
    { name: 'Samantha Carter', role: 'Head of Design', imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=300&auto=format&fit=crop' },
    { name: 'Benjamin Lee', role: 'Lead AI Engineer', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop' },
];

const ContactPage: React.FC = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would send data to a backend.
        // For now, we just show a success message.
        setIsSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-brand-dark flex flex-col">
            <header className="bg-brand-dark/80 backdrop-blur-sm sticky top-0 z-50">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3 text-2xl font-bold text-brand-gold">
                        <Logo />
                        <span className="hidden sm:inline">AuraDecor.ai</span>
                    </Link>
                    <div>
                        <Link to="/login" className="text-gray-300 hover:text-brand-gold mr-6">Login</Link>
                        <Link to="/signup">
                            <Button variant="primary">Sign Up</Button>
                        </Link>
                    </div>
                </nav>
            </header>
            
            <main className="container mx-auto px-6 py-16 flex-grow">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-extrabold text-white mb-3">Get in Touch</h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">We're here to help. Whether you have a question about our features, pricing, or anything else, our team is ready to answer all your questions.</p>
                </div>

                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-start">
                    {/* Contact Form */}
                    <Card>
                        {isSubmitted ? (
                            <div className="text-center py-12">
                                <h2 className="text-2xl font-bold text-brand-gold mb-3">Thank You!</h2>
                                <p className="text-gray-300">Your message has been sent successfully. Our team will get back to you shortly.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <h2 className="text-2xl font-bold text-center text-white mb-6">Send us a Message</h2>
                                <Input label="Full Name" id="name" required />
                                <Input label="Email Address" id="email" type="email" required />
                                <Input label="Subject" id="subject" required />
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                                    <textarea id="message" rows={5} required className="w-full bg-brand-gray border border-gray-600 rounded-lg px-4 py-3 text-brand-light focus:outline-none focus:ring-2 focus:ring-brand-gold"></textarea>
                                </div>
                                <Button type="submit" className="w-full">Send Message</Button>
                            </form>
                        )}
                    </Card>

                    {/* Contact Info */}
                    <div className="space-y-6 text-center md:text-left">
                        <div className="bg-brand-gray p-6 rounded-lg border border-gray-700">
                             <h3 className="text-xl font-semibold text-brand-gold mb-2">Support</h3>
                             <p className="text-gray-400">Our support team is available 24/7.</p>
                             <a href="mailto:support@auradecor.ai" className="text-brand-light hover:underline">support@auradecor.ai</a>
                        </div>
                        <div className="bg-brand-gray p-6 rounded-lg border border-gray-700">
                             <h3 className="text-xl font-semibold text-brand-gold mb-2">General Inquiries</h3>
                             <p className="text-gray-400">For partnerships and other inquiries.</p>
                             <a href="mailto:contact@auradecor.ai" className="text-brand-light hover:underline">contact@auradecor.ai</a>
                        </div>
                    </div>
                </div>

                {/* Meet the Team Section */}
                <div className="text-center mt-24">
                    <h2 className="text-4xl font-bold text-white mb-12">Meet the Team</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        {teamMembers.map(member => (
                            <div key={member.name}>
                                <img src={member.imageUrl} alt={member.name} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />
                                <h3 className="text-xl font-semibold text-white">{member.name}</h3>
                                <p className="text-brand-gold">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <footer className="bg-brand-gray py-6">
                <div className="container mx-auto px-6 text-center text-gray-400">
                    © {new Date().getFullYear()} PEYTAM-AI. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default ContactPage;
