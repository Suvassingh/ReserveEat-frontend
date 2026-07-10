/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  useParams,
  useSearchParams,
  useNavigate,
  Link,
} from "react-router-dom";
import { useAppContext } from "../context/AppContext.tsx";
import Navbar from "../components/Navbar.tsx";
import Footer from "../components/Footer.tsx";
import { ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import Loader from "../components/Loader.tsx";
import BookingSuccess from "../components/booking/BookingSuccess.tsx";
import BookingSummary from "../components/booking/BookingSummary.tsx";
import BookingForm from "../components/booking/BookingForm.tsx";
import api from "../services/api";

export default function BookingConfirmation() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAppContext();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  // Form inputs
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [occasion, setOccasion] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  // From Query Params
  const slot = searchParams.get("slot") || "";
  const date = searchParams.get("date") || "";
  const guests = searchParams.get("guests") || "2";

  // Pre-fill form when user details load
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  // Fetch restaurant by slug
  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }
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

  // Redirect if not authenticated (but we allow guests to fill form; we'll handle auth on submit)
  // We'll keep the check inside handleConfirmSubmit – if not authenticated, show modal.

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!slot || !date) {
      toast.error(
        "Reservation details are missing. Please go back to the restaurant page.",
      );
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please log in to complete your booking.");
      // Optionally open auth modal – you can use context's setAuthModalOpen if available
      // For now we just redirect to login or show error.
      return;
    }

    setConfirming(true);
    try {
      const payload = {
        restaurant: restaurant.id,
        date,
        time: slot,
        guests: Number(guests),
        name,
        email,
        phone,
        occasion: occasion || undefined,
        special_requests: specialRequests || undefined,
      };
      console.log("🚀 Restaurant object:", restaurant);
      console.log("🚀 Restaurant ID:", restaurant.id, restaurant._id);
      const { data } = await api.post("/bookings/", payload);
      setConfirmedBooking(data);
      toast.success("Reservation confirmed!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Booking failed. Please try again.",
      );
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return <Loader text="Retrieving Dining Details..." />;
  }

  if (!restaurant) {
    return null; // or redirect handled
  }

  // Render Success Screen
  if (confirmedBooking) {
    return (
      <div className="min-h-screen bg-surface flex flex-col pt-20">
        <Navbar />
        <main className="grow flex items-center justify-center py-12 px-6">
          <BookingSuccess
            confirmedBooking={confirmedBooking}
            restaurant={restaurant}
            date={date}
            slot={slot}
            guests={guests}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col pt-20">
      <Navbar />

      {/* Main Booking Content */}
      <main className="grow max-w-7xl w-full mx-auto px-6 md:px-10 py-12">
        {/* Progress bar header */}
        <div className="flex items-center gap-2 mb-10 pb-4 border-b border-outline-variant/10 text-xs text-black/55">
          <Link
            to={`/restaurant/${restaurant.slug}`}
            className="hover:text-primary transition-colors"
          >
            {restaurant.name}
          </Link>
          <ChevronRight size={14} />
          <span className="text-primary">Details & Confirmation</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column (Reservation Summary) */}
          <div className="lg:col-span-5">
            <BookingSummary
              restaurant={restaurant}
              date={date}
              slot={slot}
              guests={guests}
            />
          </div>

          {/* Right Column (Guest Details Form) */}
          <div className="lg:col-span-7">
            <BookingForm
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              phone={phone}
              setPhone={setPhone}
              occasion={occasion}
              setOccasion={setOccasion}
              specialRequests={specialRequests}
              setSpecialRequests={setSpecialRequests}
              confirming={confirming}
              onSubmit={handleConfirmSubmit}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
