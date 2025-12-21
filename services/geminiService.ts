
import { GoogleGenAI, Type } from "@google/genai";
import type { CanonicalSpatialMap, Material } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const base64ToGenerativePart = (base64String: string) => {
    const [mimePart, dataPart] = base64String.split(',');
    const mimeType = mimePart.split(':')[1].split(';')[0];
    return {
        inlineData: { data: dataPart, mimeType },
    };
};

// Helper to identify errors that are worth retrying
const isTransientError = (error: any): boolean => {
    if (error && typeof error === 'object' && 'message' in error) {
        const msg = String(error.message).toLowerCase();
        // 429 (rate limit), 500 (server error), or other network-related issues
        return msg.includes('rate limit') || msg.includes('429') || msg.includes('500') || msg.includes('rpc failed');
    }
    return false;
};

// Helper to create a user-friendly error message from a generic error
const createApiError = (error: any, context: string): Error => {
    console.error(`Error during ${context}:`, error);
    if (error && typeof error === 'object' && 'message' in error) {
        const msg = String(error.message).toLowerCase();
        if (msg.includes('rate limit') || msg.includes('429')) {
            return new Error(`The service is currently busy due to high demand. Please wait a moment and try again. (Context: ${context})`);
        }
        if (msg.includes('500') || msg.includes('rpc failed')) {
            // Special message for the most common 500 error cause
            if (context === 'floorplan analysis') {
                return new Error("A server error occurred during analysis. This often happens with very large or complex floorplan images, even after automatic optimization. Please try using a simpler floorplan or a smaller image file and try again.");
            }
            return new Error(`A server error occurred during ${context}. This can be due to temporary service issues. Please try again in a few moments.`);
        }
        // Return the original error message if it's not a recognized transient error
        return new Error(String(error.message));
    }
    return new Error(`An unknown error occurred during ${context}.`);
};


export const analyzeFloorplan = async (floorplanImage: File): Promise<CanonicalSpatialMap> => {
  const model = "gemini-3-flash-preview";
  const prompt = `You are a specialist AI architect. Your task is to analyze the provided floorplan image and convert it into a structured Canonical Spatial Map (CSM) JSON object with extreme precision. Your analysis must be a 1:1 digital twin of the provided image.

**CRITICAL RULES FOR ACCURACY:**
1.  **Absolute Fidelity:** You MUST ONLY map what is explicitly visible in the floorplan. DO NOT add, invent, or hallucinate any architectural elements (walls, doors, windows, etc.) that are not present. Conversely, you MUST NOT omit any visible elements.
2.  **Precise Placement:** The position and dimensions of every element must be calculated with the highest possible accuracy to reflect their true location on the 1000x1000 grid. This includes fixed equipment like sinks, stoves, or HVAC units shown in the plan.

**Analysis and Structuring Instructions:**
1.  **Examine the Image:** Meticulously identify every structural element (walls, doors, windows, columns, stairs) and every piece of fixed equipment. Identify every distinct room or space.
2.  **Assign IDs:** Create a unique ID for every element (e.g., "wall_01", "door_01", "fixed_equipment_01") and room (e.g., "room_01").
3.  **Extract Data:** For each element, determine its type, description, and estimate its position, dimensions, and rotation on the 1000x1000 grid (top-left is 0,0).
4.  **Calculate Room Properties:** For each room, provide its name, classification, and a list of element IDs that form its boundary. Estimate its area in square meters (assume a standard scale). Set 'inferredCeilingHeight' to 2.8 meters.
5.  **Determine Connectivity:** Based on shared doors and walls, determine the 'connectivity' and 'adjacency' arrays for each room.
6.  **Format Output:** Your final output must be ONLY the JSON object that strictly adheres to the provided CSM schema. Do not include any other text, markdown, or explanations.`;
  const csmSchema = {
    type: Type.OBJECT,
    properties: {
        elements: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING },
                    position: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ["x", "y"] },
                    dimensions: { type: Type.OBJECT, properties: { length: { type: Type.NUMBER }, width: { type: Type.NUMBER }, thickness: { type: Type.NUMBER } }, required: ["length", "width"] },
                    rotation: { type: Type.NUMBER },
                    doorType: { type: Type.STRING },
                    doorSwingArc: { type: Type.OBJECT, properties: { start: { type: Type.NUMBER }, end: { type: Type.NUMBER } } },
                    windowSillHeight: { type: Type.NUMBER },
                    description: { type: Type.STRING }
                },
                required: ["id", "type", "position", "dimensions", "rotation", "description"]
            }
        },
        rooms: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    classification: { type: Type.STRING },
                    area: { type: Type.NUMBER },
                    inferredCeilingHeight: { type: Type.NUMBER },
                    connectivity: { type: Type.ARRAY, items: { type: Type.STRING } },
                    adjacency: { type: Type.ARRAY, items: { type: Type.STRING } },
                    elements: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["id", "name", "classification", "area", "inferredCeilingHeight"]
            }
        },
        circulationPaths: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    start: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ["x", "y"] },
                    end: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ["x", "y"] }
                }
            }
        }
    },
    required: ["elements", "rooms"]
  };
  
  const maxRetries = 3;
  let attempt = 0;
  let delay = 1000;

  while (attempt < maxRetries) {
      try {
          const imagePart = await fileToGenerativePart(floorplanImage);
          const response = await ai.models.generateContent({
              model: model,
              contents: { parts: [imagePart, { text: prompt }] },
              config: {
                  temperature: 0.1,
                  responseMimeType: "application/json",
                  responseSchema: csmSchema,
              },
          });
          const jsonText = response.text.trim();
          return JSON.parse(jsonText) as CanonicalSpatialMap; // Success
      } catch (error) {
          attempt++;
          if (attempt >= maxRetries || !isTransientError(error)) {
              throw createApiError(error, 'floorplan analysis');
          }
          console.warn(`Analysis failed (attempt ${attempt}), retrying in ${delay}ms...`);
          await new Promise(res => setTimeout(res, delay));
          delay *= 2; // Exponential backoff
      }
  }
  throw new Error("Floorplan analysis failed after all retries.");
};


