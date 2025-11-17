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
        case 'pink-700': return '#db2777'; // Added pink for Jaipur
        case 'teal-700': return '#0d9488'; // Added teal for Udaipur
        case 'indigo-700': return '#4338ca'; // Added indigo for Ajmer
        case 'cyan-700': return '#0891b2'; // Added cyan for Bikaner
        case 'lime-700': return '#65a30d'; // Added lime for Sikar
        case 'yellow-700': return '#ca8a04'; // Added yellow for Jaisalmer
        default: return '#374151'; // Default gray
    }
};

// Data representing key regions, their music, and enriched cultural information.
const artifactData = [
  {
    id: 1,
    region: "Jaipur (East-Central)",
    color: "bg-pink-500",
    theme: "pink-700",
    traditions: [
      {
        name: "Maand",
        description: "Maand is Rajasthan’s signature semi-classical vocal tradition, popular in Jaipur and spread by royal patronage. Known for melodious, intricate compositions sung in praise of kings or the beauty of Rajasthan, often accompanied by harmonium, sarangi, tabla, and dholak.",
        famousArtists: ["Allah Jilai Bai", "Gauri Devi", "Prem Damami"],
        exampleSong: "Kesariya Balam",
        // Image: https://www.shutterstock.com/search/maand-rajasthan
      }
    ]
  },
  {
    id: 2,
    region: "Jodhpur (Marwar)",
    color: "bg-purple-500",
    theme: "purple-700",
    traditions: [
      {
        name: "Langa Sarangi Vadan & Dhol",
        description: "The Langa community, centered in Jodhpur, are legendary sarangi players and vocalists. Their lively music is integral to Rajasthani weddings and harvest festivals, typically accompanied by dhol and harmonium.",
        famousArtists: ["Dare Khan Langa", "Ghewar Khan"],
        exampleSong: "Kesariya Balam (Langa rendition)",
        // Image: https://www.gettyimages.in/photos/langa-musicians
      },
      {
        name: "Manganiyar Lok Gayaki",
        description: "Manganiyars are hereditary bards performing epic ballads, devotional works, and romantic songs for Rajput patrons, using kamaicha, dholak, and harmonium.",
        famousArtists: ["Anwar Khan Manganiyar", "Mame Khan"],
        exampleSong: "Nimbooda Nimbooda",
        // Image: https://www.alamy.com/stock-photo/manganiyar-rajasthan.html
      }
    ]
  },
  {
    id: 3,
    region: "Udaipur (Mewar)",
    color: "bg-teal-600",
    theme: "teal-700",
    traditions: [
      {
        name: "Kalbelia Dance Music",
        description: "Kalbelia dance and music, performed by the snake-charmer Kalbelia community, is noted for fast-paced rhythms, high-energy singing, and skilled pungi and dholak playing.",
        famousArtists: ["Gulabo Sapera", "Kalbelia collectives"],
        exampleSong: "Udja Kale Kawa",
        // Image: https://www.freepik.com/free-photos-vectors/kalbelia-dance
      },
      {
        name: "Panihari",
        description: "Panihari songs, prominent in Mewar, narrate the life and emotions of women fetching water, set to gentle melodies and soulful lyrics.",
        famousArtists: ["Local Panihari singers"],
        exampleSong: "Panihari Geet",
        // Image: https://www.shutterstock.com/search/panihari
      }
    ]
  },
  {
    id: 4,
    region: "Ajmer (Central)",
    color: "bg-indigo-500",
    theme: "indigo-700",
    traditions: [
      {
        name: "Ajmer Sufi Qawwali",
        description: "Qawwali singing at Ajmer Sharif combines deep Sufi lyrics in Hindi, Persian, and Urdu with tabla and harmonium, creating ecstatic devotional soundscapes.",
        famousArtists: ["Warsis Brothers", "Ajmer Dargah Qawwals"],
        exampleSong: "Bhar Do Jholi Meri Ya Mohammad",
        // Image: https://www.gettyimages.in/photos/qawwali-ajmer
      }
    ]
  },
  {
    id: 5,
    region: "Bikaner (Northwest)",
    color: "bg-cyan-600",
    theme: "cyan-700",
    traditions: [
      {
        name: "Pabuji Ki Phach",
        description: "This oral epic tradition tells the tale of the folk hero Pabuji, narrated through song and giant phads (painted canvas backdrops).",
        famousArtists: ["Phad artists of Bikaner"],
        exampleSong: "Pabuji Ka Parichay",
        // Image: https://www.shutterstock.com/search/phad-rajasthan
      }
    ]
  },
  {
    id: 6,
    region: "Kota (Hadoti)",
    color: "bg-green-500",
    theme: "green-700",
    traditions: [
      {
        name: "Charbait (Hadoti region)",
        description: "Charbait features robust oral poetry in quatrain form on romantic, historical, or devotional themes. It is performed with voice modulation and duffs/drums.",
        famousArtists: ["Local Charbait poets", "Awwal Baabu"],
        exampleSong: "Qawwali (Hadoti region)",
        // Image: https://www.gettyimages.in/photos/kota-rajasthan
      }
    ]
  },
  {
    id: 7,
    region: "Alwar (Northeast)",
    color: "bg-amber-500",
    theme: "amber-700",
    traditions: [
      {
        name: "Bhapang Mewati",
        description: "The Bhapang is a rare single-string percussion instrument essential in Alwar’s folk music, accompanying bhajans, Marwari songs, and local poetry.",
        famousArtists: ["Jogi Community performers"],
        exampleSong: "Alwar Bhapang Bhajan",
        // Image: https://artsandculture.google.com/entity/bhapang/m01kllf
      }
    ]
  },
  {
    id: 8,
    region: "Sikar (Shekhawati)",
    color: "bg-lime-500",
    theme: "lime-700",
    traditions: [
      {
        name: "Ghoomar",
        description: "Shekhawati’s iconic dance-singing style, originally of the Bhil tribe, now a popular women’s folk dance with swirling ghaghara dresses and spirited choruses.",
        famousArtists: ["Local dance groups"],
        exampleSong: "Shekhawati Ghoomar Geet",
        // Image: https://www.freepik.com/free-photos-vectors/ghoomar-dance
      }
    ]
  },
  {
    id: 9,
    region: "Bhilwara (Central-South)",
    color: "bg-red-500",
    theme: "red-700",
    traditions: [
      {
        name: "Terah Taali",
        description: "Tribal Terah Taali features dancers with thirteen small manjira (metal cymbals) performing ceremonial dances, accompanied by devotional bhajans and dholak.",
        famousArtists: ["Meena and Bhil artists"],
        exampleSong: "Terah Taali Bhilwara",
        // Image: https://www.shutterstock.com/search/terah-taali
      }
    ]
  },
  {
    id: 10,
    region: "Bharatpur (Eastern/Braj)",
    color: "bg-blue-500",
    theme: "blue-700",
    traditions: [
      {
        name: "Braj Lok Sangeet",
        description: "Traditional Braj folk songs for Holi and festivals, with expressive vocals and dhol, harmonium accompaniment.",
        famousArtists: ["Local Braj singers"],
        exampleSong: "Braj Ki Holi Geet",
        // Image: https://www.shutterstock.com/search/braj-music
      }
    ]
  },
  {
    id: 11,
    region: "Jaisalmer (Desert-West)",
    color: "bg-yellow-400",
    theme: "yellow-700",
    traditions: [
      {
        name: "Manganiyar Desert Song",
        description: "Jaisalmer’s Manganiyars are famed hereditary bards who narrate desert epics, spirituals, and family histories through soulful vocals and ancient instruments—especially kamaicha, khartal, and dholak.",
        famousArtists: ["Gazi Khan Barna", "Sakar Khan", "Talab Khan"],
        exampleSong: "Chhedta Surang",
        // Image: https://www.gettyimages.in/photos/jaisalmer-music
      },
      {
        name: "Langa Songs",
        description: "Langas, also centering in Jaisalmer, are masters of sindhi sarangi and algoza, performing songs of love, nature, and war for royal patrons and local events.",
        famousArtists: ["Ghewar Khan Langa", "Ganga Devi Langa"],
        exampleSong: "Mumal Kevda",
        // Image: https://www.gettyimages.in/photos/jaisalmer-music
      },
      {
        name: "Desert Ballads (Haalariya, Ghooghri)",
        description: "Unique birth and ritual celebration songs like Haalariya and Ghooghri, as well as bhajans and shringar ras songs for solitude and daily desert life.",
        famousArtists: ["Local Bhopa, Manganiyar troupes"],
        exampleSong: "Haalariya (Jaisalmer region)",
        // Image: https://www.shutterstock.com/search/jaisalmer-music
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
        coordinates: [
          [
            [74.0, 30.5], [72.5, 29.5], [69.5, 28.0], [70.0, 25.0],
            [72.0, 24.0], [75.0, 23.5], [77.0, 24.5], [77.8, 27.5],
            [77.0, 29.5], [74.0, 30.5]
          ]
        ]
      }
    },
    // Updated and added regional points for cities with music forms
    {
      type: "Feature",
      properties: { id: 1, region: "Jaipur (East-Central)" },
      geometry: { type: "Point", coordinates: [75.7873, 26.9124] }
    },
    {
      type: "Feature",
      properties: { id: 2, region: "Jodhpur (Marwar)" },
      geometry: { type: "Point", coordinates: [73.0243, 26.2389] }
    },
    {
      type: "Feature",
      properties: { id: 3, region: "Udaipur (Mewar)" },
      geometry: { type: "Point", coordinates: [73.7125, 24.5854] }
    },
    {
      type: "Feature",
      properties: { id: 4, region: "Ajmer (Central)" },
      geometry: { type: "Point", coordinates: [74.6399, 26.4499] }
    },
    {
      type: "Feature",
      properties: { id: 5, region: "Bikaner (Northwest)" },
      geometry: { type: "Point", coordinates: [73.3119, 28.0229] }
    },
    {
      type: "Feature",
      properties: { id: 6, region: "Kota (Hadoti)" },
      geometry: { type: "Point", coordinates: [75.8648, 25.2138] }
    },
    {
      type: "Feature",
      properties: { id: 7, region: "Alwar (Northeast)" },
      geometry: { type: "Point", coordinates: [76.6346, 27.552990] }
    },
    {
      type: "Feature",
      properties: { id: 8, region: "Sikar (Shekhawati)" },
      geometry: { type: "Point", coordinates: [75.1399, 27.6094] }
    },
    {
      type: "Feature",
      properties: { id: 9, region: "Bhilwara (Central-South)" },
      geometry: { type: "Point", coordinates: [74.6359, 25.3460] }
    },
    {
      type: "Feature",
      properties: { id: 10, region: "Bharatpur (Eastern/Braj)" },
      geometry: { type: "Point", coordinates: [77.4895, 27.2173] }
    },
    {
      type: "Feature",
      properties: { id: 11, region: "Jaisalmer (Desert-West)" },
      geometry: { type: "Point", coordinates: [70.9084, 26.9157] }
    }
  ]
};

