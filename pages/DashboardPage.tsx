
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
  // Mock data removed as per request for an empty initial state
  const recentProjects: { id: string, name: string, status: string, imageUrl: string }[] = [];

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col">
      <div 
        aria-hidden="true"
        className="fixed inset-0 bg-cover bg-center opacity-20" 
        style={{backgroundImage: "url('https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=2520&auto=format&fit=crop')"}}
      />
      <div className="relative flex flex-col flex-grow">
        <Header />
        <main className="container mx-auto px-6 py-10 flex-grow">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Welcome, {user?.email.split('@')[0]}!</h1>
            <Link to="/new-project">
              <Button variant="primary">Start New Project</Button>
            </Link>
          </div>

          <Card className="mb-10 bg-brand-gold/10 border-brand-gold/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-brand-gold">Trial Plan</h2>
                <p className="text-gray-300">You have 1 free project remaining. Upgrade to unlock unlimited designs.</p>
              </div>
              <Link to="/subscription">
                <Button variant="outline">Upgrade Now</Button>
              </Link>
            </div>
          </Card>

          <h2 className="text-2xl font-bold text-white mb-6">Recent Projects</h2>
          {recentProjects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentProjects.map(project => (
                <Card key={project.id} className="hover:border-brand-gold transition duration-300">
                  <img src={project.imageUrl} alt={project.name} className="rounded-lg mb-4 h-48 w-full object-cover" />
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-brand-light">{project.name}</h3>
                      <p className={`text-sm ${project.status === 'Completed' ? 'text-green-400' : 'text-yellow-400'}`}>{project.status}</p>
                    </div>
                    <Link to={`/projects`}>
                        <Button variant="secondary" className="py-2 px-4 text-sm">View</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <h3 className="text-xl text-gray-300 mb-4">No projects yet.</h3>
              <p className="text-gray-400 mb-6">Start your first project to see your design concepts come to life.</p>
              <Link to="/new-project">
                <Button variant="primary">Create Your First Project</Button>
              </Link>
            </Card>
          )}
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

export default DashboardPage;
