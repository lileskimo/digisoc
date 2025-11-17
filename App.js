import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Music, MapPin, Search, Mic, Link, Image as ImageIcon, RotateCw } from 'lucide-react';

// --- ARTIFACT DATA & CONSTANTS ---

const RAJASTHAN_CENTER = [26.9124, 75.7873]; 
const INITIAL_ZOOM = 7;

// Function to map theme colors to Leaflet style properties
const getThemeColor = (theme) => {
    switch (theme) {
        case 'amber-700': return '#b45309';
        case 'sky-700': return '#0369a1';
        case 'red-700': return '#b91c1c';
        case 'emerald-700': return '#047857';
        case 'purple-700': return '#7e22ce';
        default: return '#374151'; // Default gray
    }
};

// Data representing key regions, their music, and enriched cultural information.
const artifactData = [
  { 
    id: 1, 
    region: "Jaisalmer (West)", 
    color: "bg-amber-500",
    theme: "amber-700",
    traditions: [
      {
        name: "Manganiyar Surna & Kamaicha",
        description: "The music of the Manganiyar community is deeply rooted in the Thar desert. The **Kamaicha** (a bowed instrument unique to the Manganiyars) and the **Surna** (a double-reed oboe) are their primary instruments. Their repertoire includes celebratory songs and epic tales for their patrons.", 
        famousArtists: ["Mame Khan", "Sawan Khan"],
        exampleSong: "Dama Dam Mast Qalandar (Manganiyar style)",
      },
      {
        name: "Langa Sarangi Vadan (Western Style)",
        description: "Intricate, expressive string work on the **Sarangi** instrument by the Langa community, often performing traditional wedding and celebratory songs. Their style here often overlaps with Manganiyar repertoire.", 
        famousArtists: ["Dare Khan Langa", "Ghewar Khan"],
        exampleSong: "Kesariya Balam (Langa rendition)",
      }
    ]
  },
  { 
    id: 2, 
    region: "Shekhawati (North-East)", 
    color: "bg-sky-500",
    theme: "sky-700",
    traditions: [
      {
        name: "Shekhawati Khyal",
        description: "A famous folk theater and opera tradition, using rich narratives (**Khyal**) based on local legends, often performed in courtyards. Instruments include the harmonium, tabla, and sometimes the Nagara.",
        famousArtists: ["Ram Niwas Rao", "Heera-Ranjha Troupes"],
        exampleSong: "Pallo Latke",
      },
      {
        name: "Ghevar Sangeet (Dholi community)",
        description: "Lively, rhythmic music performed primarily during festivals and marriage ceremonies, heavily relying on percussion instruments like the **Dhol** and accompanying devotional songs.",
        famousArtists: ["Dholi groups of Sikar", "Fateh Khan"],
        exampleSong: "Ganesh Vandana (Dhol style)",
      }
    ]
  },
  { 
    id: 3, 
    region: "Mewar (South)", 
    color: "bg-red-500",
    theme: "red-700",
    traditions: [
      {
        name: "Bhopa and Bhopi Phad",
        description: "The narrative singing of epic poems, where the Bhopa (male singer) recounts stories painted on a long religious scroll (**Phad**), accompanied by his Bhopi (female singer) on the **Ravanahatha**.",
        famousArtists: ["Prakash Bhopa", "Shri Lal Joshi (Phad painter)"],
        exampleSong: "Pabuji Ki Phad (Epic narrative)",
      },
      {
        name: "Mand Singing",
        description: "A classical Rajasthani style of singing developed in royal courts. It is characterized by its grace and ability to depict the emotional landscape of the desert. Mewar is one of its strong centers.",
        famousArtists: ["Allaudin Khan", "Gauri Devi"],
        exampleSong: "Moomal (Mand style)",
      }
    ]
  },
  { 
    id: 4, 
    region: "Hadoti (South-East)", 
    color: "bg-emerald-500",
    theme: "emerald-700",
    traditions: [
      {
        name: "Charbait",
        description: "A unique style of oral poetry and song composed in quatrains, often covering historical, romantic, or devotional themes. Performed with robust voice modulation, often accompanied by Duffs and drums.",
        famousArtists: ["Local Charbait poets", "Awwal Baabu"],
        exampleSong: "Qawwali (Hadoti region)",
      },
      {
        name: "Chakri Dance Music (Kanjar community)",
        description: "High-speed, whirling dance music primarily associated with the Kanjar tribe. The musical accompaniment is driven by loud beats and fast melodies from instruments like the Dholak and flute.",
        famousArtists: ["Chakri troupes of Kota", "Suman Rani"],
        exampleSong: "Chakri Dance Beat",
      }
    ]
  },
  { 
    id: 5, 
    region: "Marwar (Central)", 
    color: "bg-purple-500",
    theme: "purple-700",
    traditions: [
      {
        name: "Langa Sarangi Vadan & Dhol",
        description: "The **Langa** community are known for their virtuosic Sarangi playing and rich vocal traditions, especially during weddings and harvest festivals. They often use the **Dhol** and **Harmonium**.",
        famousArtists: ["Dare Khan Langa", "Ghewar Khan"],
        exampleSong: "Kesariya Balam (Langa rendition)",
      },
      {
        name: "Maand (Jodhpur Gharana)",
        description: "A refined semi-classical vocal style, traditionally sung in praise of rulers. The Jodhpur Gharana of Maand is particularly famous for its melancholic and dramatic flair.",
        famousArtists: ["Allah Jilai Bai", "Gauri Devi"],
        exampleSong: "Sone Ra Suraj",
      }
    ]
  }
];

