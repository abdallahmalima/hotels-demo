"use server"

export const sendClientSms= async (formData:any)=>{
    const phone = formData.get('phone');
    const clientName =formData.get('name');



    const api_key = process.env.NEXT_SMS_API_KEY;
    const secret_key = process.env.NEXT_SMS_API_SECRET;
    const content_type = "application/json";
    const source_addr = "INFO";
    
    // Function to encode credentials using Buffer in Node.js
    const encodeCredentials = () => {
      const credentials = `${api_key}:${secret_key}`;
      return Buffer.from(credentials).toString("base64");
    };
    
     
      try {
        const response = await fetch("https://apisms.beem.africa/v1/send", {
          method: "POST",
          headers: {
            "Content-Type": content_type,
            Authorization: "Basic " + encodeCredentials(),
          },
         
          body: JSON.stringify({
            source_addr: source_addr,
            schedule_time: "",
            encoding: 0,
            message: "Ndugu Mteja, Jasmai Hotel tunashukuru kwa maoni yako!",
            recipients: [
              {
                recipient_id: 1,
                dest_addr: phone,
              },
            //   {
            //     recipient_id: 2,
            //     dest_addr: "255700000002",
            //   },
            ],
          }),
        });
    
        const data = await response.json();
    
        console.log(data, api_key + ":" + secret_key);
      } catch (error) {
        console.error(error);
      }
  
   
    
}