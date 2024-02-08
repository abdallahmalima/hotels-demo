import React from 'react';
import { isDevelopment, isProduction } from '../lib/env';

interface EmailTemplateProps {
  totalPayments: number;
  numberOfClients: number;
}

const EmailTemplate: React.FC<EmailTemplateProps> = ({roomsData, totalPayments, numberOfClients,whenDay }) => {
  const formattedTotalPayments = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'TZS',
  }).format(totalPayments);

  const {
    used_room,
    used_room_count,
    not_used_room,
    not_used_room_count,
  }=roomsData

  function getLastWeekMondayAndSunday() {
    const today = new Date();
    if(isProduction()|| isDevelopment()){
      today.setHours(today.getHours() + 3);
    }
  
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
  
    // Calculate the difference between the current day and Monday
    const daysSinceMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
  
    // Calculate last week's Monday by subtracting the difference plus 7 days from the current date
    const lastWeekMonday = new Date(today);
    lastWeekMonday.setDate(today.getDate() - daysSinceMonday - 7);
  
    // Calculate last week's Sunday by subtracting one day from last week's Monday
    const lastWeekSunday = new Date(lastWeekMonday);
    lastWeekSunday.setDate(lastWeekMonday.getDate() + 6);
  
    return { lastWeekMonday, lastWeekSunday };
  }
  

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  if(isProduction()|| isDevelopment()){
    yesterday.setHours(yesterday.getHours() + 3);
  }
  const { lastWeekMonday, lastWeekSunday } = getLastWeekMondayAndSunday();
const yesterdayFormatedDate=yesterday.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
const lastWeekMondayAndSunday=lastWeekMonday.toLocaleDateString('sw-TZ',options)+"-"+lastWeekSunday.toLocaleDateString('sw-TZ',options)
  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Jasmai Hotels {whenDay}({whenDay=='Yesterday'?yesterdayFormatedDate:lastWeekMondayAndSunday}) Report</h1>
      <p style={reportStyle}>Room Revenue Report:</p>
      <p style={figureStyle}>Revenue:{"  "}<span style={{color: '#FF5252',}}>{`${formattedTotalPayments}/=`}</span></p>
      <p style={figureStyle}>Clients:{"  "}<span style={{color: '#FF5252',}}>{`${numberOfClients}`}</span></p>
      {whenDay=='Yesterday' && (<><hr style={{ marginTop: '20px', marginBottom: '20px' }} />
      <p style={reportStyle}>Room Reconciliation Report:</p>
      <p style={figureStyle}>Room Used:{"  "}<span style={{color: '#FF5252',}}>{`${used_room_count} `}Rooms</span></p>
      <p style={figureStyle}>Room Not Used:{"  "}<span style={{color: '#FF5252',}}>{`${not_used_room_count} `}Rooms</span></p>
      <hr style={{ marginTop: '20px', marginBottom: '20px' }} />
      <p style={figureStyle}>List of Room Used:{"  "}<span style={{color: '#FF5252',}}>{`${used_room} `}</span></p>
      <p style={figureStyle}>List of Room Not Used:{"  "}<span style={{color: '#FF5252',}}>{`${not_used_room} `}</span></p>
      </>)}
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
  color: '#4285f4',
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
  color: '#1a73e8',
  margin: '10px 0',
  textAlign: 'left',
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

export default EmailTemplate;
