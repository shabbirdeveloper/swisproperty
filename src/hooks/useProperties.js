import { useState, useEffect } from "react";
import {
  getAllProperties,
  getPropertyBySlug,
} from "../services/properties.js";

/** Load all properties with loading/error state. */
export function useProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getAllProperties()
      .then((data) => active && setProperties(data))
      .catch((e) => active && setError(e))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { properties, loading, error };
}

/** Load a single property by slug. */
export function useProperty(slug) {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setProperty(null);
    getPropertyBySlug(slug)
      .then((data) => active && setProperty(data))
      .catch((e) => active && setError(e))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug]);

  return { property, loading, error };
}
