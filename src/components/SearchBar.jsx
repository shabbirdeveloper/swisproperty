import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Home, BedDouble, Bath } from "lucide-react";
import { propertyTypes, locations } from "../data/sampleProperties.js";
import PriceRangeSlider from "./PriceRangeSlider.jsx";

const PRICE_MAX = 10000000;

// Defined at module scope so the text input is not remounted on each keystroke.
const Wrap = ({ icon: Icon, children }) => (
  <div className="relative flex items-center">
    <Icon className="pointer-events-none absolute left-3 h-4 w-4 text-gold" />
    {children}
  </div>
);

/**
 * Hero search bar. On submit it pushes selected filters to /listings via query string.
 */
export default function SearchBar() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [price, setPrice] = useState({ min: 0, max: PRICE_MAX });
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (location) params.set("location", location);
    if (propertyType) params.set("propertyType", propertyType);
    if (price.min > 0) params.set("minPrice", String(price.min));
    if (price.max < PRICE_MAX) params.set("maxPrice", String(price.max));
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (bathrooms) params.set("bathrooms", bathrooms);
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full rounded-2xl border border-white/40 bg-white/95 p-4 shadow-lift backdrop-blur sm:rounded-3xl sm:p-5"
    >
      {/* Price range bar (before the search fields) */}
      <div className="mb-4 rounded-xl bg-cloud px-4 py-3">
        <PriceRangeSlider
          min={0}
          max={PRICE_MAX}
          step={50000}
          value={price}
          onChange={setPrice}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Wrap icon={Search}>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search by keyword"
            className="field-luxe pl-9"
          />
        </Wrap>

        <Wrap icon={MapPin}>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="field-luxe pl-9 appearance-none"
          >
            <option value="">All Locations</option>
            {locations.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </Wrap>

        <Wrap icon={Home}>
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="field-luxe pl-9 appearance-none"
          >
            <option value="">All Property Types</option>
            {propertyTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Wrap>

        <Wrap icon={BedDouble}>
          <select
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            className="field-luxe pl-9 appearance-none"
          >
            <option value="">Bedrooms</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}+ Bedrooms
              </option>
            ))}
          </select>
        </Wrap>

        <Wrap icon={Bath}>
          <select
            value={bathrooms}
            onChange={(e) => setBathrooms(e.target.value)}
            className="field-luxe pl-9 appearance-none"
          >
            <option value="">Bathrooms</option>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}+ Bathrooms
              </option>
            ))}
          </select>
        </Wrap>
      </div>

      <button type="submit" className="btn-gold mt-4 w-full py-4 text-base">
        <Search className="h-5 w-5" />
        Search Property
      </button>
    </form>
  );
}
