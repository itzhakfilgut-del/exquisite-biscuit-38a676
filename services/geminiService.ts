
import { GoogleGenAI } from "@google/genai";
import { MapResult } from "../types";

// Always initialize with API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Edits an image using the Gemini 2.5 Flash Image model.
 * @param base64 Raw base64 data of the image (no data URI prefix).
 * @param prompt Modification instructions for the model.
 */
export const editImageWithGemini = async (base64: string, prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64,
              mimeType: 'image/png', // Assumes standard image processing.
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // Iterate through response parts to identify the generated image.
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Editing Error:", error);
    throw error;
  }
};

/**
 * Searches for places using Google Maps grounding.
 * @param query The user's query about places or navigation.
 * @param coords Optional user location for local search results.
 */
export const exploreMapsWithGemini = async (
  query: string, 
  coords?: { latitude: number; longitude: number }
): Promise<MapResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        tools: [{ googleMaps: {} }],
        // Include user location in toolConfig where available.
        toolConfig: coords ? {
          retrievalConfig: {
            latLng: {
              latitude: coords.latitude,
              longitude: coords.longitude
            }
          }
        } : undefined
      },
    });

    // Extract generated text from the response object.
    const text = response.text || "No insights returned.";
    const links: { uri: string; title: string }[] = [];

    // Extract grounding links from groundingMetadata to display as clickable resources.
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.maps) {
          links.push({
            uri: chunk.maps.uri,
            title: chunk.maps.title || "View on Google Maps"
          });
        }
      });
    }

    return { text, links };
  } catch (error) {
    console.error("Gemini Maps Error:", error);
    throw error;
  }
};
