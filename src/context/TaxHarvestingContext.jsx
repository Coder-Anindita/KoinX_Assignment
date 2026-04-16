import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { fetchHoldings, fetchCapitalGains } from "../services/api.js";

const TaxContext = createContext();
export const useTax = () => useContext(TaxContext);

/**
 * Rounds a number to 2 decimal places using the "round half away from zero"
 * method. Eliminates floating-point accumulation errors like 0.10000000000001.
 *
 * Example: round2(1200.005) → 1200.01  (not 1200.00 as plain toFixed gives)
 */
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export const TaxProvider = ({ children }) => {
  const [holdings, setHoldings] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [initialGains, setInitialGains] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ───────────────── Fetch Data ───────────────── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [h, g] = await Promise.all([
          fetchHoldings(),
          fetchCapitalGains(),
        ]);

        setHoldings(h);
        setInitialGains(g?.capitalGains ?? null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ───────────────── FAST LOOKUP MAP ───────────────── */
  const holdingsMap = useMemo(() => {
    const map = new Map();
    holdings.forEach((h) => map.set(h.coin, h));
    return map;
  }, [holdings]);

  /* ───────────────── PRE HARVEST ───────────────────────────────────────
     Directly derived from the API response. No selected holdings involved.
     All values rounded to 2dp at the point of storage so every downstream
     consumer (CapitalGainsCard, savings calc) works with clean numbers.    */
  const pre = useMemo(() => {
    if (!initialGains) return null;

    // Safely extract raw API values (default 0 if missing)
    const stP = initialGains.stcg?.profits ?? 0;
    const stL = initialGains.stcg?.losses ?? 0;
    const ltP = initialGains.ltcg?.profits ?? 0;
    const ltL = initialGains.ltcg?.losses ?? 0;

    return {
      stcg: {
        profits: round2(stP),
        losses:  round2(stL),
        net:     round2(stP - stL),
      },
      ltcg: {
        profits: round2(ltP),
        losses:  round2(ltL),
        net:     round2(ltP - ltL),
      },
    };
  }, [initialGains]);

  const preTotal = useMemo(() => {
    if (!pre) return 0;
    return round2(pre.stcg.net + pre.ltcg.net);
  }, [pre]);

  /* ───────────────── SELECTED ARRAY ───────────────── */
  const selectedArray = useMemo(() => Array.from(selected), [selected]);

  /* ───────────────── POST HARVEST ──────────────────────────────────────
     Logic (per spec / ETH example):
       • selected holding stGain > 0  → add to stcg.profits
       • selected holding stGain < 0  → add |stGain| to stcg.losses
       • same for ltGain / ltcg
     We accumulate on raw API floats (not the pre-rounded pre values) and
     only round at the end, avoiding double-rounding artefacts.            */
  const post = useMemo(() => {
    if (!initialGains) return null;

    let stcgP = initialGains.stcg?.profits ?? 0;
    let stcgL = initialGains.stcg?.losses  ?? 0;
    let ltcgP = initialGains.ltcg?.profits ?? 0;
    let ltcgL = initialGains.ltcg?.losses  ?? 0;

    for (const coin of selectedArray) {
      const h = holdingsMap.get(coin);
      if (!h) continue;

      const stGain = h.stcg?.gain ?? 0;
      const ltGain = h.ltcg?.gain ?? 0;

      // SHORT TERM
      if (stGain >= 0) stcgP += stGain;
      else             stcgL += Math.abs(stGain);

      // LONG TERM
      if (ltGain >= 0) ltcgP += ltGain;
      else             ltcgL += Math.abs(ltGain);
    }

    return {
      stcg: {
        profits: round2(stcgP),
        losses:  round2(stcgL),
        net:     round2(stcgP - stcgL),
      },
      ltcg: {
        profits: round2(ltcgP),
        losses:  round2(ltcgL),
        net:     round2(ltcgP - ltcgL),
      },
    };
  }, [selectedArray, holdingsMap, initialGains]);

  const postTotal = useMemo(() => {
    if (!post) return 0;
    return round2(post.stcg.net + post.ltcg.net);
  }, [post]);

  /* ───────────────── SAVINGS ───────────────── */
  const savings = useMemo(
    () => round2(preTotal - postTotal),
    [preTotal, postTotal]
  );

  // Only show the savings banner when something is selected AND there is a
  // genuine saving (post-harvest total is lower than pre-harvest total).
  const showSavings = useMemo(
    () => selected.size > 0 && savings > 0,
    [selected.size, savings]
  );

  /* ───────────────── SELECTION LOGIC ───────────────── */
  const toggle = (coin) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(coin) ? next.delete(coin) : next.add(coin);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === holdings.length
        ? new Set()
        : new Set(holdings.map((h) => h.coin))
    );
  };

  const isSelected    = (coin) => selected.has(coin);
  const isAllSelected = holdings.length > 0 && selected.size === holdings.length;

  return (
    <TaxContext.Provider
      value={{
        holdings,
        loading,
        pre,
        post,
        savings,
        showSavings,
        selected,
        toggle,
        toggleAll,
        isSelected,
        isAllSelected,
      }}
    >
      {children}
    </TaxContext.Provider>
  );
};