export const generateDesign = async (analysis: CanonicalSpatialMap, roomName: string, style: string): Promise<string> => {
    const maxRetries = 3;
    let attempt = 0;
    let delay = 1000;

    while (attempt < maxRetries) {
        try {
            const model = "gemini-2.5-flash-image";
            const room = analysis.rooms.find(r => r.name === roomName);
            if (!room) throw new Error(`Room "${roomName}" not found in analysis.`);
            const prompt = `You are an AI interior designer creating a photorealistic rendering. Your design must strictly adhere to the provided architectural blueprint (CSM).

**Canonical Spatial Map (Immutable Constraints):**
${JSON.stringify(analysis, null, 2)}

**Design Task:**
-   **Target Room:** ${roomName}
-   **Required Style:** ${style}

**CRITICAL RULES:**
1.  **Spatial Fidelity:** The CSM is the absolute source of truth. You MUST NOT alter any structural elements. All decorative items must be scaled and placed to fit exactly within the room dimensions and around fixed elements. Furniture cannot encroach on a door's swing path.
2.  **Style Authenticity:** Apply materials, colors, and furniture definitive of the chosen architectural style.
3.  **Camera Angle Rule:** The render MUST use a wide-angle, third-person perspective. The camera MUST be positioned at a logical entry point to the room (like a doorway) to provide the most comprehensive view possible. The camera's field of view MUST be set to capture the ENTIRETY of the room, from wall to wall, in a single, coherent shot. No part of the room should be cut off. This camera angle is now locked for this session.

Generate a single, hyper-realistic, photorealistic image of the designed interior.`;
            const response = await ai.models.generateContent({
                model,
                contents: { parts: [{ text: prompt }] },
                config: { imageConfig: { aspectRatio: "16:9" } }
            });

            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
            throw new Error("No image was generated by the AI.");
        } catch (error) {
            attempt++;
            if (attempt >= maxRetries || !isTransientError(error)) {
                throw createApiError(error, 'design generation');
            }
            console.warn(`Design generation failed (attempt ${attempt}), retrying in ${delay}ms...`);
            await new Promise(res => setTimeout(res, delay));
            delay *= 2;
        }
    }
    throw new Error("Design generation failed after all retries.");
};

