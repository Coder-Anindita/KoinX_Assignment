import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import "./CapitalGainsCard.css";
import { useTax } from "../context/TaxHarvestingContext";

/* ─── formatter ────────────────────────────────────────────
   Using INR (₹) to match the spec examples.
   maximumFractionDigits:2 so ₹0.50 is never rounded to ₹0,
   and values like ₹1,234.56 are preserved exactly.
   --------------------------------------------------------- */
const format = (num) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(num ?? 0);

/* safe zero-fallback */
const val = (v) => v ?? 0;

/* ═══════════════════════════════════════════════════════ */

const CapitalGainsCard = ({ type }) => {
  const { pre, post, savings, showSavings } = useTax();

  const isAfter = type === "after";
  const data    = isAfter ? post : pre;

  const total = val(data?.stcg?.net) + val(data?.ltcg?.net);

  return (
    <Card className={`gains-card ${isAfter ? "after-card" : "pre-card"}`}>
      <CardContent className="gains-content">

        {/* Title */}
        <Typography className="gains-title">
          {isAfter ? "After Harvesting" : "Pre Harvesting"}
        </Typography>

        {/* Column headers */}
        <Box className="gains-header-row">
          <Typography className="gains-label" />
          <Typography className="gains-col-header">Short-term</Typography>
          <Typography className="gains-col-header">Long-term</Typography>
        </Box>

        {/* Profits */}
        <Box className="gains-row">
          <Typography className="gains-label">Profits</Typography>
          <Typography className="gains-value">
            {format(val(data?.stcg?.profits))}
          </Typography>
          <Typography className="gains-value">
            {format(val(data?.ltcg?.profits))}
          </Typography>
        </Box>

        {/* Losses ─ stored as a positive magnitude in context;
            displayed with a leading minus so the UI reads "-₹500"
            and the "loss" CSS class colours it red.                */}
        <Box className="gains-row">
          <Typography className="gains-label">Losses</Typography>
          <Typography className="gains-value loss">
            -{format(val(data?.stcg?.losses))}
          </Typography>
          <Typography className="gains-value loss">
            -{format(val(data?.ltcg?.losses))}
          </Typography>
        </Box>

        {/* Net Capital Gains ─ net can legitimately be negative;
            apply a conditional colour class so negatives go red.   */}
        <Box className="gains-row">
          <Typography className="gains-label">Net Capital Gains</Typography>
          <Typography
            className={`gains-value gains-bold ${
              val(data?.stcg?.net) < 0 ? "loss" : ""
            }`}
          >
            {format(val(data?.stcg?.net))}
          </Typography>
          <Typography
            className={`gains-value gains-bold ${
              val(data?.ltcg?.net) < 0 ? "loss" : ""
            }`}
          >
            {format(val(data?.ltcg?.net))}
          </Typography>
        </Box>

        <div className="gains-divider" />

        {/* Total */}
        <Box className="gains-total-row">
          <Typography className="gains-total-label">
            {isAfter ? "Effective Capital Gains:" : "Realised Capital Gains:"}
          </Typography>
          <Typography
            className={`gains-total-value ${total < 0 ? "loss" : ""}`}
          >
            {format(total)}
          </Typography>
        </Box>

        {/* Savings banner ─ only on "after" card when there's a genuine saving */}
        {isAfter && showSavings && (
          <Box className="savings-banner">
            <Typography className="savings-text">
              🎉 You're going to save {format(savings)}
            </Typography>
          </Box>
        )}

      </CardContent>
    </Card>
  );
};

export default CapitalGainsCard;