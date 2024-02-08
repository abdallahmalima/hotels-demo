import { collection, getDocs } from "firebase/firestore";
import  EmailTemplate  from "../../../demo/components/email-template";
import { Resend } from 'resend';
import { FIRESTORE_DB } from "../../../firebase.config";
import { initAdmin } from "../../../firebaseAdmin";
import { getFirestore } from "firebase-admin/firestore";
import { calculateDateDifference } from "../../../demo/lib/date";
import { getReportEmails, isDevelopment, isProduction } from "../../../demo/lib/env";

export const maxDuration = 10; // This function can run for a maximum of 5 seconds
export const dynamic = 'force-dynamic';


const resend = new Resend(process.env.RESEND_API_KEY);


export async function GET(request: Request) {

  const today = new Date();
  if(isProduction()|| isDevelopment()){
    today.setHours(today.getHours() + 3);
  }
// Check if today is Monday (1 corresponds to Monday)
// if (today.getDay() !== 1) {
//   return new Response("Today is Not Monday!")
// }

  await initAdmin();
 
  const clients:any =await loadLastWeekClients()
  const emails:any =await loadReportEmails()
  const totalPayments:any = clients.reduce((totalPayments:number, client:any) => totalPayments + client.payment, 0);

   const roomsData={
    used_room:null,
    used_room_count:null,
    not_used_room:null,
    not_used_room_count:null,
  }

  let reportEmails=getReportEmails(emails)
      try {
        const data = await resend.emails.send({
          from: 'Jasmai Hotels <promo@jasmai.design>',
          to: reportEmails,
          subject: 'Sales Report',
          react: EmailTemplate({roomsData, 
            totalPayments,
            numberOfClients:clients.length,
            whenDay:'Last Week' }),
        });
    
        console.log("yesss")
      } catch (error) {
        console.log(error)
      }

  
  
 
  return new Response(JSON.stringify(clients))
}


export const loadLastWeekClients = async () => {
  const { lastWeekMonday, lastWeekSunday } = getLastWeekMondayAndSunday();
  
  if(isProduction()|| isDevelopment()){
    lastWeekMonday.setDate(lastWeekMonday.getDate() - 1);
    lastWeekSunday.setDate(lastWeekSunday.getDate() - 1);
  }
  const firestore = getFirestore();
  const productRef = await firestore.collection('products').orderBy("check_in")
   .where('check_in', '>=', lastWeekMonday)
  .where('check_in', '<=', lastWeekSunday)
  .get();

  const products: any = [];

  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7); // Change to -6 if you want the last 6 days

  const querySnapshot = productRef.docs;
  querySnapshot.forEach((doc) => {
         const check_in = doc.data().check_in?.toDate();
        console.log("My Checkin-"+check_in,"name-"+doc.data().f_name)
          const check_out = doc.data().check_out?.toDate();
          const createdAt = doc.data().createdAt?.toDate();
          products.push({
            id: doc.id,
            ...doc.data(),
            check_in,
            check_out,
            createdAt,
          });
  });

  return products .filter(payment => {
    const paymentDate = payment.check_in;
    console.log(paymentDate)
    if(isProduction() || isDevelopment()){
      paymentDate.setHours(paymentDate.getHours() + 3);
    }

    

    const paymentYear = paymentDate.getFullYear();
    const paymentMonth = paymentDate.getMonth();
    const paymentDay = paymentDate.getDate();

    const lastWeekMondayYear = lastWeekMonday.getFullYear();
    const lastWeekMondayMonth = lastWeekMonday.getMonth();
    const lastWeekMondayDay = lastWeekMonday.getDate();

    const lastWeekSundayYear = lastWeekSunday.getFullYear();
    const lastWeekSundayMonth = lastWeekSunday.getMonth();
    const lastWeekSundayDay = lastWeekSunday.getDate();

    return (
     // (paymentYear === lastWeekMondayYear && paymentMonth === lastWeekMondayMonth) && (paymentDay >= lastWeekMondayDay && paymentDay <= lastWeekSundayDay) ||
      true
     
    );
  }).map(product=>{
      const days=calculateDateDifference(product.check_in,product.check_out);
      return {
          name:"---"+product.f_name+" "+product.l_name,
          check_in:"---"+product.check_in,
          payment:days>0?product.payment*days:product.payment
      }
    })
};


export const loadReportEmails = async () => {
  const firestore = getFirestore();
  const productRef = await firestore.collection( 'report_emails').get();

  const products:any = [];
 
  
  const querySnapshot = productRef.docs;
  querySnapshot.forEach((doc) => {
    const productData = doc.data();
   
      products.push({
        id: doc.id,
        ...productData
      });
    
  });

  return products.map((product:any)=>product.email);
};

function getLastWeekMondayAndSunday() {
  const today = new Date();
  today.setHours(0,0,0,0)
  console.log("todayXXXX"+today,"-")
  if(isProduction()|| isDevelopment()){
    today.setHours(today.getHours() + 3);
  }

  const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, etc.

  // Calculate the difference between the current day and Monday
  const daysSinceMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
  console.log("daysSinceMonday",daysSinceMonday)

  // Calculate last week's Monday by subtracting the difference plus 7 days from the current date
  const lastWeekMonday = new Date(today);
  console.log("lastWeekMondayXXXX"+today,"-")
  

  lastWeekMonday.setDate(today.getDate() - daysSinceMonday - 7);
  console.log("lastWeekMondayXXXX"+lastWeekMonday,"-")
  
  // Calculate last week's Sunday by subtracting one day from last week's Monday
  const lastWeekSunday = new Date(lastWeekMonday); 

  lastWeekSunday.setDate(lastWeekMonday.getDate() + 6);

  lastWeekSunday.setHours(23, 59, 59, 999);
  console.log("lastWeekSundayXXXX"+lastWeekSunday,"-")

  return { lastWeekMonday, lastWeekSunday };
}