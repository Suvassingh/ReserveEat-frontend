// src/components/restaurant/RestaurantReviews.tsx
import { Star } from "lucide-react";

interface Review {
  id: string;
  user: { name: string };
  rating: number;
  comment: string;
  visited_date: string;
}

interface RestaurantReviewsProps {
  reviews: Review[];
}

export default function RestaurantReviews({ reviews }: RestaurantReviewsProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <section className="space-y-8 pt-6 border-t border-outline-variant/10 text-left">
        <h3 className="font-display text-xl font-semibold text-primary">
          Guest Experiences
        </h3>
        <p className="text-xs text-black/55/80 italic">
          No reviews yet. Be the first to share your experience!
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-8 pt-6 border-t border-outline-variant/10 text-left">
      <h3 className="font-display text-xl font-semibold text-primary">
        Guest Experiences
      </h3>
      <div className="space-y-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="pb-6 border-b border-outline-variant/10 last:border-b-0 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-primary">
                  {review.user?.name || "Anonymous"}
                </h4>
                <span className="text-xs text-black/55">
                  Visited {new Date(review.visited_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-0.5 text-secondary">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    fill={i < review.rating ? "currentColor" : "none"}
                    className={i < review.rating ? "" : "text-outline-variant"}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-black/55 max-w-lg leading-relaxed">
              {review.comment}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
