import React, { useState } from "react";
import { Star, ThumbsUp, Tag, Send } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useSetups } from "../../context/SetupContext";

const AVAILABLE_TAGS = [
  "Aggressive",
  "Balanced",
  "Safe / Stable",
  "Loose Entry",
  "Tight Exit",
  "Kerb Friendly",
  "High Downforce",
  "Low Drag",
  "Endurance Pace",
  "Qualy Weapon"
];

interface SetupRatingCardProps {
  setupId: string;
}

export default function SetupRatingCard({ setupId }: SetupRatingCardProps) {
  const { user, profile, login } = useAuth();
  const { allRatingsList, saveRating } = useSetups();

  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filter ratings for this setup
  const setupRatings = allRatingsList.filter((r) => r.setupId === setupId);
  const averageRating =
    setupRatings.length > 0
      ? setupRatings.reduce((sum, r) => sum + r.rating, 0) / setupRatings.length
      : 0;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!user || !profile) {
      login();
      return;
    }
    setIsSubmitting(true);
    try {
      await saveRating(setupId, rating, selectedTags);
      setSelectedTags([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-4 font-sans text-left">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div>
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-400 fill-current" />
            Driver Ratings & Handling Tags
          </h4>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            Community feedback from Late Night Racing drivers
          </p>
        </div>

        {setupRatings.length > 0 && (
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
            <span className="text-sm font-black font-mono text-amber-400">
              {averageRating.toFixed(1)}
            </span>
            <div className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${star <= Math.round(averageRating) ? "fill-current" : "opacity-30"}`}
                />
              ))}
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              ({setupRatings.length})
            </span>
          </div>
        )}
      </div>

      {/* Aggregate Handling Tags */}
      {setupRatings.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
            Handling Characteristics:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {Array.from(new Set(setupRatings.flatMap((r) => r.tags || []))).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[10px] font-mono text-zinc-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Rating Submission Form */}
      <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-lg p-3 space-y-3">
        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
          Submit Your Rating:
        </span>

        {/* Stars Picker */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 hover:scale-110 transition-transform cursor-pointer"
                aria-label={`Rate ${star} star`}
              >
                <Star
                  className={`w-5 h-5 ${
                    star <= rating ? "text-amber-400 fill-current" : "text-zinc-700"
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-xs font-mono font-bold text-zinc-300">
            {rating} of 5 Stars
          </span>
        </div>

        {/* Tag Picker */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
            Select Tags (Optional):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {AVAILABLE_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-2 py-1 rounded text-[10px] font-mono transition-all cursor-pointer ${
                    isSelected
                      ? "bg-red-500/20 text-red-400 border border-red-500/40 font-bold"
                      : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-red-600/15 cursor-pointer active:scale-98"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isSubmitting ? "Submitting..." : user ? "Submit Driver Rating" : "Sign in to Rate"}</span>
        </button>
      </div>
    </div>
  );
}
