
export interface User {
  id: string;
  email: string;
  role: 'Property Owner' | 'Material Supplier' | 'Admin';
}

export interface Project {
  id: string;
  name: string;
  type: string;
  country: string;
  city: string;
  floorplanUrl: string;
  status: 'Analysis' | 'Design' | 'Completed';
  createdAt: Date;
  analysis?: CanonicalSpatialMap; // Updated to use CSM
}

// Canonical Spatial Map (CSM) Interfaces
export interface CSMElement {
  id: string;
  type: 'wall' | 'door' | 'window' | 'fixed_equipment' | 'column' | 'stairs';
  position: { x: number; y: number };
  dimensions: { length: number; width: number; thickness?: number };
  rotation: number;
  doorType?: 'swing' | 'sliding';
  doorSwingArc?: { start: number; end: number };
  windowSillHeight?: number;
  description: string;
}

export interface CSMRoom {
  id: string;
  name: string;
  classification: string;
  area: number;
  inferredCeilingHeight: number;
  connectivity: string[];
  adjacency: string[];
  elements: string[];
}

export interface CanonicalSpatialMap {
  elements: CSMElement[];
  rooms: CSMRoom[];
  circulationPaths: { start: {x:number, y:number}, end: {x:number, y:number} }[];
}


export interface Design {
  id: string;
  imageUrl: string;
  style: string;
  version: number;
  materials: Material[];
}

export interface Material {
  name: string;
  description: string;
  quantity: number;
  unit: string;
}