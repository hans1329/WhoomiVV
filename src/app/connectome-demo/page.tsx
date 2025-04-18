'use client';

import React, { useState, useEffect } from 'react';
import ConnectomeEditor from '@/components/ConnectomeEditor';
import ConnectomeVisualization from '@/components/ConnectomeVisualization';
import ConnectomeReport from '@/components/ConnectomeReport';
import { sampleConnectome, simpleSampleConnectome } from '@/data/sampleConnectome';
import { Connectome } from '@/types/character';

const ConnectomeDemo = () => {
  const [connectome, setConnectome] = useState<Connectome>(simpleSampleConnectome);
  const [darkMode, setDarkMode] = useState(false);
  
  // Apply dark mode to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    
    return () => {
      document.body.classList.remove('dark');
    };
  }, [darkMode]);
  
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <header className={`py-4 px-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center">
          <h1 className="text-2xl font-bold">Connectome Components Demo</h1>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <div className="flex items-center space-x-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={darkMode} 
                  onChange={(e) => setDarkMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                {darkMode ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>
            <button 
              onClick={() => setConnectome(simpleSampleConnectome)} 
              className={`px-3 py-1 text-sm rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              Load Simple Example
            </button>
            <button 
              onClick={() => setConnectome(sampleConnectome)} 
              className={`px-3 py-1 text-sm rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              Load Complex Example
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 gap-8">
          <section>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>ConnectomeEditor</h2>
            <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              This component allows users to create and edit the connectome by adding nodes (personality traits, interests, emotions, values) 
              and defining relationships between them.
            </p>
            <div className="border rounded-lg shadow">
              <ConnectomeEditor 
                initialConnectome={connectome}
                onChange={setConnectome}
                darkMode={darkMode}
              />
            </div>
          </section>

          <section>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>ConnectomeVisualization</h2>
            <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              This component visualizes the connectome as an interactive network graph, showing nodes and their relationships.
            </p>
            <div className={`p-6 border rounded-lg shadow ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="h-[500px]">
                <ConnectomeVisualization 
                  connectome={connectome}
                  width={typeof window !== 'undefined' ? Math.min(1000, window.innerWidth - 96) : 800}
                  height={500}
                  darkMode={darkMode}
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>ConnectomeReport</h2>
            <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              This component analyzes the connectome and generates insights about the personality structure.
            </p>
            <ConnectomeReport 
              connectome={connectome}
              darkMode={darkMode}
            />
          </section>
        </div>
      </main>

      <footer className={`py-4 px-6 border-t ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-400' : 'border-gray-200 bg-gray-100 text-gray-600'}`}>
        <div className="max-w-7xl mx-auto">
          <p className="text-sm">
            Connectome components demo - Character personality network visualization system
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ConnectomeDemo; 