// Helper to find artifact data based on GeoJSON ID - now defined outside MapCanvas
const findArtifact = (id) => artifactData.find(a => a.id === id);


// --- SIMPLIFIED REGIONAL AND STATE GEOJSON FOR RAJASTHAN ---
const rajasthanRegionsGeoJSON = {
  type: "FeatureCollection",
  features: [
    // 0. Rajasthan State Border (Used for visual border)
    { 
        type: "Feature", 
        properties: { id: 0, isStateBorder: true }, 
        geometry: { 
            type: "Polygon", 
            coordinates: [[
                [74.0, 30.5], [72.5, 29.5], [69.5, 28.0], [70.0, 25.0], 
                [72.0, 24.0], [75.0, 23.5], [77.0, 24.5], [77.8, 27.5], 
                [77.0, 29.5], [74.0, 30.5] 
            ]] 
        } 
    },
    // 1-5. Regional Polygons (Used to calculate marker center points)
    { type: "Feature", properties: { id: 1 }, geometry: { type: "Polygon", coordinates: [[[69.5, 29.5], [72.5, 29.5], [72.5, 25.5], [69.5, 25.5], [69.5, 29.5]]] } }, 
    { type: "Feature", properties: { id: 2 }, geometry: { type: "Polygon", coordinates: [[[74.5, 30.5], [78.5, 30.5], [78.5, 27.5], [74.5, 27.5], [74.5, 30.5]]] } },
    { type: "Feature", properties: { id: 3 }, geometry: { type: "Polygon", coordinates: [[[72.5, 25.5], [75.5, 25.5], [75.5, 23.5], [72.5, 23.5], [72.5, 25.5]]] } },
    { type: "Feature", properties: { id: 4 }, geometry: { type: "Polygon", coordinates: [[[75.5, 27.5], [78.5, 27.5], [78.5, 24.5], [75.5, 24.5], [75.5, 27.5]]] } },
    { type: "Feature", properties: { id: 5 }, geometry: { type: "Polygon", coordinates: [[[72.5, 27.5], [75.5, 27.5], [75.5, 25.5], [72.5, 25.5], [72.5, 27.5]]] } },
  ]
};

// Custom Icon Generator for Region Labels
const createRegionIcon = (artifact, isSelected) => {
    // Check for L globally before use
    const L = window.L;
    if (typeof L === 'undefined') return null;

    const themeColor = getThemeColor(artifact.theme);
    const scale = isSelected ? 'scale(1.1)' : 'scale(1)';
    const shadow = isSelected ? '0 8px 15px rgba(0,0,0,0.4)' : '0 4px 10px rgba(0,0,0,0.3)';

    // Use the first word of the region name for the label text
    const labelText = artifact.region.split(' ')[0];
    
    const iconHtml = `
        <div class="region-marker" 
             style="
                 background-color:${themeColor}; 
                 border: 3px solid white; 
                 box-shadow: ${shadow}; 
                 transform: ${scale};
                 transition: transform 0.2s, box-shadow 0.2s;
             ">
            <span class="font-bold text-white text-xs">${labelText.toUpperCase()}</span>
        </div>`;

    return L.divIcon({
        className: 'custom-region-icon',
        html: iconHtml,
        iconSize: [100, 40], // Increased size for visibility
        iconAnchor: [50, 20] // Center of the div
    });
};


