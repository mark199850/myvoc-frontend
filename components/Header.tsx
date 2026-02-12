import { Search, Info } from "lucide-react";
import React from "react";

interface HeaderProps {
  onQueryChange: (val: string) => void;
  onEnter: (learned: boolean) => void;
  wordCount: number;
  showEnterHint: boolean;
  isSearching: boolean;
  query: string;
  error: Error | null;
}

export const Header = React.memo(
  ({
    query,
    isSearching,
    onQueryChange,
    onEnter,
    showEnterHint,
    wordCount,
    error,
  }: HeaderProps) => {
    return (
      <div className="navbar bg-base-100 shadow-md z-10 flex-col gap-4 p-4 pb-0 relative">
        {/* Progress Bar */}
        <div className=" w-full">
          <progress
            className="progress bg-gray-600 w-full h-1.5"
            value={wordCount}
            max={1000}
          ></progress>
          <div className="flex justify-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-base-content/50">
              {wordCount} / {1000} Learned
            </span>
          </div>
        </div>

        {/* Search Input */}
        <div className="form-control w-full">
          <div className="relative flex items-center">
            {isSearching ? (
              <span className="loading loading-spinner loading-sm text-gray-400 absolute top-2.5 left-3 z-1 "></span>
            ) : (
              <Search
                size={18}
                className="absolute top-2.5 left-3 z-1 text-base-content/40"
              />
            )}
            <input
              type="text"
              placeholder="Search word or add a new one"
              className="input input-bordered focus:scale-103 active:scale-107 animate-cubic-bouncy-lg mb-1.5 w-full focus:outline-none focus:border-primary transition-all"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && showEnterHint && onEnter(true)
              }
            />
          </div>

          {/* Error / Hint label */}
          <label className="label justify-center w-full">
            {showEnterHint ? (
              <span className="label-text-alt flex">
                Press <kbd className="kbd kbd-xs">Enter</kbd> to add the first
                one as a new word
              </span>
            ) : (
              error?.name == "SEARCH_API_FAILED" && (
                <span className="text-error flex">
                  <Info size={18} /> Server error, showing only local words
                </span>
              )
            )}
          </label>
        </div>
      </div>
    );
  },
);
