
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';

const SupplierSubscriptionPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-brand-dark flex flex-col">
            <Header />
            <main className="container mx-auto px-6 py-10 flex-grow">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-3">Supplier &amp; Contractor Plans</h1>
                    <p className="text-lg text-gray-400">Connect with active projects and grow your business.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                    {/* Free Plan */}
                    <Card className="flex flex-col border-gray-600">
                        <div className="flex-grow">
                            <h2 className="text-2xl font-semibold text-brand-gold mb-2">Basic</h2>
                            <p className="text-4xl font-bold mb-4">Free</p>
                            <p className="text-gray-400 mb-6">Get listed and see project requests.</p>
                            <ul className="space-y-3 text-gray-300">
                                <li>✓ Create Supplier Profile</li>
                                <li>✓ Get listed in Supplier Directory</li>
                                <li>✓ Receive Material Request Notifications</li>
                                <li className="text-gray-500">✗ View full project details</li>
                                <li className="text-gray-500">✗ Contact property owners</li>
                            </ul>
                        </div>
                        <Button variant="secondary" className="w-full mt-8" disabled>Your Current Plan</Button>
                    </Card>

                    {/* Pro Plan */}
                    <Card className="flex flex-col border-brand-gold border-2 relative">
                         <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                            <span className="bg-brand-gold text-brand-dark text-sm font-bold px-4 py-1 rounded-full">GET STARTED</span>
                        </div>
                        <div className="flex-grow">
                            <h2 className="text-2xl font-semibold text-brand-gold mb-2">Professional</h2>
                            <p className="text-4xl font-bold mb-4">$39<span className="text-xl font-normal text-gray-400">/mo</span></p>
                            <p className="text-gray-400 mb-6">Unlock full access to connect & bid.</p>
                            <ul className="space-y-3 text-gray-300">
                                <li>✓ Create Supplier Profile</li>
                                <li>✓ Get listed in Supplier Directory</li>
                                <li>✓ Receive Material Request Notifications</li>
                                <li>✓ View full project details</li>
                                <li>✓ Contact property owners directly</li>
                                <li>✓ Get featured placement</li>
                            </ul>
                        </div>
                        <Link to="/checkout" state={{ plan: 'Supplier Professional', price: 39 }} className="w-full mt-8">
                           <Button variant="primary" className="w-full">Subscribe Now</Button>
                        </Link>
                    </Card>
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

export default SupplierSubscriptionPage;