
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/Button';
import Card from '../components/Card';
import { generateDesign, generateMaterialList, refineDesign } from '../services/geminiService';
import type { CanonicalSpatialMap, CSMRoom, Material } from '../types';
import Select from '../components/Select';

type Tab = 'design' | 'materials';
type ChatMessage = { sender: 'AI' | 'User'; text: string; };

const DesignStudioPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { csm, selectedRoom: initialRoom, selectedStyle, projectName } = (location.state || {}) as {
    csm: CanonicalSpatialMap;
    selectedRoom: CSMRoom;
    selectedStyle: string;
    floorplanUrl: string;
    projectName: string;
  };
  
  const [currentRoom, setCurrentRoom] = useState<CSMRoom | null>(initialRoom);
  const [activeTab, setActiveTab] = useState<Tab>('design');
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [versions, setVersions] = useState<string[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isGeneratingMaterials, setIsGeneratingMaterials] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  
  const [selectedFinalDesigns, setSelectedFinalDesigns] = useState<string[]>([]);


  const handleGenerateInitialDesign = useCallback(async (room: CSMRoom, style: string) => {
    if (!csm || !room || !style) {
      setError("Design parameters are missing.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setMainImage(null);
    setVersions([]);
    setMaterials([]);
    setChatHistory([{ sender: 'AI', text: `Generating your initial design for the ${room.name} in a ${style} style. This may take a moment...` }]);
    setSelectedFinalDesigns([]);

    try {
      const imageUrl = await generateDesign(csm, room.name, style);
      setMainImage(imageUrl);
      setVersions([imageUrl]);
      setChatHistory(prev => [...prev, { sender: 'AI', text: "Here is your initial design, precisely matched to your floorplan. You can now request changes.\n\n**IMPORTANT:** You can change materials (e.g., 'make the floor hardwood'), colors ('paint wall_01 light gray'), and furniture ('change the sofa to a leather one'). Structural changes (moving walls, doors, windows) and the camera angle are locked for accuracy." }]);
    } catch (err: any) {
      setError(err.message || "Failed to generate design.");
       setChatHistory(prev => [...prev, { sender: 'AI', text: `Sorry, I encountered an error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  }, [csm]);

  useEffect(() => {
    if (currentRoom && selectedStyle) {
      handleGenerateInitialDesign(currentRoom, selectedStyle);
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoom, selectedStyle]);


  const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roomName = e.target.value;
    const newRoom = csm.rooms.find(r => r.name === roomName);
    if(newRoom) {
      setCurrentRoom(newRoom);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !mainImage) return;

    const newUserMessage: ChatMessage = { sender: 'User', text: chatInput };
    setChatHistory(prev => [...prev, newUserMessage]);
    setChatInput('');
    setIsRefining(true);
    setError(null);

    try {
        const result = await refineDesign(chatInput, csm, mainImage);
        if (result.imageUrl) {
            setMainImage(result.imageUrl);
            setVersions(prev => [...prev, result.imageUrl]);
            setChatHistory(prev => [...prev, { sender: 'AI', text: 'Here is the updated design. What would you like to change next?' }]);
        } else if (result.explanation) {
            setChatHistory(prev => [...prev, { sender: 'AI', text: `I couldn't make that change: ${result.explanation}` }]);
        } else {
             throw new Error("The AI returned an unexpected response.");
        }
    } catch (err: any) {
        setError(err.message || "Failed to refine design.");
        setChatHistory(prev => [...prev, { sender: 'AI', text: `Sorry, an error occurred: ${err.message}` }]);
    } finally {
        setIsRefining(false);
    }
  };
  
  const handleGetMaterials = async () => {
    if(!mainImage) return;
    setIsGeneratingMaterials(true);
    setError(null);
    try {
        const materialList = await generateMaterialList(mainImage);
        setMaterials(materialList);
    } catch (err: any) {
        setError(err.message || "Failed to generate material list.");
    } finally {
        setIsGeneratingMaterials(false);
    }
  };

  const handleFinalDesignSelect = (imageUrl: string) => {
    setSelectedFinalDesigns(prev => {
        if(prev.includes(imageUrl)) {
            return prev.filter(item => item !== imageUrl);
        } else {
            if(prev.length < 3) {
                return [...prev, imageUrl];
            }
            return prev; // Limit to 3
        }
    });
  };

  const handleSendToSuppliers = () => {
    navigate('/find-suppliers', { state: { materials, designs: selectedFinalDesigns, projectName } });
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col">
      <Header />
      <main className="container mx-auto px-6 py-10 flex-grow">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{projectName} - {currentRoom?.name || "Design Studio"}</h1>
                    <p className="text-gray-400">Style: <span className="font-semibold text-brand-gold">{selectedStyle || "N/A"}</span></p>
                </div>
                {csm?.rooms && csm.rooms.length > 1 && (
                    <div className="w-1/3">
                        <Select id="space-switcher" label="Switch Room" value={currentRoom?.name} onChange={handleRoomChange}>
                            {csm.rooms.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                        </Select>
                    </div>
                )}
            </div>

            <Card className="p-0">
                <div className="flex border-b border-gray-700">
                    <button onClick={() => setActiveTab('design')} className={`px-6 py-3 font-semibold ${activeTab === 'design' ? 'text-brand-gold border-b-2 border-brand-gold' : 'text-gray-400'}`}>Design</button>
                    <button onClick={() => setActiveTab('materials')} className={`px-6 py-3 font-semibold ${activeTab === 'materials' ? 'text-brand-gold border-b-2 border-brand-gold' : 'text-gray-400'}`}>Materials</button>
                </div>
                <div className="p-6">
                    {error && <div className="bg-red-900/50 border border-red-700 text-red-300 flex items-center justify-center rounded-lg p-4 mb-4"><p>{error}</p></div>}
                    {activeTab === 'design' && (
                        <div>
                             {isLoading && <div className="aspect-video bg-brand-gray animate-pulse flex items-center justify-center rounded-lg"><p>Generating your design...</p></div>}
                             {mainImage && !isLoading && <img src={mainImage} alt="Generated Design" className="w-full rounded-lg mb-4" />}
                        </div>
                    )}
                    {activeTab === 'materials' && (
                        <div>
                            <Button onClick={handleGetMaterials} disabled={isGeneratingMaterials || !mainImage}>
                                {isGeneratingMaterials ? 'Generating...' : 'Generate Material List from Image'}
                            </Button>
                            {materials.length > 0 && (
                                <>
                                <table className="w-full mt-6 text-left">
                                    <thead>
                                        <tr className="border-b border-gray-700">
                                            <th className="py-2">Item</th>
                                            <th className="py-2">Description</th>
                                            <th className="py-2 text-right">Quantity</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {materials.map((mat, index) => (
                                        <tr key={index} className="border-b border-gray-800">
                                            <td className="py-3 pr-3 font-semibold">{mat.name}</td>
                                            <td className="py-3 pr-3 text-gray-400">{mat.description}</td>
                                            <td className="py-3 text-right">{mat.quantity} {mat.unit}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                                <div className="text-center mt-8">
                                    <Button variant="primary" onClick={handleSendToSuppliers}>Find Suppliers for these Materials</Button>
                                </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </Card>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
                <h3 className="text-xl font-semibold mb-4">Refine with Chat</h3>
                <div className="space-y-4">
                   <div className="bg-brand-dark p-3 rounded-lg text-sm text-gray-300 h-48 overflow-y-auto whitespace-pre-wrap">
                        {chatHistory.map((msg, i) => (
                           <p key={i} className="mb-2"><span className={`font-bold ${msg.sender === 'AI' ? 'text-brand-gold' : 'text-gray-300'}`}>{msg.sender}:</span> {msg.text}</p>
                        ))}
                        {isRefining && <p className="text-brand-gold animate-pulse">AI is thinking...</p>}
                   </div>
                   <form onSubmit={handleChatSubmit}>
                       <input type="text" placeholder='e.g., "change wall_01 to blue"' value={chatInput} onChange={e => setChatInput(e.target.value)} disabled={isRefining || !mainImage} className="w-full bg-brand-dark border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-brand-gold disabled:opacity-50" />
                       <Button type="submit" variant="secondary" className="w-full mt-2" disabled={isRefining || !mainImage}>Send</Button>
                   </form>
                </div>
            </Card>

            {csm?.elements && (
                <Card>
                    <h3 className="text-xl font-semibold mb-4">Object Legend</h3>
                    <div className="h-32 overflow-y-auto space-y-2 text-sm">
                        {csm.elements.map(obj => (
                            <div key={obj.id} className="flex justify-between p-2 bg-brand-dark rounded">
                                <span className="text-gray-300">{obj.description}</span>
                                <span className="font-mono text-brand-gold">{obj.id}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <Card>
                <h3 className="text-xl font-semibold mb-4">Design Album (Select up to 3)</h3>
                <div className="grid grid-cols-2 gap-4 h-64 overflow-y-auto">
                    {versions.map((v, i) => (
                        <div key={i} className="relative cursor-pointer group" onClick={() => handleFinalDesignSelect(v)}>
                            <img src={v} alt={`Version ${i+1}`} className={`rounded-md transition-all ${selectedFinalDesigns.includes(v) ? 'ring-2 ring-brand-gold' : 'opacity-70 group-hover:opacity-100'}`} />
                             <div className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${selectedFinalDesigns.includes(v) ? 'bg-brand-gold' : 'bg-brand-gray/50'}`}>
                                {selectedFinalDesigns.includes(v) && <svg className="w-3 h-3 text-brand-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                            </div>
                        </div>
                    ))}
                </div>
                {selectedFinalDesigns.length > 0 && (
                    <div className="flex gap-4 mt-4">
                        <Button variant="outline" className="w-full">Download Selected</Button>
                        <Button variant="primary" className="w-full" onClick={handleSendToSuppliers}>Send to Suppliers</Button>
                    </div>
                )}
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

export default DesignStudioPage;
    