// Style function for GeoJSON layer
const getGeoJsonStyle = (feature) => {
  // 1. STYLE FOR STATE BORDER (ID 0)
  if (feature.properties.isStateBorder) {
    return {
      fillColor: 'transparent',
      weight: 4, 
      opacity: 1,
      color: '#7e22ce', // Purple line color
      fillOpacity: 0,
      dashArray: '5, 5',
    };
  }
  
  // 2. STYLE FOR REGIONAL FEATURES (ID 1-5) - MUST BE INVISIBLE
  // We keep these polygons to calculate the center point for the markers
  return {
    fillColor: 'transparent', 
    weight: 0, 
    opacity: 0,
    fillOpacity: 0, 
  };
};

// --- MAP CANVAS COMPONENT ---

const MapCanvas = ({ onSelectArtifact, selectedArtifact }) => {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markerLayerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [leafletError, setLeafletError] = useState(null);

  // Function to initialize GeoJSON layer and add markers
  const addGeoJSONAndMarkers = useCallback((mapInstance, L) => {
      // Clear previous markers if they exist (though shouldn't on first run)
      if (markerLayerRef.current) {
          markerLayerRef.current.clearLayers();
      }

      // Create a separate layer group for markers (so we can easily manage them)
      const markerLayer = L.layerGroup().addTo(mapInstance);
      markerLayerRef.current = markerLayer;

      L.geoJSON(rajasthanRegionsGeoJSON, {
          style: getGeoJsonStyle, // Style hides regional polygons
          onEachFeature: (feature, layer) => {
              const featureId = feature.properties.id;

              // Only process regional markers (ID > 0)
              if (featureId > 0) {
                  const artifact = findArtifact(featureId);
                  if (artifact) {
                      // Get the center of the invisible polygon bounds
                      const center = layer.getBounds().getCenter();

                      // Create a custom marker at the center
                      const marker = L.marker(center, { 
                          icon: createRegionIcon(artifact, selectedArtifact?.id === artifact.id),
                          draggable: false,
                          keyboard: false,
                      })
                      .addTo(markerLayer);

                      // Attach the click event to the marker
                      marker.on('click', (e) => {
                          mapInstance.panTo(e.latlng); // Pan to the clicked marker
                          onSelectArtifact(artifact);
                      });

                      // Store the artifact ID on the marker for selection tracking
                      marker.__artifactId = artifact.id;
                  }
              }
          },
      }).addTo(mapInstance);
  }, [onSelectArtifact, selectedArtifact]); // Recalculate if selectedArtifact changes on initial run

  /**
   * Effect 1: Load Leaflet dependencies and initialize the map (Runs ONCE).
   */
  useEffect(() => {
    let scriptLoaded = false;
    let cleanupLeaflet = () => {};

    const initializeMap = (L) => {
        if (mapContainerRef.current && !mapRef.current) {
            try {
                // Initialize Map
                const map = L.map(mapContainerRef.current, {
                    maxBounds: [[22, 68], [32, 80]], 
                    minZoom: 6,
                    maxZoom: 12,
                }).setView(RAJASTHAN_CENTER, INITIAL_ZOOM);

                // ADD TILE LAYER 
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
                    opacity: 0.8 
                }).addTo(map);

                mapRef.current = map;
                addGeoJSONAndMarkers(map, L);
                
                // Ensure invalidateSize() is called after the DOM element is fully rendered.
                setTimeout(() => {
                    map.invalidateSize();
                }, 0);
            } catch (e) {
                console.error("Leaflet map initialization failed:", e);
                setLeafletError("Failed to initialize the map. Please check the console for details.");
            }
        }
    };

    const loadLeafletDependencies = () => {
        // Load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Load JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
            if (window.L && !scriptLoaded) {
                setLoading(false);
                scriptLoaded = true;
                initializeMap(window.L); 
            }
        };
        script.onerror = () => {
            setLeafletError("Failed to load Leaflet library. The map cannot be displayed.");
            setLoading(false);
        };
        document.body.appendChild(script);

        cleanupLeaflet = () => {
            // Remove elements on cleanup
            if (document.head.contains(link)) document.head.removeChild(link);
            if (document.body.contains(script)) document.body.removeChild(script);
        };
    };

    loadLeafletDependencies();

    return () => {
        cleanupLeaflet();
        // Clean up the Leaflet map instance
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }
    };
  }, []); // Empty dependency array ensures one-time initialization.

  /**
   * Effect 2: Manage marker selection/highlighting (Runs when selectedArtifact changes).
   */
  useEffect(() => {
    // Check if map and marker layer exist and Leaflet is loaded
    const L = window.L;
    if (mapRef.current && markerLayerRef.current && L) {
        markerLayerRef.current.eachLayer(layer => {
            if (layer.__artifactId) {
                const artifact = findArtifact(layer.__artifactId);
                const isSelected = selectedArtifact && selectedArtifact.id === layer.__artifactId;
                
                // Update the marker icon based on selection state
                layer.setIcon(createRegionIcon(artifact, isSelected));
            }
        });

        // Pan map to the selected marker's position if an artifact is selected
        if (selectedArtifact) {
            markerLayerRef.current.eachLayer(layer => {
                if (layer.__artifactId === selectedArtifact.id) {
                    mapRef.current.panTo(layer.getLatLng());
                }
            });
        }
    }
  }, [selectedArtifact]);

  // --- Render Loading/Error States ---
  if (loading) {
    return (
        <div className="flex items-center justify-center w-full h-[550px] bg-gray-50 rounded-xl border-4 border-gray-300">
            <RotateCw size={32} className="animate-spin text-orange-500 mr-2" />
            <p className="text-lg text-gray-700 font-medium">Loading Map Assets...</p>
        </div>
    );
  }

  if (leafletError) {
    return (
        <div className="flex flex-col items-center justify-center w-full h-[550px] bg-red-100 rounded-xl border-4 border-red-400 p-6 text-center">
            <MapPin size={48} className="text-red-600 mb-4" />
            <h3 className="text-xl font-bold text-red-800">Map Loading Error</h3>
            <p className="text-red-700 mt-2">{leafletError}</p>
        </div>
    );
  }

  // --- Render Map Container ---
  return (
    <div className="lg:w-2/3 w-full bg-white rounded-xl shadow-2xl overflow-hidden relative border-4 border-gray-300">
        <div 
          ref={mapContainerRef} 
          id="leaflet-map" 
          className="w-full" 
          style={{ height: '550px', zIndex: 1 }} 
        />
        
        {/* Instructions overlay */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-xl text-xs font-medium text-gray-700 hidden sm:block z-[1000]">
          <p className="flex items-center"><MapPin size={14} className="mr-1 text-red-500" /> Click a colored label on the map to explore its music.</p>
        </div>
    </div>
  );
};

