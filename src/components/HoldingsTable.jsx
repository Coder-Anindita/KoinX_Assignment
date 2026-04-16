import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Avatar,
  Box,
  Button,
} from "@mui/material";
import { useTax } from "../context/TaxHarvestingContext.jsx";
import "./HoldingsTable.css";

/* ─── formatters ────────────────────────────────────────── */
const fmtCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

const fmtQty = (value, decimals = 6) =>
  Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });

/* ─── Sub-label for a gain cell ─────────────────────────── */
const gainSubLabel = (h, type) => {
  const balance = type === "st" ? h.stcg?.balance : h.ltcg?.balance;
  if (balance !== undefined && balance !== null) {
    return `${fmtQty(balance)} ${h.coin}`;
  }
  return null;
};

/* ─── GainCell ──────────────────────────────────────────── */
const GainCell = ({ value, sub }) => {
  const colorClass = value > 0 ? "gain" : value < 0 ? "loss" : "";
  return (
    <Box>
      <Typography className={`ht-gain-value ${colorClass}`}>
        {fmtCurrency(value)}
      </Typography>
      {sub && (
        <Typography variant="caption" className="ht-gain-sub">
          {sub}
        </Typography>
      )}
    </Box>
  );
};

/* ─── Sort config ───────────────────────────────────────────
   key   : which field drives the sort
   "st"  → h.stcg.gain
   "lt"  → h.ltcg.gain
   null  → no active sort (original API order)

   direction:
   "asc"  → most-negative (biggest loss) first  ← default
   "desc" → most-positive (biggest gain) first
   ---------------------------------------------------------- */
const SORT_KEYS = { ST: "st", LT: "lt" };

const sortHoldings = (holdings, key, dir) => {
  if (!key) return holdings;

  const gainOf = (h) =>
    key === SORT_KEYS.ST ? (h.stcg?.gain ?? 0) : (h.ltcg?.gain ?? 0);

  return [...holdings].sort((a, b) => {
    const diff = gainOf(a) - gainOf(b);
    return dir === "asc" ? diff : -diff;
  });
};

/* ─── SortIcon ──────────────────────────────────────────────
   Shows ↑ / ↓ when the column is active, or a neutral ↕ icon
   when it is not the active sort column.
   ---------------------------------------------------------- */
const SortIcon = ({ active, dir }) => {
  if (!active) {
    return <span className="ht-sort-icon ht-sort-neutral">↕</span>;
  }
  return (
    <span className="ht-sort-icon ht-sort-active">
      {dir === "asc" ? "↑" : "↓"}
    </span>
  );
};

/* ─── constants ─────────────────────────────────────────── */
const INITIAL_ROWS = 6;

/* ═══════════════════════════════════════════════════════ */