export const refineDesign = async (userPrompt: string, analysis: CanonicalSpatialMap, currentImageBase64: string): Promise<{ imageUrl: string | null; explanation: string | null; }> => {
    const maxRetries = 3;
    let attempt = 0;
    let delay = 1000;

    while (attempt < maxRetries) {
        try {
            const model = 'gemini-2.5-flash-image';
            const imagePart = base64ToGenerativePart(currentImageBase64);
            const prompt = `You are a precision AI image modification service. Your task is to execute a single, specific change to the provided image based on a user's command. Failure to make a discernible change is a critical error.

**Core Directive:** The output image MUST be identical to the input image in every way (camera angle, lighting, overall style) EXCEPT for the one specific modification requested by the user.

**Critical Instructions:**
1.  **Parse & Ground:** Analyze the user's request. Map the request to a specific object in the current render using the CSM Element Legend below (e.g., "the sofa" -> find the sofa object, "wall behind sofa" -> identify the correct wall ID).
2.  **CSM Validation:** Verify the requested change is physically possible within the immutable CSM. If impossible (e.g., adding an item that blocks a door swing), you MUST explain why and you MUST NOT generate an image.
3.  **Execute the Edit:** Apply the requested change ONLY to that object. Do not alter anything else.
4.  **Prohibition:** You are absolutely prohibited from returning the original, unchanged image. If you cannot fulfill the request for a valid reason, you must explain this in text. Simply returning the same image is not an acceptable outcome.

**Canonical Spatial Map Element Legend (Immutable):**
${JSON.stringify(analysis.elements, null, 2)}

**User's Change Request:**
"${userPrompt}"

Proceed with the modification or provide a text-only explanation.`;
            const response = await ai.models.generateContent({
                model,
                contents: { parts: [imagePart, { text: prompt }] },
                config: { imageConfig: { aspectRatio: "16:9" } }
            });
            
            let generatedImage: string | null = null;
            let explanationText: string | null = null;

            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    generatedImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                } else if (part.text) {
                    explanationText = part.text;
                }
            }

            if (generatedImage || explanationText) {
                return { imageUrl: generatedImage, explanation: explanationText };
            }
            
            throw new Error("The AI returned an empty response.");
        } catch (error) {
            attempt++;
            if (attempt >= maxRetries || !isTransientError(error)) {
                throw createApiError(error, 'design refinement');
            }
            console.warn(`Design refinement failed (attempt ${attempt}), retrying in ${delay}ms...`);
            await new Promise(res => setTimeout(res, delay));
            delay *= 2;
        }
    }
    throw new Error("Design refinement failed after all retries.");
};


export const generateMaterialList = async (designImageBase64: string): Promise<Material[]> => {
    const maxRetries = 3;
    let attempt = 0;
    let delay = 1000;

    while (attempt < maxRetries) {
        try {
            const model = 'gemini-3-flash-preview';
            const imagePart = base64ToGenerativePart(designImageBase64);
            const prompt = "Analyze this interior design image and produce a detailed bill of materials in JSON format. For each item (e.g., flooring, paint, furniture), provide a name, a brief description, a precise quantity, and the correct unit. For surface materials like paint or flooring, the unit must be 'sqm' (square meters). For individual items like furniture, the unit must be 'items'. Output only the JSON array.";
            const materialSchema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: "Name of the material or item." },
                        description: { type: Type.STRING, description: "Brief description of the item." },
                        quantity: { type: Type.NUMBER, description: "Numerical quantity for the item." },
                        unit: { type: Type.STRING, description: "The unit of measurement, e.g., 'sqm' for area or 'items' for countable objects."}
                    },
                    required: ["name", "description", "quantity", "unit"]
                }
            };

            const response = await ai.models.generateContent({
                model,
                contents: { parts: [imagePart, {text: prompt}] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: materialSchema
                }
            });

            const jsonText = response.text.trim();
            return JSON.parse(jsonText) as Material[];
        } catch (error) {
             attempt++;
            if (attempt >= maxRetries || !isTransientError(error)) {
                throw createApiError(error, 'material list generation');
            }
            console.warn(`Material list generation failed (attempt ${attempt}), retrying in ${delay}ms...`);
            await new Promise(res => setTimeout(res, delay));
            delay *= 2;
        }
    }
    throw new Error("Material list generation failed after all retries.");
};
    