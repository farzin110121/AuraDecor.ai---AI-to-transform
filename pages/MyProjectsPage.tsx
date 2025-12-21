
import React from 'react';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { Link } from 'react-router-dom';

const MyProjectsPage: React.FC = () => {
    // Mock data removed for a clean initial state
    const projects: { id: string, name: string, status: string, imageUrl: string }[] = [];

    return (
        <div className="min-h-screen bg-brand-dark flex flex-col">
            <Header />
            <main className="container mx-auto px-6 py-10 flex-grow">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">My Projects</h1>
                     <Link to="/new-project">
                        <Button variant="primary">Start New Project</Button>
                    </Link>
                </div>

                {projects.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map(project => (
                            <Card key={project.id} className="hover:border-brand-gold transition duration-300 flex flex-col">
                                <img src={project.imageUrl} alt={project.name} className="rounded-lg mb-4 h-48 w-full object-cover" />
                                <div className="flex-grow flex flex-col">
                                    <div className="flex-grow">
                                        <h3 className="text-xl font-semibold text-brand-light">{project.name}</h3>
                                        <p className={`text-sm ${project.status === 'Completed' ? 'text-green-400' : 'text-yellow-400'}`}>{project.status}</p>
                                    </div>
                                    <div className="mt-4">
                                        <Link to={`/design-studio/proj123/space456`}>
                                            <Button variant="secondary" className="w-full">Open Project</Button>
                                        </Link>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="text-center py-16">
                        <h3 className="text-2xl text-gray-300 mb-4">No Projects Found</h3>
                        <p className="text-gray-400 mb-6 max-w-md mx-auto">It looks like you haven't created any projects yet. Click the button below to start your first interior design project.</p>
                        <Link to="/new-project">
                            <Button variant="primary">Create Your First Project</Button>
                        </Link>
                    </Card>
                )}
            </main>
            <footer className="bg-brand-gray py-6">
                <div className="container mx-auto px-6 text-center text-gray-400">
                    © {new Date().getFullYear()} PEYTAM-AI. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default MyProjectsPage;
