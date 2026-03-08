
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

const MitzvahInsight: React.FC = () => {
  const [insight, setInsight] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: 'תן משפט השראה יהודי קצר ומחזק (עד 15 מילים) על חשיבות הנחת תפילין או חיבור לעם ישראל.',
          config: {
            systemInstruction: 'You are a wise and inspiring rabbi providing short, powerful daily thoughts.'
          }
        });
        setInsight(response.text || "כל לחיצה היא צעד קטן לחיבור גדול.");
      } catch (e) {
        setInsight("החיבור שלך לעם ישראל מתחיל בלב וממשיך במעשה.");
      } finally {
        setLoading(false);
      }
    };
    fetchInsight();
  }, []);

  return (
    <div className="bg-gradient-to-r from-gray-900 to-slate-800 p-4 rounded-2xl shadow-lg border border-gray-700 animate-fade-in">
      <div className="flex items-center space-x-2 space-x-reverse mb-1">
        <svg className="h-3 w-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.464 15.657a1 1 0 010-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414 0zM6.464 16.364a1 1 0 01-1.414 0l-.707-.707a1 1 0 011.414-1.414l.707.707a1 1 0 010 1.414z" />
        </svg>
        <span className="text-[10px] font-black text-yellow-500 uppercase tracking-tighter">AI Daily Insight</span>
      </div>
      {loading ? (
        <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4 mt-2"></div>
      ) : (
        <p className="text-gray-200 text-sm font-medium leading-tight">
          "{insight}"
        </p>
      )}
    </div>
  );
};

export default MitzvahInsight;
