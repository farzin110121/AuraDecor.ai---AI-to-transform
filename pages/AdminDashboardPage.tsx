
import React from 'react';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { Link } from 'react-router-dom';

const AdminDashboardPage: React.FC = () => {
    // Mock data for demonstration
    const stats = {
        totalUsers: 142,
        activeProjects: 35,
        monthlyRevenue: 1250,
        newUsersToday: 5
    };
    
    const recentUsers = [
        { id: 1, email: 'owner@example.com', role: 'Property Owner', date: '2024-05-20' },
        { id: 2, email: 'supplier@example.com', role: 'Material Supplier', date: '2024-05-20' },
        { id: 3, email: 'new.user@example.com', role: 'Property Owner', date: '2024-05-21' },
    ];

    const recentInquiries = [
        { id: 1, from: 'john.doe@email.com', subject: 'Billing Question', snippet: 'Hi, I had a question about my last invoice...' },
        { id: 2, from: 'jane.smith@email.com', subject: 'Technical Support', snippet: 'I\'m having trouble uploading a floorplan...' },
        { id: 3, from: 'sam.wilson@email.com', subject: 'Partnership Inquiry', snippet: 'We are interested in a business partnership...' },
    ];

    return (
        <div className="min-h-screen bg-brand-dark flex flex-col">
            <Header />
            <main className="container mx-auto px-6 py-10 flex-grow">
                <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card><h3 className="text-gray-400 text-sm font-medium">Total Users</h3><p className="text-3xl font-bold text-white">{stats.totalUsers}</p></Card>
                    <Card><h3 className="text-gray-400 text-sm font-medium">Active Projects</h3><p className="text-3xl font-bold text-white">{stats.activeProjects}</p></Card>
                    <Card><h3 className="text-gray-400 text-sm font-medium">Monthly Revenue</h3><p className="text-3xl font-bold text-brand-gold">${stats.monthlyRevenue}</p></Card>
                    <Card><h3 className="text-gray-400 text-sm font-medium">New Users (24h)</h3><p className="text-3xl font-bold text-white">{stats.newUsersToday}</p></Card>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Internal Design Team Access */}
                        <Card className="bg-brand-gold/10 border-brand-gold/50">
                            <h2 className="text-2xl font-bold text-brand-gold mb-4">Internal Design Studio</h2>
                            <p className="text-gray-300 mb-6">As an admin or team member, you have unrestricted access to the AI design tools. Create and manage showcase projects or assist clients directly.</p>
                            <Link to="/design-studio/admin/internal"><Button variant="primary">Launch Unrestricted Studio</Button></Link>
                        </Card>
                        
                        {/* Recent Inquiries */}
                        <Card>
                             <h2 className="text-2xl font-bold text-white mb-6">Recent Inquiries</h2>
                             <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead><tr className="border-b border-gray-700"><th className="py-2">From</th><th className="py-2">Subject</th><th className="py-2 text-right">Actions</th></tr></thead>
                                    <tbody>
                                    {recentInquiries.map(msg => (
                                        <tr key={msg.id} className="border-b border-gray-800">
                                            <td className="py-3 pr-3 font-semibold">{msg.from}</td>
                                            <td className="py-3 pr-3 text-gray-400">{msg.subject}</td>
                                            <td className="py-3 text-right"><Button variant="secondary" className="py-1 px-3 text-sm">View</Button></td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                             </div>
                        </Card>

                        {/* User Management */}
                        <Card>
                             <h2 className="text-2xl font-bold text-white mb-6">User Management</h2>
                             <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead><tr className="border-b border-gray-700"><th className="py-2">Email</th><th className="py-2">Role</th><th className="py-2">Join Date</th><th className="py-2 text-right">Actions</th></tr></thead>
                                    <tbody>
                                    {recentUsers.map(user => (
                                        <tr key={user.id} className="border-b border-gray-800">
                                            <td className="py-3 pr-3 font-semibold">{user.email}</td>
                                            <td className="py-3 pr-3 text-gray-400">{user.role}</td>
                                            <td className="py-3 pr-3 text-gray-400">{user.date}</td>
                                            <td className="py-3 text-right"><Button variant="secondary" className="py-1 px-3 text-sm">Manage</Button></td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                             </div>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        <Card>
                            <h2 className="text-2xl font-bold text-white mb-6">Subscription Plans</h2>
                            <div className="space-y-4">
                                <div className="p-3 bg-brand-dark rounded-lg"><p className="font-semibold">Owner Pro Plan</p><p className="text-gray-400 text-sm">$20 / month</p></div>
                                <div className="p-3 bg-brand-dark rounded-lg"><p className="font-semibold">Supplier Pro Plan</p><p className="text-gray-400 text-sm">$39 / month</p></div>
                                <Button className="w-full mt-2">Edit Plans</Button>
                            </div>
                        </Card>
                        <Card>
                            <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
                            <div className="space-y-3">
                                <Button variant="outline" className="w-full">View Financial Reports</Button>
                                <Button variant="outline" className="w-full">Manage API Keys</Button>
                                <Button variant="outline" className="w-full">System Health</Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboardPage;