// --- IMAGE SEARCH BLOCK COMPONENT (Simplified) ---

const SearchImageBlock = ({ title, searchKeyword, icon, themeClass }) => (
    <a 
        href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(searchKeyword)}`} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={`flex flex-col items-center justify-center p-4 h-32 w-full bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 hover:bg-gray-200 transition-colors group relative overflow-hidden`}
    >
        <div className={`absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity`}></div>
        <div className={`text-${themeClass} group-hover:text-opacity-80 transition-opacity`}>
            {React.cloneElement(icon, { size: 32 })}
        </div>
        <p className="text-sm font-semibold text-gray-700 mt-2 text-center truncate w-full px-1">{title}</p>
        <p className="text-xs text-blue-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1">Click to View Images</p>
    </a>
);


// --- TRADITION CARD COMPONENT ---

const TraditionCard = ({ tradition, themeClass }) => (
    <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
        {/* Tradition Name */}
        <h4 className={`text-xl font-bold mb-3 text-${themeClass} flex items-center`}>
            <Music size={20} className={`mr-2 text-${themeClass}`} />
            {tradition.name}
        </h4>
        
        {/* Description */}
        <p className="text-gray-700 text-sm leading-relaxed mb-4">{tradition.description}</p>
        
        {/* VISUAL ARTIFACTS / IMAGE PLACEHOLDERS */}
        <div className="mb-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Visual Artifacts (Click to Search)</p>
            <div className="flex space-x-3">
                <SearchImageBlock 
                    title={tradition.famousArtists[0] || "Artist Photo"}
                    searchKeyword={`${tradition.famousArtists[0] || tradition.name} Rajasthani Singer Portrait`}
                    icon={<Mic />}
                    themeClass={themeClass}
                />
                <SearchImageBlock 
                    title={tradition.exampleSong || "Album Cover"}
                    searchKeyword={`${tradition.exampleSong || tradition.name} Rajasthani Song Album Cover`}
                    icon={<ImageIcon />}
                    themeClass={themeClass}
                />
            </div>
        </div>

        <div className="space-y-4">
            {/* Famous Artists Section */}
            <div>
                <p className="text-xs font-bold text-gray-500 mb-1 flex items-center">
                    <Mic size={14} className="mr-1" /> Other Famous Artists:
                </p>
                <ul className="text-sm space-y-1 ml-2">
                    {tradition.famousArtists.map((artist, index) => (
                        <li key={index} className="flex items-center">
                            <Link size={12} className={`mr-2 text-${themeClass} opacity-70`} />
                            <a 
                                href={`https://www.google.com/search?q=${encodeURIComponent(artist)}+${encodeURIComponent(tradition.name)}+Rajasthani+Music+Biography`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-600 hover:underline transition-colors"
                            >
                                {artist}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Example Song Section */}
            <div>
                <p className="text-xs font-bold text-gray-500 mb-1 flex items-center">
                    <Search size={14} className="mr-1" /> Key Song Example:
                </p>
                <a 
                    href={`https://www.google.com/search?q=${encodeURIComponent(tradition.exampleSong)}+Rajasthani+Folk+Song+Listen`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-md font-semibold text-blue-800 hover:underline transition-colors ml-2"
                >
                    "{tradition.exampleSong}"
                </a>
            </div>
        </div>
    </div>
);

