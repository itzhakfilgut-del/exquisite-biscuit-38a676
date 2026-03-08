
import React, { useState, useEffect } from 'react';
import { exploreMapsWithGemini } from '../services/geminiService';
import { MapResult } from '../types';

const MapExplorer: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<MapResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ latitude: number, longitude: number } | undefined>();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => console.warn("Geolocation denied", err)
      );
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setError(null);
    try {
      const data = await exploreMapsWithGemini(query, coords);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch map data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800">Map Explorer</h2>
        <p className="text-gray-500 mt-2">Discover the world with Gemini + Google Maps Grounding.</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., 'Italian restaurants near me' or 'Historical sites in Jerusalem'"
          className="flex-1 p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none transition-all shadow-sm"
        />
        <button
          type="submit"
          disabled={loading || !query}
          className="px-6 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-400 transition-colors shadow-md"
        >
          {loading ? "Searching..." : "Explore"}
        </button>
      </form>

      {error && <p className="text-red-500 text-center font-medium">{error}</p>}

      {result && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 space-y-6 animate-fade-in">
          <div className="prose prose-blue max-w-none">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Gemini Insights</h3>
            <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{result.text}</p>
          </div>

          {result.links.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Verified Places</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-300 transition-all group"
                  >
                    <div className="bg-green-100 p-2 rounded-md mr-3 group-hover:bg-green-200 transition-colors">
                      <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{link.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapExplorer;
