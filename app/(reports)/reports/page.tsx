"use client"
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { PDFViewer } from '@react-pdf/renderer';
import MyDocument from '../../../demo/components/MyDocument';
import Image from 'next/image';
import { useClients, useClientsForReports } from '../../../demo/hook/DataFetcher';
import { calculateDateDifference, convertDateFormat } from '../../../demo/lib/date';
import { useSearchParams } from 'next/navigation';
import { ProgressSpinner } from 'primereact/progressspinner';
import { capitalizeFirstLetter } from '../../../demo/lib/strings';
import { formatNumberWithCommas } from '../../../demo/lib/currency';

const ReportPage = () => {
 
   const searchParams=useSearchParams()
   
   function isValidDate(dateString) {
    const regexDate = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])\/\d{4}$/;
  
    if (!regexDate.test(dateString)) {
      return false;
    }
  
    const parts = dateString.split('/');
    const month = parseInt(parts[0], 10) - 1; // Months are 0-based in JavaScript Date object
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
  
    const testDate = new Date(year, month, day);
  
    return (
      testDate.getDate() === day &&
      testDate.getMonth() === month &&
      testDate.getFullYear() === year
    );
  }
  
  
   const isCurrentUser=searchParams.get('user')
   const startDate=convertDateFormat(searchParams.get('start_date'))
   const endDate=convertDateFormat(searchParams.get('end_date'))
   let start_date=''
   let end_date=''

   if(startDate  && isValidDate(startDate)){
    start_date=startDate
   }

   if(endDate && isValidDate(endDate)){
    end_date=endDate
   }

   const [isLoading, setIsLoading, products, setProducts, loadProducts] = useClientsForReports(start_date,end_date,isCurrentUser)
    
   console.log(start_date,end_date)
 



 

   const startDateSW=new Date(start_date).toLocaleDateString('sw-TZ')
   const endDateSW=new Date(end_date).toLocaleDateString('sw-TZ')


  

  const hotelName = "Jasmai Hotel";
  const reportStartDate = startDateSW;
  const reportEndDate = endDateSW;

  const clientsData = products.map(product =>{
     const days=calculateDateDifference(product.check_in,product.check_out);
    return{
    name: capitalizeFirstLetter(product.f_name) + " " + capitalizeFirstLetter(product.l_name),
    room_no: product.room_no,
    checkIn: new Date(product.check_in).toLocaleDateString('sw-TZ'),
    checkOut: new Date(product.check_out).toLocaleDateString('sw-TZ'),
    days: days, // You may want to calculate the actual days difference
    payment: product.payment,
    total: days>0?product.payment*days:product.payment,
    // ... other properties
  }});

  

  useEffect(()=>{
    if(!isLoading && clientsData.length>0){
      window.print();
    }
  },[clientsData.length])
    
  
  

  const totalBookings = clientsData.length;
  const totalRevenue = clientsData.reduce((total, client) => total + client.total, 0);
 
   let reportTitle="Report"
   if(isValidDate(startDate)){
    reportTitle+= ` from ${reportStartDate}`
   }
   if(isValidDate(endDate)){
    reportTitle+= ` to ${reportEndDate}`
   }

   if(isLoading){
    return (
    <div style={styles.container}>
       <div style={styles.titleSubtitleContainer}>
         <h1 style={styles.title}>Loading Report...</h1>
         <ProgressSpinner />
       </div>
    </div>
    )
  }

   if(!isLoading && clientsData.length==0){
     return (
     <div style={styles.container}>
        <div style={styles.titleSubtitleContainer}>
          <h1 style={styles.title}>No Report Found</h1>
        </div>
     </div>
     )
   }

  return (
    <div style={styles.container}>
      
      <div style={styles.titleContainer}>
        <div style={styles.logoContainer}>
          <Image
            src="/logo/joshmal_logo.png"
            width={50}
            height={50}
            alt="Jasmai Logo"
          />
        </div>
        <div style={styles.titleSubtitleContainer}>
          <h1 style={styles.title}>{hotelName}</h1>
          <h2 style={styles.subtitle}>{reportTitle}</h2>
        </div>
      </div>
      <div style={styles.summary}>
        <p>Total Revenue: {formatNumberWithCommas(totalRevenue)}{"/="}</p>
        <p>Total Number of Clients: {totalBookings}</p>
      </div>
      <div style={styles.clientList}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Name</th>
              <th style={styles.tableHeader}>Room No.</th>
              <th style={styles.tableHeader}>Check-in</th>
              <th style={styles.tableHeader}>Check-out</th>
              <th style={styles.tableHeader}>Days</th>
              <th style={styles.tableHeader}>Payment</th>
              <th style={styles.tableHeader}>Total</th>
            </tr>
          </thead>
          <tbody>
            {clientsData.map((client, index) => (
              <tr key={index}>
                <td>{client.name}</td>
                <td>{client.room_no}</td>
                <td>{client.checkIn}</td>
                <td>{client.checkOut}</td>
                <td>{client.days || 1}</td>
                <td>{formatNumberWithCommas(client.payment)}</td>
                <td>{formatNumberWithCommas(client.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    maxWidth: '800px',
    margin: 'auto',
  },
  titleContainer: {
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
  },
  logoContainer: {
    marginRight: '20px',
  },
  titleSubtitleContainer: {
    flex: 1,
    textAlign: 'center',  // Center the titles
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0',
  },
  subtitle: {
    fontSize: '18px',
    margin: '0',
  },
  clientList: {
    marginBottom: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    fontWeight: 'bold',
    textAlign: 'left',
  },
  summary: {
    textAlign: 'right',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
};

export default ReportPage;