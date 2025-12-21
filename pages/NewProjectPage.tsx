
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import { analyzeFloorplan } from '../services/geminiService';
import type { CanonicalSpatialMap, CSMRoom } from '../types';

type Step = 'details' | 'analysis' | 'style' | 'generation';

const DESIGN_STYLES = ["Modern", "Luxury", "Scandinavian", "Minimalist", "Industrial", "Bohemian", "Japanese Minimalism", "Art Deco"];


// Helper function for client-side image resizing
const resizeImage = (file: File, maxDimension: number = 768): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Canvas toBlob failed'));
            }
            // Create a new file with a .jpg extension
            const resizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          },
          'image/jpeg',
          0.70 // 70% quality
        );
      };
      img.onerror = reject;
      if (event.target?.result) {
        img.src = event.target.result as string;
      } else {
        reject(new Error("FileReader failed to read the file."));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};


const NewProjectPage: React.FC = () => {
  const [step, setStep] = useState<Step>('details');
  const [projectName, setProjectName] = useState('');
  const [floorplanFile, setFloorplanFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csm, setCsm] = useState<CanonicalSpatialMap | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<CSMRoom | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingImage(true);
      setError(null);
      // Revoke previous URL to prevent memory leaks
      if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
      }
      setFloorplanFile(null);
      setPreviewUrl(null);

      try {
        const resizedFile = await resizeImage(file);
        setFloorplanFile(resizedFile);
        setPreviewUrl(URL.createObjectURL(resizedFile));
      } catch (err) {
        console.error("Image resize failed:", err);
        setError("Failed to process image. Please try a different JPG or PNG file.");
      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!floorplanFile) {
      setError("Please upload a floorplan image.");
      return;
    }
    if (!projectName.trim()) {
        setError("Please enter a project name.");
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeFloorplan(floorplanFile);
      setCsm(result);
      setStep('analysis');
    } catch (err: any) {
      setError(err.message || "An unknown error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectRoom = (room: CSMRoom) => {
    setSelectedRoom(room);
    setStep('style');
  };

  const handleGenerateDesign = async () => {
    if(!csm || !selectedRoom || !selectedStyle) {
        setError("Missing details for design generation.");
        return;
    }
    // Navigate to design studio, passing the CSM and selected room.
    navigate('/design-studio/proj123/space456', { state: { csm, selectedRoom, selectedStyle, floorplanUrl: previewUrl, projectName } });
  };


  const renderStep = () => {
    switch (step) {
      case 'details':
        return (
          <Card>
            <h2 className="text-2xl font-bold mb-6 text-center">Step 1: Project Details & Upload</h2>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <Input id="projectName" label="Project Name" type="text" placeholder="e.g., Downtown Loft Renovation" value={projectName} onChange={(e) => setProjectName(e.target.value)} required />
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Upload Floorplan (JPG/PNG)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {isProcessingImage ? (
                        <div className="flex flex-col items-center justify-center h-48">
                            <svg className="animate-spin h-8 w-8 text-brand-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="mt-2 text-gray-400">Optimizing image...</p>
                        </div>
                    ) : previewUrl ? 
                        <img src={previewUrl} alt="Floorplan Preview" className="mx-auto h-48 w-auto"/> :
                        <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    }
                    <div className="flex text-sm text-gray-400">
                      <label htmlFor="file-upload" className={`relative cursor-pointer bg-brand-gray rounded-md font-medium text-brand-gold hover:text-yellow-400 focus-within:outline-none ${isProcessingImage ? 'opacity-50' : ''}`}>
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} disabled={isProcessingImage}/>
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
                  </div>
                </div>
              </div>
              <Button type="button" onClick={handleAnalyze} disabled={isLoading || isProcessingImage || !floorplanFile} className="w-full">
                {isLoading ? "Analyzing..." : (isProcessingImage ? "Processing..." : "Analyze Floorplan")}
              </Button>
            </form>
          </Card>
        );
      case 'analysis':
        return (
            <Card>
                <h2 className="text-2xl font-bold mb-6 text-center">Step 2: AI Analysis Complete</h2>
                <p className="text-center text-gray-400 mb-6">The AI has generated a Canonical Spatial Map. Select a room to design.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {csm?.rooms.map(room => (
                        <button key={room.id} onClick={() => handleSelectRoom(room)} className="p-6 bg-brand-dark border border-gray-700 rounded-lg text-left hover:border-brand-gold transition">
                            <h3 className="text-xl font-semibold text-brand-gold">{room.name}</h3>
                            <p className="text-gray-300">Area: {room.area.toFixed(2)} m²</p>
                            <p className="text-gray-400">Classification: {room.classification}</p>
                        </button>
                    ))}
                </div>
            </Card>
        );
      case 'style':
        return (
            <Card>
                <h2 className="text-2xl font-bold mb-6 text-center">Step 3: Room & Style Selection</h2>
                <p className="text-center text-gray-400 mb-2">You've selected: <span className="text-brand-gold font-semibold">{selectedRoom?.name}</span></p>
                <p className="text-center text-gray-400 mb-6">Now, choose an interior design style.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {DESIGN_STYLES.map(style => (
                        <button key={style} onClick={() => setSelectedStyle(style)} className={`p-4 rounded-lg border-2 text-center transition ${selectedStyle === style ? 'border-brand-gold bg-brand-gold/10' : 'border-gray-600 hover:border-gray-500'}`}>
                            {style}
                        </button>
                    ))}
                </div>
                 <Button onClick={handleGenerateDesign} disabled={!selectedStyle} className="w-full mt-8">
                    Generate Initial Design
                </Button>
            </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col">
      <Header />
      <main className="container mx-auto px-6 py-10 flex-grow flex justify-center">
        <div className="w-full max-w-2xl">
          {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6 text-center">{error}</div>}
          {renderStep()}
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

export default NewProjectPage;