// Custom Icon Generator for Region Labels
const createRegionIcon = (artifact, isSelected) => {
    // Check for L globally before use
    const L = window.L;
    if (typeof L === 'undefined') return null;

    const themeColor = getThemeColor(artifact.theme);
  // Helper to convert hex color to rgba string for gradient stops
  const hexToRgba = (hex, alpha) => {
    // Remove # if present
    const h = hex.replace('#', '');
    const bigint = parseInt(h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
    const scale = isSelected ? 'scale(1.1)' : 'scale(1)';
    const shadow = isSelected ? '0 8px 15px rgba(0,0,0,0.4)' : '0 4px 10px rgba(0,0,0,0.3)';

    // Use the first word of the region name for the label text
    const labelText = artifact.region.split(' ')[0];
    
  // Build a larger divIcon
  // the pill-shaped label. The overall icon is square so we can center
  // the glow properly around the label anchor point.
  // Increase glow visibility: stronger start alpha and larger mid alpha
  const glowColorStart = hexToRgba(themeColor, 0.45);
  const glowColorMid = hexToRgba(themeColor, 0.15);

  // Larger icon to allow a more prominent glow
  const ICON_SIZE = 220;
  const ICON_RADIUS = ICON_SIZE / 2;
  const GLOW_BLUR_PX = 18;

  const iconHtml = `
    <div class="region-icon-outer" style="position:relative; width:${ICON_SIZE}px; height:${ICON_SIZE}px; display:flex; align-items:center; justify-content:center;">
      <div class="region-glow" style="position:absolute; width:${ICON_SIZE}px; height:${ICON_SIZE}px; border-radius:${ICON_RADIUS}px; background: radial-gradient(circle at 50% 45%, ${glowColorStart} 0%, ${glowColorMid} 35%, rgba(0,0,0,0) 75%); filter: blur(${GLOW_BLUR_PX}px); opacity:1;"></div>
      <div class="region-marker" 
         style="
           background-color:${themeColor}; 
           border: 3px solid white; 
           box-shadow: ${shadow}; 
           transform: ${scale};
           transition: transform 0.18s, box-shadow 0.18s;
           position:relative; z-index:2; display:flex; align-items:center; justify-content:center; padding:8px 16px; border-radius:20px;"
      >
        <span class="font-bold text-white text-xs">${labelText.toUpperCase()}</span>
      </div>
    </div>`;

  return L.divIcon({
    className: 'custom-region-icon',
    html: iconHtml,
    iconSize: [ICON_SIZE, ICON_SIZE], // Larger square to accommodate glow
    iconAnchor: [ICON_RADIUS, ICON_RADIUS] // Anchor at center of the glow so label appears outward
  });
};


// Style function for GeoJSON layer
const getGeoJsonStyle = (feature) => {
  // Hide the state border and regional polygons entirely; we render
  // visual emphasis using per-marker gradient glows instead of a border.
    // Remove state border (make invisible) and keep regional polygons invisible
    if (feature.properties.isStateBorder) {
      return {
        fillColor: 'transparent',
        weight: 0,
        opacity: 0,
        color: 'transparent',
        fillOpacity: 0,
      };
    }

    // Regional features used only for center calculation - keep invisible
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
                  let center;

                  // Handle Point geometries directly
                  if (feature.geometry.type === "Point") {
                    center = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
                  } else {
                    // For other geometries, use bounds
                    center = layer.getBounds().getCenter();
                  }

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
   * Effect 1: Initialize the map once. We assume Leaflet is preloaded via root index.html.
   * If Leaflet isn't present, show a helpful error and stop the loading spinner.
   */
  useEffect(() => {
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
            opacity: 0.8,
          }).addTo(map);

          mapRef.current = map;
          addGeoJSONAndMarkers(map, L);

          // Ensure invalidateSize() is called after the DOM element is fully rendered.
          setTimeout(() => {
            map.invalidateSize();
          }, 500);

          setLoading(false);
        } catch (e) {
          console.error('Leaflet map initialization failed:', e);
          setLeafletError('Failed to initialize the map. Please check the console for details.');
          setLoading(false);
        }
      }
    };

    // If Leaflet (window.L) is available (we preloaded it in `index.html`), initialize.
    if (typeof window !== 'undefined' && window.L) {
      initializeMap(window.L);
    } else {
      // Leaflet not present — set a clear error and stop showing the loading spinner.
      console.error('Leaflet (window.L) not found. Make sure leaflet.js is included in index.html before the app bundle.');
      setLeafletError('Leaflet library not loaded. Check your index.html for leaflet.js inclusion.');
      setLoading(false);
    }

    return () => {
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
    <div className="lg:w-2/3 w-full bg-white rounded-xl shadow-2xl overflow-hidden relative border-4 border-gray-300" style={{ height: '550px' }}>
        <div 
          ref={mapContainerRef} 
          id="leaflet-map" 
          className="w-full" 
          style={{ height: '100%', zIndex: 1 }} 
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
          <Mic size={14} className="mr-1" /> Famous Artists:
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
          <Search size={14} className="mr-1" /> Songs:
        </p>
        {tradition.exampleSongVideoId ? (
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src={`https://www.youtube.com/embed/${tradition.exampleSongVideoId}`}
              title={tradition.exampleSong}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-lg border border-gray-300"
            ></iframe>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No video available. Use the search block above to explore.</p>
        )}
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
        case 'pink-700': return 'bg-pink-700 hover:bg-pink-800'; // Pink button class
        case 'teal-700': return 'bg-teal-700 hover:bg-teal-800'; // Teal button class
        case 'indigo-700': return 'bg-indigo-700 hover:bg-indigo-800'; // Indigo button class
        case 'cyan-700': return 'bg-cyan-700 hover:bg-cyan-800'; // Cyan button class
        case 'lime-700': return 'bg-lime-700 hover:bg-lime-800'; // Lime button class
        case 'yellow-700': return 'bg-yellow-700 hover:bg-yellow-800'; // Yellow button class
        default: return 'bg-gray-700 hover:bg-gray-800';
    }
  };

  return (
    <div className="lg:w-2/3 w-full p-6 bg-white rounded-xl shadow-2xl flex flex-col mx-auto">
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


  const handleReset = () => {
    setSelectedArtifact(null);
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 p-4 font-sans antialiased">
      
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-orange-900 drop-shadow-md">
          <span className="text-amber-600">Mhara</span> Sangeet
        </h1>
        <p className="text-lg text-gray-600 mt-2">Explore the deep, regional roots of the Desert State's musical heritage.</p>
      </header>

      <div className="flex flex-col items-center gap-8 max-w-7xl mx-auto">
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
