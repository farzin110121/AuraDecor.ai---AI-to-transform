
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import { useAuth } from '../contexts/AuthContext';
import { countries } from '../data/locations';

const SupplierDashboardPage: React.FC = () => {
    const { user } = useAuth();
    // Mock data removed for a clean initial state
    const materialRequests: { id: string, projectName: string, material: string, quantity: string }[] = [];
    const [isSubscribed, setIsSubscribed] = useState(false); // This will be managed globally in a real app

    const [profile, setProfile] = useState({
        managerName: '',
        companyName: '',
        country: '',
        city: '',
        portfolio: '',
        summary: '',
        instagram: '',
        whatsapp: '',
        website: ''
    });
    const [isProfileSaved, setIsProfileSaved] = useState(false);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));

        if (name === 'country') {
            setProfile(prev => ({ ...prev, city: '' })); // Reset city when country changes
        }
    };
    
    const availableCities = useMemo(() => {
        if (!profile.country) return [];
        const selectedCountry = countries.find(c => c.name === profile.country);
        return selectedCountry ? selectedCountry.cities : [];
    }, [profile.country]);

    const saveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProfileSaved(true);
    };

    return (
        <div className="min-h-screen bg-brand-dark flex flex-col">
            <div 
                aria-hidden="true"
                className="fixed inset-0 bg-cover bg-center opacity-20" 
                style={{backgroundImage: "url('https://images.unsplash.com/photo-1593104547489-5cfb3839a3b5?q=80&w=2520&auto=format&fit=crop')"}}
            />
            <div className="relative flex flex-col flex-grow">
                <Header />
                <main className="container mx-auto px-6 py-10 flex-grow">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-white">Supplier Dashboard</h1>
                    </div>

                    {!isSubscribed && (
                        <Card className="mb-8 bg-brand-gold/10 border-brand-gold/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-brand-gold">Activate Your Profile</h2>
                                    <p className="text-gray-300">Subscribe to view project details, connect with property owners, and get featured.</p>
                                </div>
                                <Link to="/supplier-subscription">
                                    <Button variant="outline">View Subscription Plans</Button>
                                </Link>
                            </div>
                        </Card>
                    )}
                    
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main column */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Profile Section */}
                            <Card>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-white">My Supplier Profile</h2>
                                    {isProfileSaved && (
                                        <Button variant="secondary" onClick={() => setIsProfileSaved(false)}>Edit Profile</Button>
                                    )}
                                </div>

                                {isProfileSaved ? (
                                    <div className="space-y-3 text-gray-300">
                                        <p><strong>Company:</strong> {profile.companyName}</p>
                                        <p><strong>Manager:</strong> {profile.managerName}</p>
                                        <p><strong>Location:</strong> {profile.city}, {profile.country}</p>
                                        <p><strong>Website:</strong> <a href={profile.website} className="text-brand-gold hover:underline">{profile.website}</a></p>
                                        <p><strong>Instagram:</strong> <span className="text-brand-light">{profile.instagram}</span></p>
                                        <p><strong>WhatsApp/Telegram:</strong> <span className="text-brand-light">{profile.whatsapp}</span></p>
                                        <p className="pt-2"><strong>Summary:</strong><br/>{profile.summary}</p>
                                    </div>
                                ) : (
                                    <form onSubmit={saveProfile} className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <Input label="Company Name" id="companyName" name="companyName" value={profile.companyName} onChange={handleProfileChange} />
                                            <Input label="Manager Name" id="managerName" name="managerName" value={profile.managerName} onChange={handleProfileChange} />
                                        </div>
                                         <div className="grid md:grid-cols-2 gap-4">
                                            <Select label="Country of Operation" id="country" name="country" value={profile.country} onChange={handleProfileChange}>
                                                <option value="">Select a country</option>
                                                {countries.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                            </Select>
                                            <Select label="Primary City" id="city" name="city" value={profile.city} onChange={handleProfileChange} disabled={!profile.country}>
                                                <option value="">Select a city</option>
                                                {availableCities.map(city => <option key={city} value={city}>{city}</option>)}
                                            </Select>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <Input label="Website URL" type="url" id="website" name="website" value={profile.website} onChange={handleProfileChange} />
                                            <Input label="Portfolio URL" type="url" id="portfolio" name="portfolio" value={profile.portfolio} onChange={handleProfileChange} />
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <Input label="Instagram Handle" id="instagram" name="instagram" value={profile.instagram} onChange={handleProfileChange} />
                                            <Input label="WhatsApp/Telegram" id="whatsapp" name="whatsapp" value={profile.whatsapp} onChange={handleProfileChange} />
                                        </div>
                                        <div>
                                            <label htmlFor="summary" className="block text-sm font-medium text-gray-300 mb-2">Summary of Records/Resume</label>
                                            <textarea id="summary" name="summary" value={profile.summary} onChange={handleProfileChange} rows={4} className="w-full bg-brand-gray border border-gray-600 rounded-lg px-4 py-3 text-brand-light focus:outline-none focus:ring-2 focus:ring-brand-gold"></textarea>
                                        </div>
                                        <Button type="submit" className="w-full">Save Profile</Button>
                                    </form>
                                )}
                            </Card>

                            {/* Material Requests Section */}
                            <Card>
                                <h2 className="text-2xl font-bold text-white mb-6">Recent Material Requests</h2>
                                <div className="space-y-4 relative">
                                    {materialRequests.length > 0 ? materialRequests.map(req => (
                                        <div key={req.id} className="p-4 bg-brand-dark rounded-lg flex justify-between items-center border border-gray-700">
                                            <div>
                                                <p className="font-semibold text-brand-light">{req.material} - <span className="text-brand-gold">{req.quantity}</span></p>
                                                <p className="text-sm text-gray-400">For project: {req.projectName}</p>
                                            </div>
                                            <Button variant="outline" className="py-1 px-3 text-sm">View Details</Button>
                                        </div>
                                    )) : <p className="text-gray-400 text-center py-8">No new material requests.</p>}
                                    
                                    {!isSubscribed && (
                                        <div className="absolute inset-0 bg-brand-gray/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg">
                                            <h3 className="text-xl font-bold text-white mb-2">Unlock Full Access</h3>
                                            <p className="text-gray-300 mb-4">Subscribe to view and respond to requests.</p>
                                            <Link to="/supplier-subscription">
                                                <Button>Upgrade Your Plan</Button>
                                            </Link>
                                        </div>
                                    )}
                            </div>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-6">Accounting</h2>
                            <Card>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                                        <span className="text-gray-300">Subscription Plan</span>
                                        <span className={`font-semibold text-lg ${isSubscribed ? 'text-green-400' : 'text-yellow-400'}`}>{isSubscribed ? 'Pro' : 'Free'}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                                        <span className="text-gray-300">Monthly Revenue</span>
                                        <span className="font-semibold text-2xl text-brand-gold">$0.00</span>
                                    </div>
                                    <div>
                                        <p className="text-gray-300">Next Payout</p>
                                        <p className="font-semibold text-lg text-brand-light mt-1">-</p>
                                    </div>
                                    <Button variant='secondary' className='w-full'>View Financials</Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </main>
                <footer className="bg-brand-gray/80 backdrop-blur-sm py-6">
                    <div className="container mx-auto px-6 text-center text-gray-400">
                        © {new Date().getFullYear()} PEYTAM-AI. All rights reserved.
                    </div>
                </footer>
            </div>
        </div>
    );
};
export default SupplierDashboardPage;