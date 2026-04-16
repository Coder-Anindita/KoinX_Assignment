import React from "react";
import "./TaxHarvesting.css"
import {
  Container,
  Box,
  Typography,
  Grid,
  CircularProgress,
  Tooltip
} from "@mui/material";
import InfoBox from "../components/InfoBox.jsx";
import Header from "../components/Header.jsx";
import CapitalGainsCard from "../components/CapitalGainsCard.jsx";
import HoldingsTable from "../components/HoldingsTable.jsx";
import { useTax } from "../context/TaxHarvestingContext.jsx";

const TaxHarvesting = () => {
  const {
    loading,
    pre,
    post,
    savings,
    showSavings,
  } = useTax();

  // 🔹 Loading State
  

  return (
 <div className="outer">
    <div className="row m-0"><Header/></div>

    <div className="main">
      <div className="text-left mb-0">
        <h1 className="Heading">Tax Optimisation </h1>
        <Tooltip
          title="Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit."
          arrow
          componentsProps={{
            tooltip: {
              sx: {
                backgroundColor: "white !important",
                color: "black !important",
                boxShadow: "0px 2px 8px rgba(0,0,0,0.15)",
                fontSize: "0.85rem",
                border: "1px solid #e0e0e0",
              },
            },
            arrow: {
              sx: {
                color: "white !important",
                "&::before": {
                  backgroundColor: "white !important",
                  border: "1px solid #e0e0e0",
                },
              },
            },
          }}
        >
          <span className="HowItWorks">How it works?</span>
        </Tooltip>
      </div>

      {/* Info Box */}
      <div className="row m-0 mb-0">
        <div className="col-12 p-0">
          <InfoBox />
        </div>
      </div>

      {/* Cards */}
      <div className="row m-0 mb-3 g-3">
        <div className="col-lg-6 col-12">
          <CapitalGainsCard type="pre" />
        </div>
        <div className="col-lg-6 col-12">
          <CapitalGainsCard type="after" />
        </div>
      </div>

      {/* Table */}
      <div className="row m-0">
        <div className="col-12 p-0">
          <HoldingsTable />
        </div>
      </div>
    </div>
  </div>
  );
};

export default TaxHarvesting;