import { collection, doc, getDocs, updateDoc,writeBatch } from "firebase/firestore";
import  EmailTemplate  from "../../../demo/components/email-template";
import { Resend } from 'resend';
import { initAdmin } from "../../../firebaseAdmin";
import { getFirestore } from "firebase-admin/firestore";
import { getReportEmails, isDevelopment, isLocalhost, isProduction } from "../../../demo/lib/env";
import { calculateDateDifference } from "../../../demo/lib/date";

export const maxDuration = 10; // This function can run for a maximum of 5 seconds
export const dynamic = 'force-dynamic';


const resend = new Resend(process.env.RESEND_API_KEY);


export async function GET(request: Request) {

  await initAdmin();
 
  const clients:any =await loadLastDayClients()
  const roomsData:any =await loadRoomsUsedYesterday()
  const emails:any =await loadReportEmails()
  const totalPayments:any = clients.reduce((totalPayments:number, client:any) => totalPayments + client.payment, 0);

  let reportEmails=getReportEmails(emails)
  
      try {
        const data = await resend.emails.send({
          from: 'Jasmai Hotels <promo@jasmai.design>',
          to:reportEmails,
          subject: 'Revenue Report',
          react: EmailTemplate({roomsData, totalPayments,numberOfClients:clients.length, whenDay:'Yesterday' }),
        });
    
        console.log("yesss")
      } catch (error) {
        console.log("Nooooooo")
        console.log(error)
      }

      await markClientsAsReported(clients);



     const yesterday = new Date();
     yesterday.setDate(yesterday.getDate() - 1);
  
  if(isProduction()|| isDevelopment()){
    console.log("Weeeeeeeeeeeeeeeeeeee",isDevelopment(),isProduction())
    yesterday.setHours(yesterday.getHours() + 3);
  }

  return new Response(yesterday.getDate().toString())
}



async function markClientsAsReported(clients) {
  const firestore = getFirestore();
 
  const batch = firestore.batch();

  clients.forEach((client) => {
    const clientRef = firestore.doc(`products/${client.id}`);
    batch.update(clientRef, { reported: true });
  });

  try {
    await batch.commit();
    console.log('Batch write successful');
  } catch (error) {
    console.error('Error updating documents:', error);
    // Handle error accordingly
  }
}


export const loadLastDayClients = async () => {
  const firestore = getFirestore();
  const productRef = await firestore.collection( 'products').get();

  const products:any = [];
 
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  if(isProduction()|| isDevelopment()){
    yesterday.setHours(yesterday.getHours() + 3);
  }
  

  const querySnapshot = productRef.docs;
  querySnapshot.forEach((doc) => {
   
    // Assuming check_in is a Firestore Timestamp
    const check_in = doc.data().check_in?.toDate();
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

    if(isProduction()|| isDevelopment()){
      paymentDate.setHours(paymentDate.getHours() + 3);
    }

    return (
      paymentDate.getFullYear() === yesterday.getFullYear() &&
      paymentDate.getMonth() === yesterday.getMonth()       &&
      paymentDate.getDate() === yesterday.getDate()
    );
  }).map(product=>{
    const days=calculateDateDifference(product.check_in,product.check_out);
    return {
      ...product,
        check_in:product.check_in,
        payment:days>0?product.payment*days:product.payment
    }
  })
};

const customSort = (arr) => {
  // Split the array into numeric and non-numeric parts
  const numericValues = [];
  const nonNumericValues = [];
  
  arr.forEach(item => {
    if (/^\d+$/.test(item)) {
      numericValues.push(Number(item));
    } else {
      nonNumericValues.push(item);
    }
  });
  
  // Sort the numeric values
  numericValues.sort((a, b) => a - b);
  
  // Merge both parts back together
  return [...numericValues.map(String), ...nonNumericValues];
};

export const loadRoomsUsedYesterday = async () => {
  const firestore = getFirestore();
  const productRef = await firestore.collection( 'products').get();

  const products:any = [];
 
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  if(isProduction()|| isDevelopment()){
    yesterday.setHours(yesterday.getHours() + 3);
  }
  

  const querySnapshot = productRef.docs;
  querySnapshot.forEach((doc) => {
   
    // Assuming check_in is a Firestore Timestamp
    const check_in = doc.data().check_in?.toDate();
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

  const unsorted_used_rooms= products .filter(payment => {
    const paymentDate = payment.check_out;
    const checkInDate = payment.check_in;

    if(isProduction()|| isDevelopment()){
      paymentDate.setHours(paymentDate.getHours() + 3);
      checkInDate.setHours(checkInDate.getHours() + 3);
      //hello
    }

    return (
      paymentDate.getFullYear() > yesterday.getFullYear() ||
      paymentDate.getFullYear() == yesterday.getFullYear() && paymentDate.getMonth() > yesterday.getMonth() ||
      paymentDate.getFullYear() == yesterday.getFullYear() && paymentDate.getMonth() == yesterday.getMonth() && (paymentDate.getDate() > yesterday.getDate() && checkInDate.getDate()<=yesterday.getDate())
      ||(paymentDate.getDate() == yesterday.getDate() && checkInDate.getDate()==yesterday.getDate())
    );
  }).map(product=>{
    
    return product.room_no; 
    
  })

  const roomRef = await firestore.collection( 'rooms').get();

  const rooms:any = [];
 
  
  

  const querySnapshotRoom = roomRef.docs;
  querySnapshotRoom.forEach((doc) => {
   
   
    rooms.push({
      id: doc.id,
      ...doc.data(),
      
    });
    
  });
   const unsorted_data=rooms.filter(room => !unsorted_used_rooms.includes(room.room_no)).map(room=>room.room_no);
  const not_used_rooms = customSort(unsorted_data)
  const used_rooms=customSort(unsorted_used_rooms)


  return {
    used_room:used_rooms,
    used_room_count:used_rooms.length,
    not_used_room:not_used_rooms,
    not_used_room_count:not_used_rooms.length,
  }
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