// --- ARTIFACT DETAILS COMPONENT ---

const ArtifactDetails = ({ artifact, onReset }) => {
  const defaultArtifact = {
    region: "Mhara Sangeet: Digital Artifacts",
    traditions: [], // Important: Must be an array
    color: "bg-gray-500",
    theme: "gray-700"
  };

  const displayArtifact = artifact || defaultArtifact;
  const themeClass = displayArtifact.theme;

  // Function to determine the button class dynamically (Tailwind safelist issue work-around)
  const getButtonClass = (theme) => {
    switch (theme) {
        case 'amber-700': return 'bg-amber-700 hover:bg-amber-800';
        case 'sky-700': return 'bg-sky-700 hover:bg-sky-800';
        case 'red-700': return 'bg-red-700 hover:bg-red-800';
        case 'emerald-700': return 'bg-emerald-700 hover:bg-emerald-800';
        case 'purple-700': return 'bg-purple-700 hover:bg-purple-800';
        default: return 'bg-gray-700 hover:bg-gray-800';
    }
  };

  return (
    <div className="lg:w-1/3 w-full p-6 bg-white rounded-xl shadow-2xl flex flex-col">
      <div className={`p-4 rounded-xl ${displayArtifact.color} text-white shadow-lg`}>
        <h2 className="text-2xl font-bold inline-block">{displayArtifact.region}</h2>
      </div>

      <div className="mt-4 flex-grow overflow-y-auto space-y-6">
        {displayArtifact.traditions.length > 0 ? (
          displayArtifact.traditions.map((tradition, index) => (
            <TraditionCard 
              key={index} 
              tradition={tradition} 
              themeClass={themeClass} 
            />
          ))
        ) : (
          // Default text when no artifact is selected
          <div className="p-5 bg-gray-50 rounded-xl text-center h-full flex flex-col justify-center">
            <MapPin size={40} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-800">Select a Region Label to Begin</h3>
            <p className="text-gray-600 mt-2">
              This interactive map explores the rich, regional folk music traditions of Rajasthan. Click a colored label on the map to see its major musical styles, famous artists, and example songs.
            </p>
          </div>
        )}
      </div>

      {/* General Exploration link (outside of individual tradition cards) */}
      {artifact && (
          <div className="pt-4 mt-4 border-t border-gray-200">
              <p className="text-sm font-bold text-gray-700 mb-2">General Region Exploration:</p>
              <a href={`https://www.google.com/search?q=${encodeURIComponent(displayArtifact.region)}+folk+music+documentary`} target="_blank" rel="noopener noreferrer" className="text-sm flex items-center text-gray-600 hover:text-blue-800 transition-colors underline">
                  Search for Documentaries and History on {displayArtifact.region} Music
              </a>
          </div>
      )}

      {artifact && (
        <button 
          onClick={onReset}
          className={`mt-6 w-full py-3 rounded-lg font-bold text-white shadow-md transition-all duration-300 ${getButtonClass(themeClass)}`}
        >
          Back to Map Overview
        </button>
      )}
    </div>
  );
};

