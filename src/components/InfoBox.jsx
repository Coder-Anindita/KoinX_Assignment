import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box } from '@mui/material';

const InfoBox = () => {
  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Accordion
        sx={{
          backgroundColor: "#0d1f3c",
          border: "1.5px solid #1a3a6b",
          borderRadius: "8px !important",
          boxShadow: "none",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
          aria-controls="disclaimer-content"
          id="disclaimer-header"
          sx={{
            color: "white",
            "& .MuiAccordionSummary-content": {
              alignItems: "center",
              gap: 0,
            },
          }}
        >
          {/* i icon circle */}
          <Box
            sx={{
              width: 30,
              height: 22,
              
              
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 20, color: "#4A78FF" }} />
          </Box>

          <Typography sx={{ fontSize: "0.95rem", fontWeight: 500 }}>
            Important Notes And Disclaimers
          </Typography>
        </AccordionSummary>

        <AccordionDetails
          sx={{
            color: "white",
            fontSize: "0.9rem",
            
            
          }}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default InfoBox;