
import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import type { Material } from '../types';
import { countries, projectTypes } from '../data/locations';

const mockSuppliers = [
    { id: 1, companyName: 'Prestige Woods Co.', summary: 'High-quality, sustainable hardwood flooring and custom cabinetry.', country: 'United States', city: 'New York', website: '#', specialties: ['Flooring', 'Cabinetry'] },
    { id: 2, companyName: 'Modern Lighting Inc.', summary: 'Cutting-edge lighting solutions for residential and commercial spaces.', country: 'United Kingdom', city: 'London', website: '#', specialties: ['Lighting', 'Smart Home'] },
    { id: 3, companyName: 'Stone & Slate Emporium', summary: 'Premium marble, granite, and natural stone countertops and tiles.', country: 'United States', city: 'Los Angeles', website: '#', specialties: ['Countertops', 'Tiles', 'Stone'] },
    { id: 4, companyName: 'Eco Paints & Finishes', summary: 'Eco-friendly and non-toxic paints with a wide color palette.', country: 'Australia', city: 'Sydney', website: '#', specialties: ['Paint', 'Finishes'] },
    { id: 5, companyName: 'Urban Textile House', summary: 'Designer fabrics, curtains, and upholstery for modern interiors.', country: 'Japan', city: 'Tokyo', website: '#', specialties: ['Textiles', 'Upholstery'] },
    { id: 6, companyName: 'Canadian Concrete Creations', summary: 'Bespoke concrete countertops, sinks, and furniture.', country: 'Canada', city: 'Toronto', website: '#', specialties: ['Concrete', 'Countertops'] },

];


const FindSuppliersPage: React.FC = () => {
    const location = useLocation();
    const { materials, designs, projectName } = (location.state || {}) as {
        materials: Material[];
        designs: string[];
        projectName: string;
    };

    const [details, setDetails] = useState({
        country: '',
        city: '',
        projectType: '',
        contact: '',
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setDetails(prev => ({...prev, [name]: value}));
        if (name === 'country') {
            setDetails(prev => ({ ...prev, city: '' })); // Reset city when country changes
        }
    };
    
    const availableCities = useMemo(() => {
        if (!details.country) return [];
        const selectedCountry = countries.find(c => c.name === details.country);
        return selectedCountry ? selectedCountry.cities : [];
    }, [details.country]);

    const matchingSuppliers = useMemo(() => {
        if (!details.country || !details.city) return [];
        return mockSuppliers.filter(s => s.country === details.country && s.city === details.city);
    }, [details.country, details.city]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock submission
        setIsSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-brand-dark flex flex-col">
            <Header />
            <main className="container mx-auto px-6 py-10 flex-grow">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-3">Send Project to Suppliers</h1>
                    <p className="text-lg text-gray-400 max-w-3xl mx-auto">Complete your project details below. We will send your material list and selected designs to suppliers in your project's location.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Project Details Form */}
                    <div className="lg:col-span-1">
                        <Card>
                            <h2 className="text-xl font-bold text-brand-gold mb-4">Your Project Details</h2>
                            {isSubmitted ? (
                                <div className="text-center py-8">
                                    <h3 className="text-2xl font-bold text-green-400 mb-2">Request Sent!</h3>
                                    <p className="text-gray-300">Matching suppliers have been notified. Expect to hear from them shortly via the contact number you provided.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <Input label="Project Name" id="projectName" value={projectName} readOnly disabled />
                                    <Select label="Project Type" id="projectType" name="projectType" value={details.projectType} onChange={handleDetailChange} required>
                                        <option value="">Select a type</option>
                                        {projectTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                    </Select>
                                    <Select label="Country" id="country" name="country" value={details.country} onChange={handleDetailChange} required>
                                        <option value="">Select a country</option>
                                        {countries.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                    </Select>
                                    <Select label="City" id="city" name="city" value={details.city} onChange={handleDetailChange} disabled={!details.country} required>
                                        <option value="">Select a city</option>
                                        {availableCities.map(city => <option key={city} value={city}>{city}</option>)}
                                    </Select>
                                    <Input label="WhatsApp / Telegram for Contact" id="contact" name="contact" value={details.contact} onChange={handleDetailChange} placeholder="+1234567890" required />
                                    <Button type="submit" className="w-full">Send Request to Suppliers</Button>
                                </form>
                            )}
                        </Card>
                    </div>

                    {/* Request Summary & Matching Suppliers */}
                    <div className="lg:col-span-2 space-y-8">
                         <Card>
                            <h2 className="text-xl font-bold text-white mb-4">Request Summary</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold text-brand-gold mb-2">Selected Designs ({designs?.length || 0}/3)</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        {designs?.map((src, i) => <img key={i} src={src} className="rounded-md" alt={`design ${i+1}`} />)}
                                    </div>
                                </div>
                                 <div>
                                    <h3 className="font-semibold text-brand-gold mb-2">Material List</h3>
                                    <div className="text-sm space-y-1 max-h-48 overflow-y-auto bg-brand-dark p-2 rounded-md">
                                        {materials?.map((m, i) => <p key={i} className="text-gray-300">{m.quantity} {m.unit} of {m.name}</p>)}
                                        {!materials || materials.length === 0 && <p className="text-gray-500">No material list generated.</p>}
                                    </div>
                                </div>
                            </div>
                         </Card>
                         
                         <Card>
                            <h2 className="text-xl font-bold text-white mb-4">Matching Suppliers in <span className="text-brand-gold">{details.city || '...'}</span></h2>
                            <div className="space-y-4">
                                {matchingSuppliers.length > 0 ? matchingSuppliers.map(supplier => (
                                     <div key={supplier.id} className="p-4 bg-brand-dark rounded-lg border border-gray-700">
                                        <h3 className="font-bold text-brand-light">{supplier.companyName}</h3>
                                        <p className="text-sm text-gray-400">{supplier.summary}</p>
                                    </div>
                                )) : (
                                    <p className="text-gray-400 text-center py-8">
                                        {details.city ? `No suppliers found in ${details.city}. Your request will be sent to suppliers in the wider region.` : "Please select a country and city to find matching suppliers."}
                                    </p>
                                )}
                            </div>
                         </Card>

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

export default FindSuppliersPage;