// import { Link } from 'react-router-dom';

// export default function Home() {
//   return (
//     <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
//       <div className="text-center space-y-8 max-w-3xl">
//         {/* Main Heading */}
//         <h1 className="text-6xl md:text-8xl font-bold mb-4">
//           <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
//             Restaurant Finder
//           </span>
//         </h1>

//         {/* Subtitle */}
//         <p className="text-xl text-gray-600 mb-8">
//           Find restaurants by cuisine type and distance
//         </p>

//         {/* Features */}
//         <div className="flex justify-center gap-8 mb-12">
//           <div className="flex items-center gap-2 text-gray-600">
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
//                     d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//             <span>Search by Cuisine</span>
//           </div>
//           <div className="flex items-center gap-2 text-gray-600">
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
//                     d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//             </svg>
//             <span>Filter by Distance</span>
//           </div>
//         </div>

//         {/* CTA Button */}
//         <Link
//           to="/cuisine-search"
//           className="inline-block bg-gray-900 text-white px-12 py-4 rounded-full text-lg font-medium
//                    hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl
//                    transform hover:translate-y-[-2px]"
//         >
//           Start Exploring
//         </Link>

//         {/* Optional: Small text below button */}
//         <p className="text-sm text-gray-500 mt-8">
//           Discover restaurants near you with just a few clicks
//         </p>
//       </div>
//     </div>
//   );
// }

import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center space-y-10 max-w-3xl relative">
        {/* Decorative Background Element */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-200 rounded-full opacity-30 blur-3xl"></div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 text-orange-800 tracking-tight">
          <span className="relative inline-block">
            Feast Finder
            <span className="absolute -bottom-2 left-0 w-full h-2 bg-orange-400 transform -skew-x-12"></span>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-orange-600 mb-6 font-medium">
          Dive into delicious dining options near you
        </p>

        {/* Features */}
        <div className="flex justify-center gap-10 mb-10">
          <div className="flex items-center gap-3 text-orange-700 bg-orange-100 px-4 py-2 rounded-full shadow-sm">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="font-semibold">Cuisine Quest</span>
          </div>
          <div className="flex items-center gap-3 text-orange-700 bg-orange-100 px-4 py-2 rounded-full shadow-sm">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span className="font-semibold">Nearby Eats</span>
          </div>
        </div>

        {/* CTA Button */}
        <Link
          to="/cuisine-search"
          className="inline-block bg-orange-600 text-white px-10 py-4 rounded-lg text-xl font-semibold
                   hover:bg-orange-700 transition-all duration-300 shadow-md hover:shadow-lg
                   transform hover:scale-105"
        >
          Taste the Adventure
        </Link>

        {/* Optional: Small text below button */}
        <p className="text-sm text-orange-500 mt-6 italic">
          Your next favorite meal is waiting to be found!
        </p>
      </div>
    </div>
  );
}

