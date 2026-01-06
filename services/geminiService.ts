
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
  const prompt = `System Role: You are an expert AI architect and drafter, a Universal Architectural Parser. Your goal is to convert ANY uploaded floor plan image into a standardized, machine-readable Canonical Spatial Map (CSM) JSON format with extreme precision. Your analysis must be a 1:1 digital twin of the provided image.

**Architectural Symbol Legend (Your Knowledge Base):**
-   **Walls:** Represented by thick, solid parallel lines. Exterior walls are typically thicker than interior walls.
-   **Doors:** An opening in a wall, shown as a line perpendicular to the wall with a quarter-circle arc indicating the swing direction. The 'position' is the hinge point.
-   **Windows:** A break in a wall, typically represented by thinner parallel lines within the wall's thickness.
-   **Stairs:** A series of parallel lines representing steps, often with an arrow indicating the direction (up/down).
-   **Fixed Equipment:**
    -   **Kitchen Sink:** A rectangle with one or two smaller squares inside.
    -   **Stove/Cooktop:** A square or rectangle, often with four circles or an 'X' on top.
    -   **Toilet:** Usually a small circle connected to a rectangle or oval.
    -   **Shower/Bath:** A large rectangle, often with an 'X' across it or a drain symbol.
-   **Columns:** Solid filled squares or circles, often shown within a room or embedded in a wall.

**CRITICAL RULES FOR ACCURACY:**
1.  **Symbol-First Analysis:** Your first priority is to scan the image and identify every element based on the Architectural Symbol Legend above.
2.  **Absolute Fidelity:** You MUST ONLY map what is explicitly visible in the floorplan. DO NOT infer, invent, or hallucinate any architectural elements. If a symbol is present, it MUST be in the output. If it is not present, it MUST NOT be in the output.
3.  **Precise Placement & Scaling:** Imagine a 1000x1000 grid overlaid on the image (top-left is 0,0). Find the dimension lines (lines with numbers like '3.80') to understand the scale. All element 'position' (top-left corner of the element's bounding box) and 'dimensions' MUST be calculated with the highest possible accuracy and normalized to this 1000x1000 grid.

**Step-by-Step Analysis and Structuring Instructions:**
1.  **Scan for Symbols:** Meticulously identify every structural and infrastructure element using the provided Legend.
2.  **Establish Scale:** Analyze the dimension lines to create a reliable pixel-to-meter conversion factor.
3.  **Map Elements:** For each identified symbol, calculate its precise 'position', 'dimensions', and 'rotation' on the 1000x1000 grid. Provide a clear 'description' (e.g., "Living Room Window", "Kitchen Sink").
4.  **Define Rooms:** Identify all enclosed spaces bounded by walls and doors. Assign a unique, sequential ID (e.g., "room_01", "room_02"). Calculate each room's 'area' in square meters using the scale you established.
5.  **Assign IDs:** Create a unique, sequential ID for every single element (e.g., "wall_01", "door_01", "fixed_equipment_01").
6.  **Determine Connectivity:** For each room, list the IDs of other rooms it is connected to via a door in the 'connectivity' array. List the IDs of all bounding elements in the 'elements' array.
7.  **Format Output:** Your final output must be ONLY the JSON object that strictly adheres to the provided CSM schema. Do not include any other text, markdown, or explanations. Set 'inferredCeilingHeight' to 2.8 meters.`;
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
            const prompt = `You are an AI interior designer and photorealistic renderer. Your task is to generate a single, hyper-realistic image of an interior space based on a strict architectural blueprint.

**Architectural Blueprint (Canonical Spatial Map - CSM):**
This CSM is the absolute, non-negotiable source of truth for the room's geometry and structure.
${JSON.stringify(analysis, null, 2)}

**Design Task:**
1.  **Construct the 3D Scene:** Build a virtual 3D model of the room specified as "${roomName}". You MUST use the exact dimensions, positions, and properties for every wall, door, window, and fixed equipment element listed in the CSM. The architecture is immutable.
2.  **Apply Interior Design:** Decorate the constructed room in the **"${style}"** style. This includes selecting appropriate materials for floors and walls, and furnishing the space with stylistically-consistent, movable furniture (sofas, chairs, tables, lamps, rugs, etc.).
3.  **Set Camera View:** Position the virtual camera at a logical entry point (like a doorway) to provide the most comprehensive, wide-angle view of the entire room. The camera angle MUST be fixed and capture the whole space. This angle is now locked for this session.
4.  **Render Image:** Generate a single, high-resolution, photorealistic image from the camera's perspective.

**CRITICAL RULES:**
-   **Absolute Architectural Fidelity:** You MUST NOT alter, move, add, or remove any structural element defined in the CSM (walls, windows, doors, fixed equipment). The generated image's geometry must be a 1:1 match with the blueprint.
-   **Style Adherence:** The decor, materials, and color palette must be authentic to the requested style.
-   **No Obstructions:** Furniture placement must be logical and not obstruct circulation paths or door swings.`;
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
            const prompt = `You are a precision AI image modification service acting as a "virtual decorator". You must adhere to a strict set of rules based on an immutable architectural blueprint.

**Your Role:**
Your primary job is to be the **guardian of the architectural integrity defined by the CSM**. You will modify the provided image based on the user's request, but ONLY if the request is a valid "decorator" action. You will maintain the exact camera angle, lighting, and unmodified elements from the original image.

**Immutable Architectural Blueprint (CSM):**
This is the locked-down plan. The position and dimensions of these elements CANNOT be changed.
${JSON.stringify(analysis.elements, null, 2)}

**User's Change Request:**
"${userPrompt}"

---
**MODIFICATION RULES & EXECUTION:**

1.  **Analyze Request:** Is the user's request a "decorator" action or an "architect" action?
    -   **Allowed (Decorator Actions):** Changing materials/colors (e.g., "make the floor dark wood," "paint wall_01 green"), swapping furniture (e.g., "change the sofa to a leather sectional"), adding decorative items (e.g., "add a plant in the corner").
    -   **Forbidden (Architect Actions):** Moving/resizing/removing walls, doors, windows, or any element listed in the CSM. Changing the camera angle or overall room structure.

2.  **Execute or Reject:**
    -   **If ALLOWED:** Execute the single, specific change. The new image must be identical to the original except for the requested modification.
    -   **If FORBIDDEN:** DO NOT generate an image. Instead, provide a text-only response explaining WHY the request is invalid. For example: "I cannot move wall_02 because it is a structural element defined in the architectural plan. I can, however, change its color or material."

3.  **Critical Failure Condition:** Returning the original, unchanged image is a failure. You MUST either produce a modified image or a text explanation.`;
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
    