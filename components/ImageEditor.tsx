
import React, { useState, useRef } from 'react';
import { editImageWithGemini } from '../services/geminiService';
import { ImageState } from '../types';

const ImageEditor: React.FC = () => {
  const [state, setState] = useState<ImageState>({
    originalUrl: null,
    editedUrl: null,
    loading: false,
    error: null,
  });
  const [prompt, setPrompt] = useState('');
  const [base64, setBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setBase64(result.split(',')[1]);
        setState(prev => ({ ...prev, originalUrl: result, editedUrl: null, error: null }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!base64 || !prompt) return;
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await editImageWithGemini(base64, prompt);
      if (result) {
        setState(prev => ({ ...prev, editedUrl: result, loading: false }));
        // Update current base64 to the new image for iterative editing
        setBase64(result.split(',')[1]);
      } else {
        throw new Error("No image was returned from the model.");
      }
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: err.message || "Failed to edit image" }));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800">Nano Banana Editor</h2>
        <p className="text-gray-500 mt-2">Edit your images with Gemini 2.5 Flash Image magic.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Controls */}
        <div className="space-y-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition-colors bg-white shadow-sm"
          >
            {state.originalUrl ? (
                <img src={state.originalUrl} alt="Original" className="max-h-64 mx-auto rounded-lg shadow-md" />
            ) : (
                <div className="text-gray-400">
                    <svg className="mx-auto h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <p>Click to upload an image</p>
                </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Modification Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'Add a retro filter' or 'Make it look like Mars'"
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none h-24"
            />
          </div>

          <button
            onClick={handleEdit}
            disabled={!base64 || !prompt || state.loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md flex items-center justify-center"
          >
            {state.loading ? (
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processing...</span>
              </div>
            ) : "Apply Magic"}
          </button>
          
          {state.error && <p className="text-red-500 text-sm font-medium">{state.error}</p>}
        </div>

        {/* Output Preview */}
        <div className="bg-gray-100 rounded-xl p-4 flex flex-col items-center justify-center min-h-[300px] border border-gray-200">
           {state.editedUrl ? (
             <div className="space-y-4 w-full">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Result</p>
                <img src={state.editedUrl} alt="Edited" className="max-h-96 mx-auto rounded-lg shadow-xl" />
                <a 
                  href={state.editedUrl} 
                  download="edited-image.png"
                  className="block text-center text-blue-600 font-medium hover:underline text-sm"
                >
                  Download Result
                </a>
             </div>
           ) : (
             <p className="text-gray-400 italic">Edited image will appear here</p>
           )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
