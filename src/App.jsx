import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TaxProvider } from "./context/TaxHarvestingContext.jsx";
import './App.css'
import TaxHarvesting from "./pages/TaxHarvesting.jsx";

function App() {
  return (
    <TaxProvider>
      <BrowserRouter>
        <div className="app">
          <Routes>
            <Route path="/" element={<TaxHarvesting />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TaxProvider>
  );
}

export default App;
