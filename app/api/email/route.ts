import { collection, getDocs } from "firebase/firestore";
import  EmailTemplate  from "../../../demo/components/email-template";
import { Resend } from 'resend';
import { FIRESTORE_DB } from "../../../firebase.config";
import { initAdmin } from "../../../firebaseAdmin";
import { getFirestore } from "firebase-admin/firestore";

export const maxDuration = 10; // This function can run for a maximum of 5 seconds
export const dynamic = 'force-dynamic';


const resend = new Resend(process.env.RESEND_API_KEY);


export async function GET(request: Request) {

  await initAdmin();
 
  const clients:any =await loadLastDayClients()
  const totalPayments:any = clients.reduce((totalPayments:number, client:any) => totalPayments + client.payment, 0);

  
      try {
        const data = await resend.emails.send({
          from: 'Joshmal Hotels <promo@jasmai.design>',
          to: ["abdallahantony55.aa@gmail.com"],
          subject: 'Ahsante Mteja!',
          react: EmailTemplate({ totalPayments,numberOfClients:clients.length }),
        });
    
        console.log("yesss")
      } catch (error) {
        console.log(error)
      }

  
  
 
  return new Response("done")
}


export const loadLastDayClients = async () => {
  const firestore = getFirestore();
  const productRef = await firestore.collection( 'products').get();

  const products:any = [];
 
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const querySnapshot = productRef.docs;
  querySnapshot.forEach((doc) => {
    const productData = doc.data();
    const checkInDate = productData.check_in?.toDate(); // Assuming check_in is a Firestore Timestamp

    // Check if check_in is yesterday
    if (checkInDate && checkInDate.toDateString() === yesterday.toDateString()) {
      products.push({
        id: doc.id,
        ...productData
      });
    }
  });

  return products;
};
