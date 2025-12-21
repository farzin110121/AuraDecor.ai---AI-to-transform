
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';

const SubscriptionPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-brand-dark flex flex-col">
            <Header />
            <main className="container mx-auto px-6 py-10 flex-grow">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-3">Choose Your Plan</h1>
                    <p className="text-lg text-gray-400">Unlock more features and take your projects to the next level.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {/* Trial Plan */}
                    <Card className="flex flex-col border-gray-600">
                        <div className="flex-grow">
                            <h2 className="text-2xl font-semibold text-brand-gold mb-2">Trial</h2>
                            <p className="text-4xl font-bold mb-4">Free</p>
                            <p className="text-gray-400 mb-6">For individuals getting started.</p>
                            <ul className="space-y-3 text-gray-300">
                                <li>✓ 1 Project</li>
                                <li>✓ Basic AI Analysis</li>
                                <li>✓ Standard Design Styles</li>
                                <li>✓ Community Support</li>
                            </ul>
                        </div>
                        <Button variant="secondary" className="w-full mt-8" disabled>Your Current Plan</Button>
                    </Card>

                    {/* Pro Plan */}
                    <Card className="flex flex-col border-brand-gold border-2 relative">
                         <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                            <span className="bg-brand-gold text-brand-dark text-sm font-bold px-4 py-1 rounded-full">POPULAR</span>
                        </div>
                        <div className="flex-grow">
                            <h2 className="text-2xl font-semibold text-brand-gold mb-2">Pro</h2>
                            <p className="text-4xl font-bold mb-4">$20<span className="text-xl font-normal text-gray-400">/mo</span></p>
                            <p className="text-gray-400 mb-6">For professionals and enthusiasts.</p>
                            <ul className="space-y-3 text-gray-300">
                                <li>✓ 10 Projects per Month</li>
                                <li>✓ Advanced AI Design Generation</li>
                                <li>✓ Chat-based Design Refinement</li>
                                <li>✓ Generate Material Lists</li>
                                <li>✓ Priority Email Support</li>
                            </ul>
                        </div>
                        <Link to="/checkout" state={{ plan: 'Pro', price: 20 }} className="w-full mt-8">
                            <Button variant="primary" className="w-full">Upgrade to Pro</Button>
                        </Link>
                    </Card>

                    {/* Business Plan */}
                    <Card className="flex flex-col border-gray-600">
                        <div className="flex-grow">
                            <h2 className="text-2xl font-semibold text-brand-gold mb-2">Business</h2>
                            <p className="text-4xl font-bold mb-4">Custom</p>
                            <p className="text-gray-400 mb-6">For teams and large-scale projects.</p>
                            <ul className="space-y-3 text-gray-300">
                                <li>✓ Unlimited Projects</li>
                                <li>✓ Team Collaboration Tools</li>
                                <li>✓ Custom Style Integration</li>
                                <li>✓ API Access</li>
                                <li>✓ Dedicated Support</li>
                            </ul>
                        </div>
                        <Button variant="outline" className="w-full mt-8">Contact Sales</Button>
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

export default SubscriptionPage;