// --- MAIN APP COMPONENT ---

const App = () => {
  const [selectedArtifact, setSelectedArtifact] = useState(null);

  // Load Tailwind CSS script (essential for styling)
  useEffect(() => {
    if (!document.querySelector('script[src="https://cdn.tailwindcss.com"]')) {
        const script = document.createElement('script');
        script.src = "https://cdn.tailwindcss.com";
        document.head.appendChild(script);
    }
  }, []);

  const handleReset = () => {
    setSelectedArtifact(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 p-4 font-sans antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
        body { font-family: 'Inter', sans-serif; }
        
        /* Utility classes for dynamic Tailwind colors - Explicitly define colors for safety */
        .text-amber-700 { color: #b45309; }
        .text-sky-700 { color: #0369a1; }
        .text-red-700 { color: #b91c1c; }
        .text-emerald-700 { color: #047857; }
        .text-purple-700 { color: #7e22ce; }
        .text-gray-700 { color: #374151; }
        
        .bg-amber-700 { background-color: #b45309; }
        .bg-sky-700 { background-color: #0369a1; }
        .bg-red-700 { background-color: #b91c1c; }
        .bg-emerald-700 { background-color: #047857; }
        .bg-purple-700 { background-color: #7e22ce; }
        .bg-gray-700 { background-color: #374151; }

        /* Additional button hover classes for safety due to dynamic generation */
        .hover\\:bg-amber-800:hover { background-color: #92400e; }
        .hover\\:bg-sky-800:hover { background-color: #075985; }
        .hover\\:bg-red-800:hover { background-color: #991b1b; }
        .hover\\:bg-emerald-800:hover { background-color: #065f46; }
        .hover\\:bg-purple-800:hover { background-color: #6b21a8; }
        .hover\\:bg-gray-800:hover { background-color: #1f2937; }
        
        /* Ensure Leaflet components render correctly and z-index is appropriate */
        .leaflet-container {
            width: 100%;
            height: 100%;
            border-radius: 0.75rem; /* rounded-xl */
        }
        
        /* Custom Marker Styling */
        .custom-region-icon {
            background: transparent;
            border: none;
            box-shadow: none;
            pointer-events: auto; /* Ensure the marker is clickable */
        }
        .region-marker {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100px;
            height: 40px;
            border-radius: 20px; /* Pill shape */
            white-space: nowrap;
            cursor: pointer;
            text-align: center;
            font-family: 'Inter', sans-serif;
            font-size: 0.75rem; /* text-xs */
            user-select: none;
            line-height: 1;
        }
      `}</style>
      
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-orange-900 drop-shadow-md">
          <span className="text-amber-600">Mhara</span> Sangeet: Rajasthani Folk Music Map
        </h1>
        <p className="text-lg text-gray-600 mt-2">Explore the deep, regional roots of the Desert State's musical heritage.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
        <MapCanvas 
          onSelectArtifact={setSelectedArtifact}
          selectedArtifact={selectedArtifact}
        />
        <ArtifactDetails 
          artifact={selectedArtifact} 
          onReset={handleReset} 
        />
      </div>
    </div>
  );
};

export default App;
