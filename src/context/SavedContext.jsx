import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { getSavedIds, addSaved, removeSaved } from "../services/saved.js";
import { useToast } from "./ToastContext.jsx";

/**
 * Saved/favorites store.
 * Backed by Supabase (saved_properties) when configured, else localStorage.
 * Updates optimistically and syncs to the backend.
 */
const SavedContext = createContext(null);

export function SavedProvider({ children }) {
  const [saved, setSaved] = useState([]);
  const toast = useToast();

  useEffect(() => {
    getSavedIds()
      .then(setSaved)
      .catch(() => setSaved([]));
  }, []);

  const toggleSaved = useCallback(
    (id) => {
      setSaved((prev) => {
        const has = prev.includes(id);
        // optimistic update
        const next = has ? prev.filter((x) => x !== id) : [...prev, id];
        (has ? removeSaved(id) : addSaved(id))
          .then(() =>
            has
              ? toast.info("Removed from wishlist")
              : toast.success("Added to wishlist")
          )
          .catch(() => {
            toast.error("Could not update wishlist");
            // revert on failure
            setSaved((cur) => (has ? [...cur, id] : cur.filter((x) => x !== id)));
          });
        return next;
      });
    },
    [toast]
  );

  const isSaved = useCallback((id) => saved.includes(id), [saved]);

  return (
    <SavedContext.Provider
      value={{ saved, toggleSaved, isSaved, count: saved.length }}
    >
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used within a SavedProvider");
  return ctx;
}
