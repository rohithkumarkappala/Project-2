// import { useState, useEffect, useCallback, useRef } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// export default function CuisineSearch() {
//   // Initialize state with values from localStorage if they exist
//   const [cuisine, setCuisine] = useState(() => localStorage.getItem('lastCuisine') || "");
//   const [restaurants, setRestaurants] = useState(() => {
//     const saved = localStorage.getItem('lastRestaurants');
//     return saved ? JSON.parse(saved) : [];
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [currentPage, setCurrentPage] = useState(() => 
//     parseInt(localStorage.getItem('lastPage')) || 1
//   );
//   const [totalPages, setTotalPages] = useState(() => 
//     parseInt(localStorage.getItem('lastTotalPages')) || 1
//   );
//   const [userLocation, setUserLocation] = useState(null);
//   const [locationError, setLocationError] = useState(null);
//   const [maxDistance, setMaxDistance] = useState(() => 
//     parseInt(localStorage.getItem('lastMaxDistance')) || 25
//   );
//   const [distanceRange, setDistanceRange] = useState(() => 
//     localStorage.getItem('lastDistanceRange') || 'nearby'
//   );
//   const [showDistanceFilter, setShowDistanceFilter] = useState(false);
//   const [showNotification, setShowNotification] = useState(false);
//   const [isDistanceFilterActive, setIsDistanceFilterActive] = useState(false);
//   const [searchMessage, setSearchMessage] = useState('');
//   const fileInputRef = useRef(null);
//   const navigate = useNavigate();

//   // Save state to localStorage whenever it changes
//   useEffect(() => {
//     if (cuisine) localStorage.setItem('lastCuisine', cuisine);
//     if (restaurants.length) localStorage.setItem('lastRestaurants', JSON.stringify(restaurants));
//     if (currentPage) localStorage.setItem('lastPage', currentPage.toString());
//     if (totalPages) localStorage.setItem('lastTotalPages', totalPages.toString());
//     if (maxDistance) localStorage.setItem('lastMaxDistance', maxDistance.toString());
//     if (distanceRange) localStorage.setItem('lastDistanceRange', distanceRange);
//   }, [cuisine, restaurants, currentPage, totalPages, maxDistance, distanceRange]);

//   // Get user's location when component mounts
//   useEffect(() => {
//     if ("geolocation" in navigator) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setUserLocation({
//             latitude: position.coords.latitude,
//             longitude: position.coords.longitude
//           });
//           setLocationError(null);
          
//           // If we have saved search results, perform the search again with location
//           if (cuisine && restaurants.length === 0) {
//             handleSearch(currentPage);
//           }
//         },
//         (error) => {
//           setLocationError("Unable to get your location. Distance calculation won't be available.");
//           console.error("Error getting location:", error);
//         }
//       );
//     } else {
//       setLocationError("Geolocation is not supported by your browser");
//     }
//   }, []);

//   // Clear saved data when leaving the page
//   useEffect(() => {
//     return () => {
//       // Optionally clear the saved data when component unmounts
//       // Comment this out if you want to persist across page refreshes
//       // localStorage.removeItem('lastCuisine');
//       // localStorage.removeItem('lastRestaurants');
//       // localStorage.removeItem('lastPage');
//       // localStorage.removeItem('lastTotalPages');
//       // localStorage.removeItem('lastMaxDistance');
//       // localStorage.removeItem('lastDistanceRange');
//     };
//   }, []);

//   // Update useEffect to handle dependencies warning and prevent infinite loop
//   useEffect(() => {
//     if ("geolocation" in navigator) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setUserLocation({
//             latitude: position.coords.latitude,
//             longitude: position.coords.longitude
//           });
//           setLocationError(null);
          
//           // If we have saved search results, perform the search again with location
//           if (cuisine && restaurants.length === 0) {
//             handleSearch(currentPage);
//           }
//         },
//         (error) => {
//           setLocationError("Unable to get your location. Distance calculation won't be available.");
//           console.error("Error getting location:", error);
//         }
//       );
//     } else {
//       setLocationError("Geolocation is not supported by your browser");
//     }
//   }, []); // Empty dependency array as we only want this to run once

//   // Optimize handleSearch with caching
//   const handleSearch = useCallback(async (page = 1) => {
//     if (!cuisine) {
//       alert("Please enter a cuisine type");
//       return;
//     }
//     setLoading(true);
//     setError(null);

//     try {
//       const params = new URLSearchParams({
//         cuisine: cuisine,
//         page: page.toString(),
//         limit: '6'
//       });

//       if (userLocation && isDistanceFilterActive) {
//         params.append('latitude', userLocation.latitude.toString());
//         params.append('longitude', userLocation.longitude.toString());
//         params.append('maxDistance', maxDistance.toString());
//       }

//       const response = await axios.get(`http://localhost:6969/restaurants-by-cuisine?${params}`);

//       if (!response.data) {
//         throw new Error('No data received');
//       }

//       const newRestaurants = response.data.data || [];
      
//       if (newRestaurants.length === 0) {
//         setError('No restaurants found for this cuisine type');
//         setRestaurants([]);
//       } else {
//         setRestaurants(newRestaurants);
//         setCurrentPage(response.data.current_page);
//         setTotalPages(response.data.total_pages);
//       }

//     } catch (err) {
//       console.error('Search error:', err);
//       setError(err.response?.data?.message || 'Failed to fetch restaurants. Please try again.');
//       setRestaurants([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [cuisine, userLocation, isDistanceFilterActive, maxDistance]);

//   // Update handlePageChange to handle both text and image-based searches
//   const handlePageChange = useCallback((newPage) => {
//     if (newPage >= 1 && newPage <= totalPages) {
//       if (fileInputRef.current?.files?.length > 0) {
//         // If there's a file selected, use image-based search
//         handleImageUpload({ target: { files: [fileInputRef.current.files[0]] } }, newPage);
//       } else {
//         // Otherwise use text-based search
//         handleSearch(newPage);
//       }
//     }
//   }, [handleSearch, totalPages]);

//   // Update handleDistanceRangeChange
//   const handleDistanceRangeChange = useCallback((range) => {
//     setDistanceRange(range);
//     setIsDistanceFilterActive(true);
//     let newDistance;
    
//     switch (range) {
//       case 'nearby':
//         newDistance = 10;
//         break;
//       case 'city':
//         newDistance = 50;
//         break;
//       case 'state':
//         newDistance = 500;
//         break;
//       case 'country':
//         newDistance = 3000;
//         break;
//       default:
//         newDistance = 50;
//     }
    
//     setMaxDistance(newDistance);
//     if (cuisine) {
//       setShowNotification(true);
//       setSearchMessage(`Range updated to ${range}. Click Search to see restaurants within ${newDistance}km`);
//       setTimeout(() => setShowNotification(false), 6000);
//     }
//   }, [cuisine]);

//   // Update form submit handler
//   const handleSubmit = useCallback((e) => {
//     e.preventDefault();
//     if (cuisine.trim()) {
//       handleSearch(1);
//     }
//   }, [handleSearch, cuisine]);

//   // Function to handle distance range change
//   const handleClearDistanceFilter = () => {
//     setIsDistanceFilterActive(false);
//     handleSearch(1);
//   };

//   // Update handleRestaurantClick to save current state before navigation
//   const handleRestaurantClick = (restaurantId) => {
//     // Save current state before navigating
//     localStorage.setItem('lastCuisine', cuisine);
//     localStorage.setItem('lastRestaurants', JSON.stringify(restaurants));
//     localStorage.setItem('lastPage', currentPage.toString());
//     localStorage.setItem('lastTotalPages', totalPages.toString());
//     localStorage.setItem('lastMaxDistance', maxDistance.toString());
//     localStorage.setItem('lastDistanceRange', distanceRange);
    
//     navigate(`/restaurant/${restaurantId}`);
//   };

//   // Update handleImageUpload to handle pagination properly
//   const handleImageUpload = async (e, page = 1) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setLoading(true);
//     setError(null);

//     const formData = new FormData();
//     formData.append('image', file);

//     try {
//       const response = await axios.post(`http://localhost:6969/api/analyze-image?page=${page}&limit=6`, formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       if (response.data.success) {
//         setRestaurants(response.data.result);
//         setTotalPages(response.data.totalPages);
//         setCurrentPage(response.data.currentPage);
//         setCuisine(response.data.searchTags.join(', ')); // Set detected cuisines
//       } else {
//         setError('No restaurants found for the detected cuisine');
//       }
//     } catch (err) {
//       console.error('Image analysis error:', err);
//       setError('Failed to analyze image. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <style>{`
//         @keyframes fadeInUp {
//           from {
//             opacity: 0;
//             transform: translateY(20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         .animate-fade-in-up {
//           animation: fadeInUp 0.3s ease-out;
//           z-index: 50;
//         }
//       `}</style>
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-8">
//         <div className="max-w-7xl mx-auto">
//         <button
//           onClick={() => navigate(-1)}
//           className="mb-6 flex cursor-pointer items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
//         >
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//           </svg>
//           Back to Home
//         </button>
//           <h1 className="text-5xl font-semibold mb-12 text-center text-gray-900 tracking-tight">
//             Find Your Next Meal
//             <span className="block text-lg font-normal text-gray-500 mt-2">
//               Search restaurants by cuisine type
//               {userLocation && <span className="text-green-500 ml-2">• Location enabled</span>}
//             </span>
//           </h1>
        
//           {locationError && (
//             <div className="max-w-2xl mx-auto mb-4">
//               <p className="text-amber-600 text-sm text-center">{locationError}</p>
//             </div>
//           )}
        
//           <div className="flex flex-col gap-4 mb-12 max-w-2xl mx-auto">
//             <div className="flex flex-col items-center gap-4 p-6 bg-white/70 backdrop-blur-xl rounded-2xl">
//               <h2 className="text-lg font-medium text-gray-900">Search by Image</h2>
//               <p className="text-sm text-gray-500 text-center">
//                 Upload a food image and we&apos;ll find restaurants serving similar cuisine
//               </p>
              
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={handleImageUpload}
//                 accept="image/*"
//                 className="hidden"
//               />
              
//               <button
//                 onClick={() => fileInputRef.current.click()}
//                 className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl
//                          hover:bg-gray-800 transition-colors"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
//                         d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                 </svg>
//                 Upload Food Image
//               </button>
//             </div>

//             <div className="text-center text-gray-500">- OR -</div>

//             <form onSubmit={handleSubmit} className="flex gap-4">
//               <input
//                 type="text"
//                 value={cuisine}
//                 onChange={(e) => setCuisine(e.target.value)}
//                 placeholder="Enter cuisine type (e.g., Italian, Chinese)"
//                 className="flex-1 p-4 rounded-xl border-2 border-gray-200 focus:border-gray-900 
//                          focus:outline-none transition-colors"
//                 disabled={loading}
//               />
//               <button
//                 type="submit"
//                 disabled={!cuisine.trim() || loading}
//                 className={`px-8 rounded-xl transition-colors ${
//                   !cuisine.trim() || loading
//                     ? 'bg-gray-300 cursor-not-allowed'
//                     : 'bg-gray-900 hover:bg-gray-800'
//                 } text-white`}
//               >
//                 {loading ? 'Searching...' : 'Search'}
//               </button>
//             </form>

//             {userLocation && (
//               <div className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl space-y-3">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
//                             d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
//                             d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//                     </svg>
//                     <span className="text-gray-700 font-medium">Distance Filter</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     {isDistanceFilterActive && (
//                       <button
//                         onClick={handleClearDistanceFilter}
//                         className="text-red-500 hover:text-red-700 text-sm"
//                       >
//                         Clear Filter
//                       </button>
//                     )}
//                     <button
//                       onClick={() => setShowDistanceFilter(!showDistanceFilter)}
//                       className="text-gray-500 hover:text-gray-700"
//                     >
//                       {showDistanceFilter ? 'Hide' : 'Show'}
//                     </button>
//                   </div>
//                 </div>

//                 {showDistanceFilter && (
//                   <div className="pt-2 space-y-4">
//                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
//                       <button
//                         onClick={() => handleDistanceRangeChange('nearby')}
//                         className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
//                           ${distanceRange === 'nearby' 
//                             ? 'bg-gray-900 text-white' 
//                             : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
//                       >
//                         Nearby (10km)
//                       </button>
//                       <button
//                         onClick={() => handleDistanceRangeChange('city')}
//                         className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
//                           ${distanceRange === 'city' 
//                             ? 'bg-gray-900 text-white' 
//                             : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
//                       >
//                         City (50km)
//                       </button>
//                       <button
//                         onClick={() => handleDistanceRangeChange('state')}
//                         className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
//                           ${distanceRange === 'state' 
//                             ? 'bg-gray-900 text-white' 
//                             : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
//                       >
//                         State (500km)
//                       </button>
//                       <button
//                         onClick={() => handleDistanceRangeChange('country')}
//                         className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
//                           ${distanceRange === 'country' 
//                             ? 'bg-gray-900 text-white' 
//                             : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
//                       >
//                         Country (3000km)
//                       </button>
//                     </div>

//                     <div className="flex items-center gap-3 text-sm text-gray-500">
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
//                               d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                       </svg>
//                       <span>
//                         {distanceRange === 'nearby' && "Shows restaurants within walking or short driving distance"}
//                         {distanceRange === 'city' && "Shows restaurants across your city and nearby areas"}
//                         {distanceRange === 'state' && "Shows restaurants across your state/region"}
//                         {distanceRange === 'country' && "Shows restaurants anywhere in the country"}
//                       </span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           {showNotification && (
//             <div className="fixed inset-x-0 top-6 h-40 flex justify-center">
//               <div className="bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg 
//                             animate-fade-in-up flex items-center gap-3 max-w-md">
//                 <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
//                         d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//                 <div className="flex flex-col">
//                   <span className="font-medium">{searchMessage}</span>
//                   <button 
//                     onClick={() => handleSearch(1)}
//                     className="mt-2 bg-white/20 cursor-pointer hover:bg-white/30 text-sm px-4 py-2 rounded-lg transition-colors"
//                   >
//                     Search Now
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {loading && (
//             <div className="flex justify-center my-12">
//               <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-gray-200 border-t-gray-900"></div>
//             </div>
//           )}
          
//           {error && (
//             <div className="max-w-2xl mx-auto mb-12">
//               <div className="bg-white/70 backdrop-blur-xl border border-red-100 p-4 rounded-2xl">
//                 <p className="text-red-600 text-center">{error}</p>
//               </div>
//             </div>
//           )}

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {restaurants.map((restaurant) => (
//               <div
//                 key={restaurant.id}
//                 onClick={() => handleRestaurantClick(restaurant.id)}
//                 className="group bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-sm 
//                           hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1
//                           cursor-pointer"
//               >
//                 {restaurant.featured_image && (
//                   <div className="mb-6 rounded-2xl overflow-hidden h-56">
//                     <img
//                       src={restaurant.featured_image}
//                       alt={restaurant.name}
//                       className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
//                     />
//                   </div>
//                 )}
//                 <h2 className="text-xl font-semibold mb-3 text-gray-900">{restaurant.name}</h2>
//                 <div className="space-y-3">
//                   <p className="text-gray-500 font-medium">{restaurant.cuisines}</p>
//                   <p className="text-gray-400 text-sm">{restaurant.location?.address}</p>
//                   <div className="flex items-center bg-gray-50 rounded-full px-4 py-2 w-fit">
//                     <span className="text-gray-900 font-semibold mr-1">{restaurant.user_rating?.aggregate_rating}</span>
//                     <span className="text-yellow-400">★</span>
//                   </div>
//                 </div>
                
//                 {restaurant.distance && (
//                   <div className="mt-3 flex items-center text-sm text-gray-500">
//                     <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
//                             d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
//                             d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//                     </svg>
//                     {restaurant.distance < 1 
//                       ? `${(restaurant.distance * 1000).toFixed(0)}m away`
//                       : restaurant.distance >= 100
//                         ? `${(restaurant.distance / 1000).toFixed(1)}k km away`
//                         : `${restaurant.distance.toFixed(1)} km away`
//                     }
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>

//           {restaurants.length > 0 && (
//             <div className="mt-16 mb-8 flex justify-center items-center gap-6">
//               <button
//                 onClick={() => handlePageChange(currentPage - 1)}
//                 disabled={currentPage === 1}
//                 className={`px-6 py-3 rounded-xl backdrop-blur-xl transition-all duration-300 ${
//                   currentPage === 1
//                     ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                     : 'bg-white/70 text-gray-900 hover:bg-gray-900 hover:text-white shadow-sm'
//                 }`}
//               >
//                 Previous
//               </button>
//               <span className="px-6 py-3 bg-white/70 backdrop-blur-xl rounded-xl text-gray-900 font-medium">
//                 {currentPage} of {totalPages}
//               </span>
//               <button
//                 onClick={() => handlePageChange(currentPage + 1)}
//                 disabled={currentPage === totalPages}
//                 className={`px-6 py-3 rounded-xl backdrop-blur-xl transition-all duration-300 ${
//                   currentPage === totalPages
//                     ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                     : 'bg-white/70 text-gray-900 hover:bg-gray-900 hover:text-white shadow-sm'
//                 }`}
//               >
//                 Next
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function FoodExplorer() {
  const [foodType, setFoodType] = useState(() => localStorage.getItem('lastCuisine') || "");
  const [eateries, setEateries] = useState(() => {
    const stored = localStorage.getItem('lastRestaurants');
    return stored ? JSON.parse(stored) : [];
  });
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [pageNumber, setPageNumber] = useState(() => 
    parseInt(localStorage.getItem('lastPage')) || 1
  );
  const [pageCount, setPageCount] = useState(() => 
    parseInt(localStorage.getItem('lastTotalPages')) || 1
  );
  const [currentPosition, setCurrentPosition] = useState(null);
  const [positionError, setPositionError] = useState(null);
  const [radiusLimit, setRadiusLimit] = useState(() => 
    parseInt(localStorage.getItem('lastMaxDistance')) || 25
  );
  const [proximitySetting, setProximitySetting] = useState(() => 
    localStorage.getItem('lastDistanceRange') || 'nearby'
  );
  const [displayRadiusOptions, setDisplayRadiusOptions] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [radiusFilterOn, setRadiusFilterOn] = useState(false);
  const [searchNote, setSearchNote] = useState('');
  const photoInput = useRef(null);
  const navigation = useNavigate();

  useEffect(() => {
    if (foodType) localStorage.setItem('lastCuisine', foodType);
    if (eateries.length) localStorage.setItem('lastRestaurants', JSON.stringify(eateries));
    if (pageNumber) localStorage.setItem('lastPage', pageNumber.toString());
    if (pageCount) localStorage.setItem('lastTotalPages', pageCount.toString());
    if (radiusLimit) localStorage.setItem('lastMaxDistance', radiusLimit.toString());
    if (proximitySetting) localStorage.setItem('lastDistanceRange', proximitySetting);
  }, [foodType, eateries, pageNumber, pageCount, radiusLimit, proximitySetting]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentPosition({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
          setPositionError(null);
          if (foodType && eateries.length === 0) {
            fetchEateries(pageNumber);
          }
        },
        (err) => {
          setPositionError("Can't detect your location. Distance features will be limited.");
          console.error("Location error:", err);
        }
      );
    } else {
      setPositionError("Your browser doesn't support location services");
    }
  }, []);

  const fetchEateries = useCallback(async (page = 1) => {
    if (!foodType) {
      alert("Please specify a food type");
      return;
    }
    setIsFetching(true);
    setFetchError(null);

    try {
      const queryParams = new URLSearchParams({
        cuisine: foodType,
        page: page.toString(),
        limit: '6'
      });

      if (currentPosition && radiusFilterOn) {
        queryParams.append('latitude', currentPosition.latitude.toString());
        queryParams.append('longitude', currentPosition.longitude.toString());
        queryParams.append('maxDistance', radiusLimit.toString());
      }

      const result = await axios.get(`http://localhost:6969/restaurants-by-cuisine?${queryParams}`);

      if (!result.data) {
        throw new Error('No response data');
      }

      const foundEateries = result.data.data || [];
      
      if (foundEateries.length === 0) {
        setFetchError('No eateries found for this food type');
        setEateries([]);
      } else {
        setEateries(foundEateries);
        setPageNumber(result.data.current_page);
        setPageCount(result.data.total_pages);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setFetchError(err.response?.data?.message || 'Error loading eateries. Try again.');
      setEateries([]);
    } finally {
      setIsFetching(false);
    }
  }, [foodType, currentPosition, radiusFilterOn, radiusLimit]);

  const switchPage = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pageCount) {
      if (photoInput.current?.files?.length > 0) {
        processPhotoUpload({ target: { files: [photoInput.current.files[0]] } }, newPage);
      } else {
        fetchEateries(newPage);
      }
    }
  }, [fetchEateries, pageCount]);

  const updateProximity = useCallback((range) => {
    setProximitySetting(range);
    setRadiusFilterOn(true);
    let newRadius;
    
    switch (range) {
      case 'nearby': newRadius = 10; break;
      case 'city': newRadius = 50; break;
      case 'state': newRadius = 500; break;
      case 'country': newRadius = 3000; break;
      default: newRadius = 50;
    }
    
    setRadiusLimit(newRadius);
    if (foodType) {
      setShowAlert(true);
      setSearchNote(`Proximity set to ${range}. Press Explore to find eateries within ${newRadius}km`);
      setTimeout(() => setShowAlert(false), 6000);
    }
  }, [foodType]);

  const submitSearch = useCallback((e) => {
    e.preventDefault();
    if (foodType.trim()) {
      fetchEateries(1);
    }
  }, [fetchEateries, foodType]);

  const removeRadiusFilter = () => {
    setRadiusFilterOn(false);
    fetchEateries(1);
  };

  const viewEatery = (eateryId) => {
    localStorage.setItem('lastCuisine', foodType);
    localStorage.setItem('lastRestaurants', JSON.stringify(eateries));
    localStorage.setItem('lastPage', pageNumber.toString());
    localStorage.setItem('lastTotalPages', pageCount.toString());
    localStorage.setItem('lastMaxDistance', radiusLimit.toString());
    localStorage.setItem('lastDistanceRange', proximitySetting);
    
    navigation(`/restaurant/${eateryId}`);
  };

  const processPhotoUpload = async (e, page = 1) => {
    const photo = e.target.files[0];
    if (!photo) return;

    setIsFetching(true);
    setFetchError(null);

    const uploadData = new FormData();
    uploadData.append('image', photo);

    try {
      const response = await axios.post(`http://localhost:6969/api/analyze-image?page=${page}&limit=6`, uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setEateries(response.data.result);
        setPageCount(response.data.totalPages);
        setPageNumber(response.data.currentPage);
        setFoodType(response.data.searchTags.join(', '));
      } else {
        setFetchError('No eateries found for detected food type');
      }
    } catch (err) {
      console.error('Photo analysis error:', err);
      setFetchError('Unable to process photo. Please try again.');
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in { animation: slideIn 0.4s ease-in; }
      `}</style>
      <div className="min-h-screen bg-gray-100 py-10 px-6">
        <div className="container mx-auto max-w-6xl">
          <button
            onClick={() => navigation(-1)}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            Return to Main
          </button>

          <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">
            Discover Dining Options
            <span className="block text-base text-gray-600 mt-1">
              Explore by food type
              {currentPosition && <span className="text-blue-500 ml-2">• Position detected</span>}
            </span>
          </h1>

          {positionError && (
            <p className="text-center text-orange-500 text-sm mb-6">{positionError}</p>
          )}

          <div className="space-y-6 mb-10 max-w-xl mx-auto">
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <h2 className="text-xl text-gray-800 font-medium mb-2">Photo Search</h2>
              <p className="text-gray-600 text-sm mb-3">
                Upload a dish photo to find matching eateries
              </p>
              <input
                type="file"
                ref={photoInput}
                onChange={processPhotoUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => photoInput.current.click()}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
              >
                Add Dish Photo
              </button>
            </div>

            <div className="text-center text-gray-500">or</div>

            <form onSubmit={submitSearch} className="flex items-center space-x-3">
              <input
                type="text"
                value={foodType}
                onChange={(e) => setFoodType(e.target.value)}
                placeholder="Type of food (e.g., Mexican, Thai)"
                className="flex-1 p-3 rounded-lg border border-gray-300 focus:border-blue-500 outline-none"
                disabled={isFetching}
              />
              <button
                type="submit"
                disabled={!foodType.trim() || isFetching}
                className={`px-6 py-3 rounded-lg ${
                  !foodType.trim() || isFetching
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isFetching ? 'Exploring...' : 'Explore'}
              </button>
            </form>

            {currentPosition && (
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Area Filter</span>
                  <div className="space-x-2">
                    {radiusFilterOn && (
                      <button
                        onClick={removeRadiusFilter}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Reset
                      </button>
                    )}
                    <button
                      onClick={() => setDisplayRadiusOptions(!displayRadiusOptions)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {displayRadiusOptions ? 'Close' : 'Open'}
                    </button>
                  </div>
                </div>

                {displayRadiusOptions && (
                  <div className="mt-3 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {['nearby', 'city', 'state', 'country'].map(range => (
                        <button
                          key={range}
                          onClick={() => updateProximity(range)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            proximitySetting === range
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                        >
                          {range.charAt(0).toUpperCase() + range.slice(1)}
                          {range === 'nearby' && ' (10km)'}
                          {range === 'city' && ' (50km)'}
                          {range === 'state' && ' (500km)'}
                          {range === 'country' && ' (3000km)'}
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">
                      {proximitySetting === 'nearby' && "Local spots within a short trip"}
                      {proximitySetting === 'city' && "City-wide dining options"}
                      {proximitySetting === 'state' && "Regional restaurant selection"}
                      {proximitySetting === 'country' && "Nationwide eatery search"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {showAlert && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white p-4 rounded-lg animate-slide-in">
              <p>{searchNote}</p>
              <button
                onClick={() => fetchEateries(1)}
                className="mt-2 bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100"
              >
                Explore Now
              </button>
            </div>
          )}

          {isFetching && (
            <div className="text-center my-10">
              <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {fetchError && (
            <p className="text-center text-red-600 bg-white p-3 rounded-lg mb-8 max-w-md mx-auto">
              {fetchError}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {eateries.map((place) => (
              <div
                key={place.id}
                onClick={() => viewEatery(place.id)}
                className="bg-white p-5 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
              >
                {place.featured_image && (
                  <img
                    src={place.featured_image}
                    alt={place.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h2 className="text-lg font-semibold text-gray-800">{place.name}</h2>
                <p className="text-gray-600">{place.cuisines}</p>
                <p className="text-gray-500 text-sm">{place.location?.address}</p>
                <div className="mt-2 flex items-center">
                  <span className="text-gray-800 font-medium">{place.user_rating?.aggregate_rating}</span>
                  <span className="text-yellow-500 ml-1">★</span>
                </div>
                {place.distance && (
                  <p className="text-gray-500 text-sm mt-2">
                    {place.distance < 1
                      ? `${(place.distance * 1000).toFixed(0)}m`
                      : place.distance >= 100
                        ? `${(place.distance / 1000).toFixed(1)}k km`
                        : `${place.distance.toFixed(1)} km`}
                  </p>
                )}
              </div>
            ))}
          </div>

          {eateries.length > 0 && (
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                onClick={() => switchPage(pageNumber - 1)}
                disabled={pageNumber === 1}
                className={`px-4 py-2 rounded-lg ${
                  pageNumber === 1 ? 'bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Back
              </button>
              <span className="px-4 py-2 bg-white rounded-lg">
                Page {pageNumber}/{pageCount}
              </span>
              <button
                onClick={() => switchPage(pageNumber + 1)}
                disabled={pageNumber === pageCount}
                className={`px-4 py-2 rounded-lg ${
                  pageNumber === pageCount ? 'bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Forward
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}