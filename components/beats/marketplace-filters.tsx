"use client";

import { BeatGenre, BeatMood, BeatSort, beatGenres, beatMoods, beatPriceRange, beatBpmRange } from "@/lib/beats";

export type MarketplaceFiltersState = {
  genre: BeatGenre | "All";
  mood: BeatMood | "All";
  sort: BeatSort;
  maxPrice: number;
  bpmRange: [number, number];
};

type MarketplaceFiltersProps = {
  state: MarketplaceFiltersState;
  onChange: (next: MarketplaceFiltersState) => void;
};

export function MarketplaceFilters({ state, onChange }: MarketplaceFiltersProps) {
  return (
    <section className="marketplace-filters">
      <div className="filter-group">
        <label>
          Genre
          <select
            value={state.genre}
            onChange={(event) =>
              onChange({
                ...state,
                genre: event.target.value as MarketplaceFiltersState["genre"]
              })
            }
          >
            <option value="All">All</option>
            {beatGenres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </label>
        <label>
          Mood
          <select
            value={state.mood}
            onChange={(event) =>
              onChange({
                ...state,
                mood: event.target.value as MarketplaceFiltersState["mood"]
              })
            }
          >
            <option value="All">All</option>
            {beatMoods.map((mood) => (
              <option key={mood} value={mood}>
                {mood}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sort
          <select
            value={state.sort}
            onChange={(event) =>
              onChange({
                ...state,
                sort: event.target.value as BeatSort
              })
            }
          >
            <option value="latest">Latest</option>
            <option value="popular">Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="bpm-low">BPM: Low to High</option>
            <option value="bpm-high">BPM: High to Low</option>
          </select>
        </label>
      </div>

      <div className="filter-group filter-range-group">
        <label>
          Max Price
          <input
            type="range"
            min={beatPriceRange[0]}
            max={beatPriceRange[1]}
            value={state.maxPrice}
            onChange={(event) =>
              onChange({
                ...state,
                maxPrice: Number(event.target.value)
              })
            }
          />
          <span>${state.maxPrice}</span>
        </label>
        <label>
          Min BPM
          <input
            type="range"
            min={beatBpmRange[0]}
            max={beatBpmRange[1]}
            value={state.bpmRange[0]}
            onChange={(event) =>
              onChange({
                ...state,
                bpmRange: [Number(event.target.value), state.bpmRange[1]]
              })
            }
          />
          <span>{state.bpmRange[0]}</span>
        </label>
        <label>
          Max BPM
          <input
            type="range"
            min={beatBpmRange[0]}
            max={beatBpmRange[1]}
            value={state.bpmRange[1]}
            onChange={(event) =>
              onChange({
                ...state,
                bpmRange: [state.bpmRange[0], Number(event.target.value)]
              })
            }
          />
          <span>{state.bpmRange[1]}</span>
        </label>
      </div>
    </section>
  );
}
