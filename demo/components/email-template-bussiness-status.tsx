import React from 'react';
import { formatNumberWithCommas } from '../lib/currency';

interface EmailTemplateProps {
  totalPayments: number;
  numberOfClients: number;
}

const EmailTemplateBussinessStatus = ({
  salesDifference,
  positivePercentageChange,
  status,
  totalLastWeekSales,
  totalThisWeekSales,
}) => {

 
const emailContent = status === 'Rise' ? (
  <div>
    <p style={reportStyle}>
      ✅ Big news: Your business just skyrocketed by <span style={figureStyle}>{positivePercentageChange}% this week</span>, hitting a total of <span style={figureStyle}>{formatNumberWithCommas(Math.abs(salesDifference))}{"/="} Rise</span>. 📈 High fives all around!
    </p>
    <p style={reportStyle}>
      Your savvy moves and killer strategies are doing wonders. Keep riding that wave, and let's turn this success into an unstoppable momentum! 🚀
    </p>
    <p style={reportStyle}>
      Cheers 👍 to your triumph!
    </p>
  </div>
) : (
  <div>
    <p style={reportStyle}>
      ❌ Sad news: Your business just decline by <span style={figureStyle}>{positivePercentageChange}% this week</span>, dropping to a total of <span style={figureStyle}>{formatNumberWithCommas(Math.abs(salesDifference))}{"/="} decline</span>. 📉 and I encourage you to stay resilient.
    </p>
    <p style={reportStyle}>
      We believe in your resilience. Analyze the situation, adjust your strategies, and let's bounce back stronger!
    </p>
    <p style={reportStyle}>
      Keep pushing 👊💪
    </p>
  </div>
);

    
  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Jasmai Hotels Business Status</h1>
      <p style={reportStyle}>
      Hey Boss,
      </p>
       {emailContent}
      <a style={buttonStyle} href="https://joshmal.jasmai.design/pages/products">
        More Info
      </a>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  fontFamily: 'Arial, sans-serif',
  textAlign: 'center',
  padding: '20px',
  backgroundColor: '#f4f4f4',
  borderRadius: '8px',
  maxWidth: '600px',
  margin: 'auto',
};

const titleStyle: React.CSSProperties = {
  color: '#34a853',
  fontSize: '24px',
  margin: '10px 0',
};

const reportStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1a73e8',
  margin: '10px 0',
};

const figureStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#FF5252',
  margin: '10px 0',
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#34a853',
  color: '#ffffff',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '16px',
  textDecoration: 'none',
  display: 'inline-block',
  margin: '10px 0',
};

export default  EmailTemplateBussinessStatus;
