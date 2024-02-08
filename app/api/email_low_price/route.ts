import { collection, getDocs } from "firebase/firestore";
import  EmailTemplate  from "../../../demo/components/email-template";
import { Resend } from 'resend';
import { FIRESTORE_DB } from "../../../firebase.config";
import { initAdmin } from "../../../firebaseAdmin";
import { getFirestore } from "firebase-admin/firestore";
import EmailTemplateBussinessStatus from "../../../demo/components/email-template-bussiness-status";
import { calculateSalesDifference, getTotalSalesLastWeekDataset, getTotalSalesLastWeekDatasetApi, getTotalSalesThisWeekDataset, getTotalSalesThisWeekDatasetApi } from "../../../demo/lib/calc";
import { useClients } from "../../../demo/hook/DataFetcher";
import { getReportEmails } from "../../../demo/lib/env";
import { NextResponse } from "next/server";
import EmailTemplateLowPrice from "../../../demo/components/email-template-low-price";

export const maxDuration = 10; // This function can run for a maximum of 5 seconds
export const dynamic = 'force-dynamic';


const resend = new Resend(process.env.RESEND_API_KEY);


export async function POST(request: Request) {
  const {payment,payment_less,room_no,user,user_phone} = await request.json();

console.log(payment,payment_less,room_no,user,user_phone)
  await initAdmin();

 
  const emails:any =await loadReportEmails()

   let reportEmails=getReportEmails(emails)

      try {
        const data = await resend.emails.send({
          from: 'Jasmai Hotels <promo@jasmai.design>',
          to: reportEmails,
          subject: 'Danger: The room was sold at a lower price 🚀🎉💼',
          react: EmailTemplateLowPrice({payment,payment_less,room_no,user,user_phone}),
        });
        console.log("yesss")
      } catch (error) {
        console.log(error)
      }
  
  

  
  
 
  return new Response("done")
}





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
}


