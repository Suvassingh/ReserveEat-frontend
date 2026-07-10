/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar.tsx";
import Footer from "../components/Footer.tsx";
import RestaurantCard from "../components/RestaurantCard.tsx";
import AuthModal from "../components/AuthModal.tsx";
import {
  SlidersHorizontal,
  Search as SearchIcon,
  X,
  Check,
  MapPin,
  SearchXIcon,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Read filter values from URL
  const searchVal = searchParams.get("search") || "";
  const locationVal = searchParams.get("location") || "";
  const cuisinesSelected = searchParams.getAll("cuisine");
  const pricesSelected = searchParams.getAll("priceRange");
  const sortVal = searchParams.get("sort") || "";

  // Temp inputs for text fields
  const [tempSearch, setTempSearch] = useState(searchVal);
  const [tempLocation, setTempLocation] = useState(locationVal);

  // Sync temp inputs when URL changes (e.g., back/forward)
   useEffect(() => {
     setTempSearch(searchVal);
     setTempLocation(locationVal);
   }, [searchVal, locationVal]);

  // Build query params and fetch restaurants
 const fetchRestaurants = async () => {
   setLoading(true);
   try {
     const params: Record<string, any> = {};

     // Search – combines name, cuisine, location
     let searchQuery = searchVal;
     if (locationVal) {
       searchQuery = searchQuery
         ? `${searchQuery} ${locationVal}`
         : locationVal;
     }
     if (searchQuery) params.search = searchQuery;

     // Cuisine: send as comma-separated string
     if (cuisinesSelected.length > 0) {
       params.cuisine = cuisinesSelected.join(","); // e.g., "French,Italian"
     }

     // Price range: send as comma-separated string
     if (pricesSelected.length > 0) {
       params.price_range = pricesSelected.join(","); // e.g., "500,1500"
     }

     // Sort
     if (sortVal === "price_low") {
       params.ordering = "price_range";
     } else if (sortVal === "price_high") {
       params.ordering = "-price_range";
     }

     const { data } = await api.get("/restaurants/", { params });
setRestaurants(data.results || data);
   } catch (error: any) {
     toast.error(error.response?.data?.error || "Failed to load restaurants");
     setRestaurants([]);
   } finally {
     setLoading(false);
   }
 };

  // Fetch when URL params change
useEffect(() => {
  console.log("🔁 Effect triggered with:", {
    searchVal,
    locationVal,
    cuisines: cuisinesSelected.join(","),
    prices: pricesSelected.join(","),
    sortVal,
  });
  fetchRestaurants();
}, [
  searchVal,
  locationVal,
  cuisinesSelected.join(","),
  pricesSelected.join(","),
  sortVal,
]);

  // Extract unique cuisines from the current restaurant list
  const cuisineOptions = useMemo(() => {
    const cuisines = new Set<string>();
    restaurants.forEach((r) => {
      if (r.cuisine) cuisines.add(r.cuisine);
    });
    return Array.from(cuisines).sort();
  }, [restaurants]);

  const priceOptions = ["500", "1000", "1500", "2000"];

  // --- Handlers ---
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextParams = new URLSearchParams(searchParams);
    if (tempSearch) nextParams.set("search", tempSearch);
    else nextParams.delete("search");
    if (tempLocation) nextParams.set("location", tempLocation);
    else nextParams.delete("location");
    setSearchParams(nextParams);
  };

  const handleCuisineToggle = (cuisine: string) => {
    const nextParams = new URLSearchParams(searchParams);
    const current = nextParams.getAll("cuisine");
    if (current.includes(cuisine)) {
      const updated = current.filter((c) => c !== cuisine);
      nextParams.delete("cuisine");
      updated.forEach((u) => nextParams.append("cuisine", u));
    } else {
      nextParams.append("cuisine", cuisine);
    }
    setSearchParams(nextParams);
  };

  const handlePriceToggle = (price: string) => {
    const nextParams = new URLSearchParams(searchParams);
    const current = nextParams.getAll("priceRange");
    if (current.includes(price)) {
      const updated = current.filter((p) => p !== price);
      nextParams.delete("priceRange");
      updated.forEach((u) => nextParams.append("priceRange", u));
    } else {
      nextParams.append("priceRange", price);
    }
    setSearchParams(nextParams);
  };

  const handleSortChange = (sort: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (sort) nextParams.set("sort", sort);
    else nextParams.delete("sort");
    setSearchParams(nextParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setTempSearch("");
    setTempLocation("");
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col pt-20">
      <Navbar />
      <AuthModal />

      {/* Sub-header / Search inputs */}
      <div className="bg-white border-b border-outline-variant/10 py-4 z-10 sticky top-16 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row gap-4 items-center justify-between">
          <form
            onSubmit={handleTextSubmit}
            className="flex flex-wrap items-center gap-3 w-full md:w-auto"
          >
            <div className="relative grow sm:grow-0 min-w-[200px]">
              <SearchIcon
                size={16}
                className="absolute left-2.5 top-2 text-black/55/70"
              />
              <input
                type="text"
                placeholder="Search cuisine or name..."
                value={tempSearch}
                onChange={(e) => setTempSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-outline-variant/40 rounded-md focus:border-secondary focus:outline-none bg-surface-container-low/30"
              />
            </div>
            <div className="relative grow sm:grow-0 min-w-[200px]">
              <MapPin
                size={16}
                className="absolute left-2.5 top-2 text-black/55/70"
              />
              <input
                type="text"
                placeholder="Location..."
                value={tempLocation}
                onChange={(e) => setTempLocation(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-outline-variant/40 rounded-md focus:border-secondary focus:outline-none bg-surface-container-low/30"
              />
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-secondary text-white text-[10px] font-medium tracking-wider uppercase px-5 py-2.5 rounded-md cursor-pointer transition-colors"
            >
              UPDATE
            </button>
          </form>

          <div className="flex gap-3 w-full md:w-auto justify-end">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden flex items-center gap-1.5 border border-outline-variant/50 hover:border-primary text-xs font-medium px-4 py-2 bg-white cursor-pointer transition-colors"
            >
              <SlidersHorizontal size={14} />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      <main className="grow max-w-7xl w-full mx-auto px-6 md:px-10 py-10 flex gap-10">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-44 space-y-8">
            <div className="flex justify-between items-center pb-4 border-b border-outline-variant/10">
              <h3 className="font-display text-lg font-medium text-primary">
                Filters
              </h3>
              <button
                onClick={clearAllFilters}
                className="text-[10px] font-medium text-secondary hover:text-primary tracking-wider uppercase cursor-pointer"
              >
                Clear All
              </button>
            </div>

            {/* Cuisine Filter */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-primary tracking-wider uppercase">
                Cuisine
              </h4>
              <div className="space-y-2">
                {cuisineOptions.length === 0 ? (
                  <p className="text-xs text-black/50">No cuisines available</p>
                ) : (
                  cuisineOptions.map((c) => {
                    const active = cuisinesSelected.includes(c);
                    return (
                      <button
                        key={c}
                        onClick={() => handleCuisineToggle(c)}
                        className="w-full flex items-center justify-between text-left text-xs text-black/55 hover:text-primary transition-colors cursor-pointer py-1"
                      >
                        <span>{c}</span>
                        <div
                          className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors ${
                            active
                              ? "bg-primary border-primary text-white"
                              : "border-outline-variant"
                          }`}
                        >
                          {active && <Check size={10} />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-3">
              <h4 className="text-xs text-primary tracking-wider uppercase">
                Price Range
              </h4>
              <div className="grid grid-cols-4 gap-1.5">
                {priceOptions.map((p) => {
                  const active = pricesSelected.includes(p);
                  return (
                    <button
                      key={p}
                      onClick={() => handlePriceToggle(p)}
                      className={`py-2 text-center text-xs transition-colors cursor-pointer border rounded-sm ${
                        active
                          ? "bg-primary border-primary text-white"
                          : "border-outline-variant/50 text-on-surface hover:border-primary"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
               
              </div>
            </div>
          </div>
        </aside>

        {/* Results Section */}
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-outline-variant/10">
            <p className="text-sm text-black/55">
              {restaurants.length}{" "}
              {restaurants.length === 1 ? "Restaurant" : "Restaurants"}{" "}
              Available
            </p>

            <div className="flex items-center gap-2">
              <span className="text-xs text-black/55 tracking-wider uppercase">
                SORT BY:
              </span>
              <select
                value={sortVal}
                onChange={(e) => handleSortChange(e.target.value)}
                className="text-xs bg-transparent border border-outline-variant/30 px-3 py-1.5 focus:outline-none cursor-pointer rounded-sm"
              >
                <option value="">Default (Newest)</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grow flex justify-center items-center py-24">
              <div className="w-10 h-10 border-2 border-outline-variant/30 border-t-secondary rounded-full animate-spin"></div>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="grow flex flex-col items-center justify-center py-24 text-center">
              <SearchXIcon size={36} className="text-outline-variant mb-4" />
              <h3 className="font-display text-xl font-medium mb-2">
                No Restaurants Found
              </h3>
              <p className="text-xs text-black/50 max-w-sm mb-6">
                We couldn't find any premium establishments matching your search
                query. Try widening your filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="bg-primary hover:bg-secondary text-white text-xs tracking-widest uppercase px-6 py-3 transition-colors cursor-pointer"
              >
                CLEAR ALL FILTERS
              </button>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6 grow">
              <div className="grid gap-6 grow grid-cols-1 lg:grid-cols-2">
                {restaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm md:hidden animate-in fade-in duration-200">
          <div className="w-80 bg-white h-full p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-outline-variant/10">
                <h3 className="font-display text-lg font-medium text-primary">
                  Filters
                </h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 text-black/55 hover:text-primary transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Cuisines */}
              <div className="py-6 space-y-3">
                <h4 className="text-xs text-primary tracking-wider uppercase">
                  Cuisine
                </h4>
                <div className="space-y-2">
                  {cuisineOptions.length === 0 ? (
                    <p className="text-xs text-black/50">
                      No cuisines available
                    </p>
                  ) : (
                    cuisineOptions.map((c) => {
                      const active = cuisinesSelected.includes(c);
                      return (
                        <button
                          key={c}
                          onClick={() => handleCuisineToggle(c)}
                          className="w-full flex items-center justify-between text-left text-xs text-black/55 hover:text-primary py-1 cursor-pointer"
                        >
                          <span>{c}</span>
                          <div
                            className={`w-4 h-4 border rounded-sm flex items-center justify-center ${
                              active
                                ? "bg-primary border-primary text-white"
                                : "border-outline-variant"
                            }`}
                          >
                            {active && <Check size={10} />}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Prices */}
              <div className="py-4 space-y-3 border-t border-outline-variant/10">
                <h4 className="text-xs font-medium text-primary tracking-wider uppercase">
                  Price Range
                </h4>
                <div className="grid grid-cols-4 gap-1.5">
                  {priceOptions.map((p) => {
                    const active = pricesSelected.includes(p);
                    return (
                      <button
                        key={p}
                        onClick={() => handlePriceToggle(p)}
                        className={`py-2 text-center text-xs font-medium transition-colors cursor-pointer border rounded-sm ${
                          active
                            ? "bg-primary border-primary text-white"
                            : "border-outline-variant/50 text-on-surface hover:border-primary"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="border-t border-outline-variant/10 pt-4 flex gap-3">
              <button
                onClick={clearAllFilters}
                className="flex-1 border border-outline-variant/50 py-3 text-xs font-medium tracking-widest uppercase cursor-pointer"
              >
                CLEAR
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 bg-primary text-white py-3 text-xs font-medium tracking-widest uppercase hover:bg-secondary cursor-pointer"
              >
                APPLY
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