const HoldingsTable = () => {
  const { holdings, toggle, toggleAll, isSelected, isAllSelected } = useTax();

  /* ── Sort state ──────────────────────────────────────────
     Default: sort by ST gain ascending (biggest losses first)
     because that is the highest-value harvesting opportunity
     for a user — short-term losses offset short-term gains
     which are taxed at the higher slab rate.               */
  const [sortKey, setSortKey] = useState(SORT_KEYS.ST);
  const [sortDir, setSortDir] = useState("asc");

  /* ── Show-all state ──────────────────────────────────── */
  const [showAll, setShowAll] = useState(false);

  /* ── Click handler for sortable headers ─────────────────
     • First click on an inactive column → activate it, asc
       (losses first — the most actionable view)
     • Second click (same column, asc) → flip to desc
       (gains first)
     • Third click (same column, desc) → clear sort, back
       to original API order                                */
  const handleSortClick = (key) => {
    setSortKey((prevKey) => {
      if (prevKey !== key) {
        setSortDir("asc");
        return key;
      }
      // Same column — cycle: asc → desc → null
      setSortDir((prevDir) => {
        if (prevDir === "asc") return "desc";
        // prevDir === "desc" → clear
        return "asc"; // won't matter, key set to null below
      });
      if (sortDir === "desc") return null; // clear after desc
      return key;
    });
  };

  /* ── Sorted holdings ─────────────────────────────────── */
  const sorted = useMemo(
    () => sortHoldings(holdings, sortKey, sortDir),
    [holdings, sortKey, sortDir]
  );

  /* ── Visible slice ───────────────────────────────────── */
  const visible = useMemo(
    () => (showAll ? sorted : sorted.slice(0, INITIAL_ROWS)),
    [showAll, sorted]
  );

  const hasMore = holdings.length > INITIAL_ROWS;

  return (
    <Card className="ht-card">
      <CardContent className="ht-card-content">

        {/* ── Title ──────────────────────────────────────── */}
        <Box className="ht-title-area">
          <Typography variant="h6" className="ht-title">
            Holdings
          </Typography>
        </Box>

        {/* ── Table ──────────────────────────────────────── */}
        <Box className="ht-table-wrap">
          <Table className="ht-table">

            {/* ── Header ─────────────────────────────────── */}
            <TableHead>
              <TableRow>

                <TableCell padding="checkbox" className="ht-header-cell">
                  <Checkbox
                    checked={isAllSelected}
                    onChange={toggleAll}
                    size="small"
                    className="ht-checkbox"
                  />
                </TableCell>

                <TableCell className="ht-header-cell">Asset</TableCell>

                <TableCell className="ht-header-cell">
                  Holdings
                  <span className="ht-header-sub">Avg Buy Price</span>
                </TableCell>

                <TableCell className="ht-header-cell">Current Price</TableCell>

                {/* ── Sortable: Short-term ─────────────────── */}
                <TableCell
                  className="ht-header-cell ht-header-sortable"
                  onClick={() => handleSortClick(SORT_KEYS.ST)}
                >
                  <Box className="ht-sort-header">
                    Short-term
                    <SortIcon
                      active={sortKey === SORT_KEYS.ST}
                      dir={sortDir}
                    />
                  </Box>
                </TableCell>

                {/* ── Sortable: Long-term ──────────────────── */}
                <TableCell
                  className="ht-header-cell ht-header-sortable"
                  onClick={() => handleSortClick(SORT_KEYS.LT)}
                >
                  <Box className="ht-sort-header">
                    Long-Term
                    <SortIcon
                      active={sortKey === SORT_KEYS.LT}
                      dir={sortDir}
                    />
                  </Box>
                </TableCell>

                <TableCell className="ht-header-cell">Amount to Sell</TableCell>

              </TableRow>
            </TableHead>

            {/* ── Body ───────────────────────────────────── */}
            <TableBody>
              {visible.map((h) => {
                const selected = isSelected(h.coin);
                const stSub = gainSubLabel(h, "st");
                const ltSub = gainSubLabel(h, "lt");
                const rowClass = `ht-body-row ${selected ? "ht-row-selected" : ""}`;

                return (
                  <TableRow
                    key={`${h.coin}-${h.coinName}`}
                    className={rowClass}
                    onClick={() => toggle(h.coin)}
                  >

                    <TableCell padding="checkbox" className="ht-body-cell">
                      <Checkbox
                        checked={selected}
                        size="small"
                        className="ht-checkbox"
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggle(h.coin)}
                      />
                    </TableCell>

                    <TableCell className="ht-body-cell">
                      <Box className="ht-asset-wrap">
                        <Avatar src={h.logo} className="ht-avatar" />
                        <Box>
                          <Typography className="ht-asset-name">
                            {h.coin}
                          </Typography>
                          <Typography className="ht-asset-sub">
                            {h.coinName}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell className="ht-body-cell">
                      <Typography className="ht-holding-amount">
                        {fmtQty(h.totalHolding)} {h.coin}
                      </Typography>
                      <Typography className="ht-holding-rate">
                        {fmtCurrency(h.averageBuyPrice)}/{h.coin}
                      </Typography>
                    </TableCell>

                    <TableCell className="ht-body-cell">
                      <Typography className="ht-total-value">
                        {fmtCurrency(h.currentPrice)}
                      </Typography>
                    </TableCell>

                    <TableCell className="ht-body-cell">
                      <GainCell value={h.stcg?.gain ?? 0} sub={stSub} />
                    </TableCell>

                    <TableCell className="ht-body-cell">
                      <GainCell value={h.ltcg?.gain ?? 0} sub={ltSub} />
                    </TableCell>

                    <TableCell className="ht-body-cell">
                      {selected ? (
                        <Typography className="ht-sell-amount">
                          {fmtQty(h.totalHolding)} {h.coin}
                        </Typography>
                      ) : (
                        <Typography className="ht-sell-dash">-</Typography>
                      )}
                    </TableCell>

                  </TableRow>
                );
              })}
            </TableBody>

          </Table>
        </Box>

        {/* ── View all / Show less ────────────────────────── */}
        {hasMore && (
          <Box className="ht-footer">
            <Button
              className="ht-view-all-btn"
              disableRipple
              onClick={(e) => {
                e.stopPropagation();
                setShowAll((prev) => !prev);
              }}
            >
              {showAll
                ? "Show less"
                : `View all (${holdings.length - INITIAL_ROWS} more)`}
            </Button>
          </Box>
        )}

      </CardContent>
    </Card>
  );
};

export default HoldingsTable;