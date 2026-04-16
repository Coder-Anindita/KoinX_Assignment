import { HOLDINGS_DATA } from "../data";
import { CAPITAL_GAINS_DATA } from "../data";
export const fetchHoldings = async () => {
  try {
    return HOLDINGS_DATA;
  } catch (error) {
    console.error("fetchHoldings error:", error);
    throw error;
  }
};

export const fetchCapitalGains = async () => {
  try {
    return CAPITAL_GAINS_DATA

  } catch (error) {
    console.error("fetchCapitalGains error:", error);
    throw error;
  }
};