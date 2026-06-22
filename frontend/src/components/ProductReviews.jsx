import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

const StarRow = ({ value, onChange, size = 18, readOnly = false }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        disabled={readOnly}
        onClick={() => onChange?.(n)}
        data-testid={`star-${n}`}
        className={readOnly ? "cursor-default" : "cursor-pointer"}
      >
        <Star size={size} strokeWidth={1.5} fill={n <= value ? "#B45F45" : "none"} color={n <= value ? "#B45F45" : "#1A1A1A"} />
      </button>
    ))}
  </div>
);

const ProductReviews = ({ productId }) => {
  const { user } = useAuth();
  const [data, setData] = useState({ reviews: [], avg: 0, count: 0 });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => api.get(`/products/${productId}/reviews`).then((r) => setData(r.data));
  useEffect(() => { load(); }, [productId]);

  const submit = async () => {
    if (comment.trim().length < 2) { toast.error("Write a comment"); return; }
    setSubmitting(true);
    try {
      await api.post(`/products/${productId}/reviews`, { rating, comment: comment.trim() });
      toast.success("Review posted");
      setComment(""); setRating(5); load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to post");
    } finally { setSubmitting(false); }
  };

  const del = async (id) => {
    if (!confirm("Delete review?")) return;
    await api.delete(`/reviews/${id}`);
    toast.success("Deleted"); load();
  };

  return (
    <section data-testid="product-reviews" className="mt-16 border-t border-[#E5E0D8] pt-12">
      <h2 className="font-serif-pipa text-4xl mb-2">Reviews</h2>
      <div className="flex items-center gap-3 mb-8">
        <StarRow value={Math.round(data.avg)} readOnly />
        <span className="text-sm text-[#4A4A4A]">{data.avg || 0} • {data.count} review{data.count === 1 ? "" : "s"}</span>
      </div>

      {user ? (
        <div className="bg-white border border-[#E5E0D8] p-5 rounded-md mb-8">
          <p className="text-sm mb-2">Your rating</p>
          <StarRow value={rating} onChange={setRating} size={22} />
          <textarea
            data-testid="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience…"
            className="w-full mt-3 border border-[#E5E0D8] px-3 py-2 text-sm rounded h-24 outline-none focus:border-[#B45F45]"
          />
          <button
            data-testid="review-submit"
            disabled={submitting}
            onClick={submit}
            className="mt-3 bg-[#1A1A1A] text-white px-5 py-2 text-xs uppercase tracking-widest hover:bg-[#B45F45] disabled:opacity-60"
          >
            {submitting ? "Posting…" : "Post Review"}
          </button>
        </div>
      ) : (
        <p className="text-sm text-[#4A4A4A] mb-6">Sign in to leave a review.</p>
      )}

      <div className="space-y-4">
        {data.reviews.map((r) => (
          <div key={r.id} data-testid={`review-${r.id}`} className="bg-white border border-[#E5E0D8] p-5 rounded-md">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{r.user_name}</div>
                <div className="text-xs text-[#4A4A4A]">{r.created_at?.slice(0, 10)}</div>
              </div>
              <div className="flex items-center gap-3">
                <StarRow value={r.rating} readOnly size={14} />
                {user && (user.id === r.user_id || user.role === "admin") && (
                  <button data-testid={`del-review-${r.id}`} onClick={() => del(r.id)} className="text-[#4A4A4A] hover:text-red-600">
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                )}
              </div>
            </div>
            <p className="mt-3 text-sm text-[#4A4A4A] leading-relaxed">{r.comment}</p>
          </div>
        ))}
        {data.reviews.length === 0 && <p className="text-sm text-[#4A4A4A]">No reviews yet. Be the first!</p>}
      </div>
    </section>
  );
};

export default ProductReviews;
