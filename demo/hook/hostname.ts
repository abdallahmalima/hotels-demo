const useHostName = () => {
    let url = 'http://localhost:3000';

     if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if(hostname==='demo.jasmai.design'){
            url = 'https://demo.jasmai.design'
        }
     }

     return {url}
  };
  
  export default useHostName;