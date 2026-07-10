/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext.tsx";
import Navbar from "../components/Navbar.tsx";
import Footer from "../components/Footer.tsx";
import AuthModal from "../components/AuthModal.tsx";
import toast from "react-hot-toast";
import Loader from "../components/Loader.tsx";
import RestaurantHero from "../components/restaurant/RestaurantHero.tsx";
import RestaurantInfo from "../components/restaurant/RestaurantInfo.tsx";
import RestaurantReviews from "../components/restaurant/RestaurantReviews.tsx";
import BookingWidget from "../components/restaurant/BookingWidget.tsx";
import api from "../services/api";

export default function RestaurantDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, setAuthModalOpen } = useAppContext();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Booking Widget states
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedGuests, setSelectedGuests] = useState("2");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [slotsAvailability, setSlotsAvailability] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  // After fetching restaurant, fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!restaurant?.id) return;
      setLoadingReviews(true);
      try {
        const { data } = await api.get(`/reviews/?restaurant=${restaurant.id}`);
        setReviews(data);
      } catch {
        // ignore
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [restaurant?.id]);
  // Fetch restaurant by slug
  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const { data } = await api.get(`/restaurants/slug/${slug}/`);
        setRestaurant(data);
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Restaurant not found");
        navigate("/search", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
  }, [slug, navigate]);

  // Fetch availability when restaurant and selectedDate change
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!restaurant?.id || !selectedDate) {
        // ← use `id`
        setSlotsAvailability([]);
        return;
      }
      setLoadingSlots(true);
      try {
        const { data } = await api.get(
          `/restaurants/${restaurant.id}/availability/?date=${selectedDate}`, // ← use `id`
        );
        setSlotsAvailability(data);
      } catch (error) {
        toast.error("Could not load time slots");
        setSlotsAvailability([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchAvailability();
  }, [restaurant?.id, selectedDate]); // ← use `id`

  if (loading) {
    return <Loader text="Loading Restaurant Details..." />;
  }

  if (!restaurant) {
    return null;
  }

  const handleReserveClick = () => {
    if (!selectedSlot) {
      toast.error("Please select a dining time slot.");
      return;
    }

    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }

    // Redirect to confirmation page with query params
    navigate(
      `/booking/${restaurant.slug}?slot=${selectedSlot}&date=${selectedDate}&guests=${selectedGuests}`,
    );
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col pt-20">
      <Navbar />
      <AuthModal />

      {/* Hero Image Section */}
      <RestaurantHero restaurant={restaurant} />

      {/* Split Content Section */}
      <main className="grow max-w-7xl w-full mx-auto px-6 md:px-10 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column (Details, Menu, Reviews) */}
          <div className="lg:col-span-8 space-y-12">
            <RestaurantInfo restaurant={restaurant} />
            <RestaurantReviews reviews={reviews} />
          </div>

          {/* Right Column (Sticky Reservation Widget) */}
          <div className="lg:col-span-4 lg:sticky lg:top-36">
            <BookingWidget
              restaurant={restaurant}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedGuests={selectedGuests}
              setSelectedGuests={setSelectedGuests}
              selectedSlot={selectedSlot}
              setSelectedSlot={setSelectedSlot}
              slotsAvailability={slotsAvailability}
              loadingSlots={loadingSlots}
              isAuthenticated={isAuthenticated}
              handleReserveClick={handleReserveClick}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
