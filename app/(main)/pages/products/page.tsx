'use client'

/* eslint-disable @next/next/no-img-element */

import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { RadioButton, RadioButtonChangeEvent } from 'primereact/radiobutton';
import { Rating } from 'primereact/rating';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { Demo } from '../../../../types/types';
import { addDoc, collection, doc, updateDoc, onSnapshot, deleteDoc, where, query, serverTimestamp } from "firebase/firestore";
import { FIRESTORE_DB, FIREBASE_AUTH } from "../../../../firebase.config";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { uuid as uuidv4 } from 'uuidv4';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Skeleton } from 'primereact/skeleton';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useClientRooms, useClients ,useRooms, useUser } from '../../../../demo/hook/DataFetcher';
import { Badge } from 'primereact/badge';
import { Calendar } from 'primereact/calendar';
import LoadingSpinner from '../../../../demo/components/LoadingSpinner';
import { ScrollTop } from 'primereact/scrolltop';
import { UserAuth } from '../../../../demo/components/context/AuthContext';
import ReactPDF, { PDFDownloadLink } from '@react-pdf/renderer';
import MyDocument from '../../../../demo/components/MyDocument';
import { useRouter } from 'next/navigation';
import { getCheckInDateRange } from '../../../../demo/lib/date';
import { setConstantValue } from 'typescript';
import { capitalizeFirstLetter } from '../../../../demo/lib/strings';
import { Checkbox } from 'primereact/checkbox';
import { AutoComplete } from 'primereact/autocomplete';
import { formatNumberWithCommas } from '../../../../demo/lib/currency';





const Product = () => {
    let emptyProduct: Demo.Product = {
        id: '',
        name: '',
        image: '',
        description: '',
        category: '',
        price: 0,
        quantity: 0,
        rating: 0,
        inventoryStatus: 'INSTOCK'
    };
    const [productImage, setProductImage] = useState<File | null>(null);
    // const [products, setProducts] = useState<Demo.Product[]>([]);
    const [productDialog, setProductDialog] = useState(false);
    const [deleteProductDialog, setDeleteProductDialog] = useState(false);
    const [deleteProductsDialog, setDeleteProductsDialog] = useState(false);
    const [roomMinPrice, setRoomMinPrice] = useState(0);
    const [lowPriceProductsDialog, setLowPriceDeleteProductsDialog] = useState(false);
    const [addDateToUserProductsDialog, setAddDateToUserProductsDialog] = useState(false);
    const [product, setProduct] = useState<Demo.Product>(emptyProduct);
    const [selectedProducts, setSelectedProducts] = useState<Demo.Product[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<Demo.Product[]>>(null);
    const fileUploadRef = useRef<FileUpload>(null);
    const [currentUser, setCurrentUser] = useState(undefined);
    const [selectedRoom, setSelectedRoom] = useState(false);
    const [filteredCountries, setFilteredCountries] = useState(null);

    const [usageInputFields, setUsageInputFields] = useState<any>([])
    const [diseaseInputFields, setDiseaseInputFields] = useState<any>([])
    // const [isLoading,setIsLoading]=useState(false)
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false)

    const [isLoading, setIsLoading, products, setProducts, loadProducts] = useClients()
    const clientRooms = useClientRooms()
    const clientRoomsArr=clientRooms[2]
    console.log(clientRoomsArr)
    const filterdclientRoomsArr=clientRoomsArr.map(item=>item.room_no)
    console.log(filterdclientRoomsArr)
    const [
        isLoadingUser,
        setIsLoadingUser,
        user,
        setUser,
      ]=useUser(FIREBASE_AUTH.currentUser?.uid)
      console.log("",user)

    const [isLoadingRoom, setIsLoadingRoom, rooms, setRooms] = useRooms()

   const router=useRouter()


   const [startDate, setStartDate] = useState('');
   const [endDate, setEndDate] = useState('');
   const [calenderChangedByUser, setCalenderChangedByUser] = useState(false);
   const { lowestCheckIn, highestCheckIn } = getCheckInDateRange(products);

   const search = (event) => {
    // Timeout to emulate a network connection
    setTimeout(() => {
        let _filteredCountries;

        if (!event.query.trim().length) {
            _filteredCountries = [...filterdclientRoomsArr];
        }
        else {
            _filteredCountries = filterdclientRoomsArr.filter((country) => {
                return country.startsWith(event.query);
            });
        }

        setFilteredCountries(_filteredCountries);
    }, 25);
}

useEffect(()=>{
    if(selectedRoom){
            console.log("room")
            let _productt = { ...product };
            _productt[`room_type`] = selectedRoom.room_type;
            _productt[`payment`] = selectedRoom.payment;
            setProduct(_productt);
        }else{
            let _productt = { ...product };
            _productt[`room_type`] = undefined;
            _productt[`payment`] = undefined;
            setProduct(_productt);
        }
        console.log("helloooooooooooooooooo",selectedRoom)
},[selectedRoom])
 
   
   useEffect(()=>{

    if(lowestCheckIn && highestCheckIn && !calenderChangedByUser){
        setStartDate(lowestCheckIn?.toLocaleDateString("en-US"))
        setEndDate(highestCheckIn?.toLocaleDateString("en-US"))
    }

   },[lowestCheckIn, highestCheckIn])

   useEffect(()=>{
   
    if(!startDate){
        setStartDate(lowestCheckIn?.toLocaleDateString("en-US"))
    }

    if(!endDate){
        setEndDate(highestCheckIn?.toLocaleDateString("en-US"))
    }


   },[startDate,endDate])
   
console.log(lowestCheckIn?.toLocaleDateString("en-US"), highestCheckIn?.toLocaleDateString("en-US"))
    

const onCurrentUserChange=()=>{
setCurrentUser(()=>!currentUser)
}


    const dropdownValues: InputValue[] = [
        { name: 'Single', code: '111' },
        { name: 'Double', code: '222' },
        { name: 'Twin Bed', code: '333' },
        { name: 'Executive', code: '444' },
    ];


    const addUsageInputField = () => {
        setUsageInputFields([...usageInputFields, {
            usage: '',
        }])

        console.log(usageInputFields)

    }

    const removeUsageInputField = (index: number) => {
        const rows = [...usageInputFields];
        rows.splice(index, 1);
        setUsageInputFields(rows);
    }

    const handleUsageInputFieldChange = (index: number, evnt: any) => {
        const { name, value } = evnt.target;
        const list: any = [...usageInputFields];
        list[index].usage = value
        setUsageInputFields(list);
    }


    const addDiseaseInputField = () => {
        setDiseaseInputFields([...diseaseInputFields, {
            disease: '',
        }])


    }

    const removeDiseaseInputField = (index: number) => {
        const rows = [...diseaseInputFields];
        rows.splice(index, 1);
        setDiseaseInputFields(rows);
    }

    const handleDiseaseInputFieldChange = (index: number, evnt: any) => {
        const { name, value } = evnt.target;
        const list: any = [...diseaseInputFields];
        list[index].disease = value
        setDiseaseInputFields(list);
    }




    const formatCurrency = (value: number) => {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'TSH' });
    };

    const onUploadHandler = (event: any) => {
        const file = event.files[0];
        setProductImage(file);

    };

    const openNew = () => {
        setDiseaseInputFields([])
        setUsageInputFields([])
        setProduct(emptyProduct);
        setSubmitted(false);
        setProductDialog(true);
        
    };
    const openPrint = () => {
       
        const start_date=new Date(startDate).toLocaleDateString('sw-TZ')
        const end_date=new Date(endDate).toLocaleDateString('sw-TZ')
        const url = `/reports?start_date=${start_date}&end_date=${end_date}&user=${currentUser?FIREBASE_AUTH?.currentUser?.uid:''}`;
        window.open(url, '_blank');
    };

    const hideDialog = () => {
        setSubmitted(false);
        setProductDialog(false);
    };

    const hideDeleteProductDialog = () => {
        setDeleteProductDialog(false);
    };

    const hideDeleteProductsDialog = () => {
        setDeleteProductsDialog(false);
    };


    const hidelowPriceProductsDialog = () => {
        setLowPriceDeleteProductsDialog(false);
    };

    const hideAddDateToUserProductsDialog = () => {
        setAddDateToUserProductsDialog(false);
    };

    

    

    const handleSaveProduct = async (downloadURL: string) => {
        
        if (product.f_name.trim()) {
            let _products = [...products];
            let _product = { ...product };
            console.log(_product.check_in)
            if (product.id) {
                setIsLoadingSubmit(true)
                const ref = doc(FIRESTORE_DB, `products/${product.id}`)
                await updateDoc(ref, {
                    f_name: _product.f_name,
                    l_name: _product.l_name,
                    phone: _product.phone,
                    from: _product.from,
                    destination: _product.destination,
                    check_in: _product.check_in,
                    check_out: _product.check_out,
                    room_no: _product.room_no,
                    payment: _product.payment,
                    id_no:_product.id_no,
                    room_type:_product.room_type,
                    updatedBy:FIREBASE_AUTH.currentUser?.uid,
                    updatedAt: serverTimestamp(),
                })
                loadProducts()
                toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Client Updated', life: 3000 });
                console.log(product.id)

            } else {
                if (true) {
                    setIsLoadingSubmit(true)
                    console.log(_product.room_type)
                    const doc = await addDoc(collection(FIRESTORE_DB, 'products'), {
                        f_name: _product.f_name,
                        l_name: _product.l_name,
                        phone: _product.phone,
                        from: _product.from,
                        destination: _product.destination,createdAt: serverTimestamp(),
                        check_in: _product.check_in,
                        check_out: _product.check_out,
                        room_no: _product.room_no,
                        payment: _product.payment,
                        id_no:_product.id_no,
                        room_type:_product.room_type,
                        reported:false,
                        createdBy:FIREBASE_AUTH.currentUser?.uid,
                        createdByName:capitalizeFirstLetter(user?.f_name)+" "+capitalizeFirstLetter(user?.l_name),
                        createdAt: serverTimestamp(),
                        

                    })
                    loadProducts()
                    toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Client Created', life: 3000 });



                }

            }

            setProducts(_products);
            setProductDialog(false);
            setProduct(emptyProduct);
            setProductImage(null);
            setIsLoadingSubmit(false);
        }
       
        
    }


    const saveProduct = async () => {

       const currRoom= clientRoomsArr.find(item=>item.room_no==product.room_no)

        if(currRoom){
              if(currRoom.payment_min>product.payment){
                setRoomMinPrice(currRoom.payment_min)
                setLowPriceDeleteProductsDialog(true)
               return
              }   
        }
        submitProduct()
        

    };

    function getFormattedDateToday() {
       
      
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
      }

      function getFormattedDateTomorrow() {
       
      
        const today = new Date();
        today.setDate(today.getDate() + 1);
        today.setHours(0, 0, 0, 0);
        return today
      }
      
      const submitCreateProduct=async()=>{
        const { id, ...productWithoutId } = product;

        const doc = await addDoc(collection(FIRESTORE_DB, 'products'), {
            ...productWithoutId,
            reported:false,
            check_in:getFormattedDateToday(),
            check_out:getFormattedDateTomorrow(),
            createdBy:FIREBASE_AUTH.currentUser?.uid,
            createdByName:capitalizeFirstLetter(user?.f_name)+" "+capitalizeFirstLetter(user?.l_name),
            createdAt: serverTimestamp(),
        })

        loadProducts()
        toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Client Created', life: 3000 });
        setAddDateToUserProductsDialog(false)

      }

    const createProduct = async (product: Demo.Product) => {
        setAddDateToUserProductsDialog(true)
        setProduct({...product})
    };

    const editProduct = (product: Demo.Product) => {
        setProduct({ ...product });
        setUsageInputFields(product.usages)
        setDiseaseInputFields(product.diseases)
        setProductDialog(true);
    };

    const confirmDeleteProduct = (product: Demo.Product) => {
        setProduct(product);
        setDeleteProductDialog(true);
    };

    const deleteProduct = () => {

        const reff = doc(FIRESTORE_DB, `products/${product.id}`)
        deleteDoc(reff)

        loadProducts()
        setDeleteProductDialog(false);
        setProduct(emptyProduct);
        toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Client Deleted', life: 3000 });


    };

    const findIndexById = (id: string) => {
        let index = -1;
        for (let i = 0; i < products.length; i++) {
            if (products[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    };

    const createId = () => {
        let id = '';
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };



    const confirmDeleteSelected = () => {
        setDeleteProductsDialog(true);
    };

    const deleteSelectedProducts = () => {
        let _products = products.filter((val) => !selectedProducts?.includes(val));
        setProducts(_products);
        setDeleteProductsDialog(false);
        setSelectedProducts([]);
        toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
    };

    const onCategoryChange = (e: RadioButtonChangeEvent) => {
        let _product = { ...product };
        _product['category'] = e.value;
        setProduct(_product);
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        console.log(val)
        let _product = { ...product };
        _product[`${name}`] = val;

        setProduct(_product);
    };

    const onInputChangeRoomNo = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        console.log(val)
        let _product = { ...product };
        _product[`${name}`] = val;
        setProduct(_product);

        const room=clientRoomsArr.find(item=>item.room_no==val)
       
       setSelectedRoom(room)
        
        
       
       
       


    };

    

    const onInputNumberChange = (e: InputNumberValueChangeEvent, name: string) => {
        const val = e.value || 0;
        let _product = { ...product };
        _product[`${name}`] = val;

        setProduct(_product);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2 flex">
                <Button icon="pi pi-print" severity="danger"  onClick={openPrint}/>
                <div className='ml-3'>
                <Calendar maxDate={new Date(endDate)} dateFormat="dd/mm/yy"  placeholder='Start Date' showIcon showButtonBar value={startDate} onChange={(e)=>{
                    console.log(e.target.value)
                    setCalenderChangedByUser(true)
                    setStartDate(e.target.value)
                    }} />
                </div>
                <div className='ml-3'>
                <Calendar minDate={new Date(startDate)} dateFormat="dd/mm/yy" placeholder='End Date' showIcon showButtonBar value={endDate} onChange={(e)=>{
                   setCalenderChangedByUser(true)
                   setEndDate(e.target.value)
                    }} />
                </div>
                <div className="col-12 md:col-3">
                            <div className="field-checkbox">
                                <Checkbox inputId="checkOption3" name="option" value={currentUser} checked={currentUser} onChange={onCurrentUserChange} />
                                <label htmlFor="checkOption3">Current User</label>
                            </div>
                </div>
                
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    
                    <Button label="New" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
                </div>
            </React.Fragment>
        );
    };



    const codeBodyTemplate = (rowData: Demo.Product) => {
        return (
            <>
                <span className="p-column-title">Code</span>
                {rowData.code}
            </>
        );
    };

    const nameBodyTemplate = (rowData: Demo.Product) => {
        return (
            <>
                <span className="p-column-title">Full Name</span>
                {capitalizeFirstLetter(rowData.f_name) + " " + capitalizeFirstLetter(rowData.l_name)}
            </>
        );
    };

    const phoneBodyTemplate = (rowData: Demo.Product) => {
        return (
            <>
                <span className="p-column-title">Phone</span>
                {rowData.phone}
            </>
        );
    };
    const serviceBodyTemplate = (rowData: Demo.Product) => {

        return (
            <>
                <span className="p-column-title">Room No.</span>
                {rowData.room_no}
            </>
        );
    };



    const streetBodyTemplate = (rowData: Demo.Product) => {
        return (
            <>
                <span className="p-column-title">Payment</span>
                {formatCurrency(rowData.payment as number)}{'/='}
            </>
        );
    };


    const imageBodyTemplate = (rowData: Demo.Product) => {
        return (
            <>
                <span className="p-column-title">Image</span>
                <img src={rowData.image} alt={rowData.image} className="shadow-2" width="100" />
            </>
        );
    };

    const priceBodyTemplate = (rowData: Demo.Product) => {
        return (
            <>
                <span className="p-column-title">Price</span>
                {formatCurrency(rowData.price as number)}
            </>
        );
    };

    const categoryBodyTemplate = (rowData: Demo.Product) => {
        return (
            <>
                <span className="p-column-title">Category</span>
                {rowData.category}
            </>
        );
    };

    const ratingBodyTemplate = (rowData: Demo.Product) => {
        return (
            <>
                <span className="p-column-title">Reviews</span>
                <Rating value={rowData.rating} readOnly cancel={false} />
            </>
        );
    };

    const statusBodyTemplate = (rowData: Demo.Product) => {
        return (
            <>
                <span className="p-column-title">Status</span>
                <span className={`product-badge status-${rowData.inventoryStatus?.toLowerCase()}`}>{rowData.inventoryStatus}</span>
            </>
        );
    };

    const descriptionBodyTemplate = (rowData: Demo.Post) => {
        return (
            <>
                <span className="p-column-title">Description</span>
                {rowData.description}
            </>
        );
    };


    const actionBodyTemplate = (rowData: Demo.Product) => {
        return (
            <>
                <Button icon="pi pi-calendar-plus" rounded severity="primary" className="mr-2" onClick={() => createProduct(rowData)} />
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editProduct(rowData)} />

                {rowData.createdBy==FIREBASE_AUTH?.currentUser?.uid && rowData?.reported==false ?<Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteProduct(rowData)} />:null}
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">{`List of Clients`} {` `}
                <Badge value={products.length} severity="success" className='text-lg'></Badge>
            </h5>

            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const isFormFilled = () => {

        return product.f_name?.length > 0 &&
            product.l_name?.length > 0 &&
            product.phone?.length > 0 &&
            product.from?.length > 0 &&
            product.destination?.length > 0 &&
            product.check_in  &&
            product.check_out &&
            product.room_no?.length > 0 &&
            product.room_type && 
            product.id_no?.length > 0 &&
            product.payment >= 0
            


    }


    const productDialogFooter =()=> {
        const hasData= !! product?.f_name?.trim()
      return (
        <>
      <div className={hasData && `flex items-center justify-between`}>

         {hasData && <div className="mr-auto mt-5">
            <span className="text-500">By:</span>
            <span className="text-green-500 font-medium">{product?.createdByName} </span>
            
            </div>}

          <div className={hasData && `flex space-x-4`}>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
            {(product.createdBy==FIREBASE_AUTH?.currentUser?.uid  && product?.reported==false) || !product?.id  ?  <Button
              label={!isLoadingSubmit ? `Save` : <LoadingSpinner />}
              icon={!isLoadingSubmit && `pi pi-check`}
              text
              onClick={saveProduct}
              disabled={!isFormFilled() || isLoadingSubmit}
            />:null}
          </div>
        </div>
        </>
      )
    };
      


    const deleteProductDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteProductDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteProduct} />
        </>
    );
    const deleteProductsDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteProductsDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteSelectedProducts} />
        </>
    );

    const submitProduct=(isLessPrice=false)=>{
         setSubmitted(true);
         setLowPriceDeleteProductsDialog(false)
         handleSaveProduct('');
       
         if(isLessPrice){
            console.log("Nipooooooooooooo")
            const currRoom= clientRoomsArr.find(item=>item.room_no==product.room_no)
            const responsePhone = fetch('/api/email_low_price', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    payment:product.payment,
                    payment_less:currRoom.payment_min,
                    room_no:product.room_no,
                    user:capitalizeFirstLetter(user?.f_name)+" "+capitalizeFirstLetter(user?.l_name),
                    user_phone:user?.phone,
                    }) 
              });
         }
         
    }

    const lowPriceProductsDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hidelowPriceProductsDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={(e)=>submitProduct(true)} />
        </>
    );
    const  addDateToUserProductsDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideAddDateToUserProductsDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={(e)=>submitCreateProduct()} />
        </>
    );

   

   

    const imageSkeletonBodyTemplate = (rowData: Demo.Product) => {
        return (
            <>
                <span className="p-column-title">Full Name</span>
                <Skeleton width="7rem" height="4rem"></Skeleton>
            </>
        );
    };
    const titleSkeletonBodyTemplate = (rowData: Demo.Post) => {
        return (
            <>
                <span className="p-column-title">Phone</span>
                <div className="flex">
                    <div style={{ flex: '1' }}>
                        <Skeleton width="100%" className="mb-2"></Skeleton>
                        <Skeleton width="75%"></Skeleton>
                    </div>
                </div>
            </>
        );
    };

    const descriptionSkeletonBodyTemplate = (rowData: Demo.Post) => {
        return (
            <>
                <span className="p-column-title">Check In</span>
                <div className="flex">
                    <div style={{ flex: '1' }}>
                        <Skeleton width="100%" className="mb-2"></Skeleton>
                        <Skeleton width="75%"></Skeleton>
                    </div>
                </div>
            </>
        );
    };

    const priceSkeletonBodyTemplate = (rowData: Demo.Post) => {
        return (
            <>
                <span className="p-column-title">Payment</span>
                <div className="flex">
                    <div style={{ flex: '1' }}>
                        <Skeleton width="75%"></Skeleton>
                    </div>
                </div>
            </>
        );
    };


    const actionSkeletonBodyTemplate = (rowData: Demo.Product) => {
        return (
            <>
                <div className='flex'>
                    <Skeleton shape="circle" size="3rem" className="mr-2"></Skeleton>
                    <Skeleton shape="circle" size="3rem" className="mr-2"></Skeleton>
                </div>
            </>
        );
    };


    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    {isLoading && <DataTable
                        value={[{}, {}, {}, {}, {}, {}, {}, {}, {}]}
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                        <Column header="Client's Name" body={imageSkeletonBodyTemplate}></Column>
                        <Column field="title" header="Phone Number" sortable body={titleSkeletonBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="description" header="Room no." sortable body={descriptionSkeletonBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="price" header="Payment" sortable body={priceSkeletonBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column body={actionSkeletonBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>}



                    {!isLoading && <DataTable
                        ref={dt}
                        value={products}
                        selection={selectedProducts}
                        onSelectionChange={(e) => setSelectedProducts(e.value as Demo.Product[])}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                        globalFilter={globalFilter}
                        emptyMessage="No products found."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                        <Column field="f_name" header="Client's Name" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="phone" header="Phone Number" body={phoneBodyTemplate} sortable></Column>
                        <Column field="room_no" header="Room No." body={serviceBodyTemplate} sortable></Column>
                        <Column field="payment" header="Payment" body={streetBodyTemplate} sortable></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>}

                    <Dialog visible={productDialog} style={{ width: '470px' }} header="Client's Details" modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>
                    
                        <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="f_name">First Name:</label>
                                <InputText placeholder='Enter First Name' id="f_name" value={product.f_name} onChange={(e) => onInputChange(e, 'f_name')} required autoFocus className={classNames({ 'p-invalid': submitted && !product.f_name })} />
                                {submitted && !product.f_name && <small className="p-invalid">First Name: is required.</small>}
                            </div>
                            <div className="field col">
                                <label htmlFor="l_name">Last Name:</label>
                                <InputText placeholder='Enter Last Name' id="l_name" value={product.l_name} onChange={(e) => onInputChange(e, 'l_name')} required className={classNames({ 'p-invalid': submitted && !product.l_name })} />
                                {submitted && !product.l_name && <small className="p-invalid">Last Name: is required.</small>}
                            </div>
                        </div>
                        <div className="field">
                            <label htmlFor="phone">Phone:</label>
                            <InputText placeholder='Enter Phone Number' id="phone" value={product.phone} onChange={(e) => onInputChange(e, 'phone')} required  className={classNames({ 'p-invalid': submitted && !product.phone })} />
                            {submitted && !product.phone && <small className="p-invalid">Phone: is required.</small>}
                        </div>
                        <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="from">From:</label>
                                <InputText placeholder='Enter from' id="from" value={product.from} onChange={(e) => onInputChange(e, 'from')} required  className={classNames({ 'p-invalid': submitted && !product.from })} />
                                {submitted && !product.from && <small className="p-invalid">From: is required.</small>}
                            </div>
                            <div className="field col">
                                <label htmlFor="destination">Destination:</label>
                                <InputText placeholder='Enter  Destination' id="destination" value={product.destination} onChange={(e) => onInputChange(e, 'destination')} required className={classNames({ 'p-invalid': submitted && !product.destination })} />
                                {submitted && !product.destination && <small className="p-invalid">Destination: is required.</small>}
                            </div>
                        </div>
                        <div className="field">
                            <label htmlFor="check_in">Check In:</label>
                            <Calendar maxDate={new Date(product.check_out)} dateFormat="dd/mm/yy" placeholder='Enter CheckIn Date' showIcon showButtonBar value={product.check_in} onChange={(e) => onInputChange(e, 'check_in')} required className={classNames({ 'p-invalid': submitted && !product.check_in })} />
                            {submitted && !product.check_in && <small className="p-invalid">Check In: is required.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="check_out">Check Out:</label>
                            <Calendar minDate={new Date(product.check_in)} dateFormat="dd/mm/yy" placeholder='Enter CheckOut Date' showIcon showButtonBar value={product.check_out} onChange={(e) => onInputChange(e, 'check_out')} required className={classNames({ 'p-invalid': submitted && !product.check_out })} />
                            {submitted && !product.check_out && <small className="p-invalid">Check Out: is required.</small>}
                        </div>

                        <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="room_no">Room Number:</label>
                                {/* <InputText placeholder='Enter Room Number' id="room_no" value={product.room_no} onChange={(e) => onInputChange(e, 'room_no')} required  className={classNames({ 'p-invalid': submitted && !product.room_no })} /> */}
                                <AutoComplete placeholder='Enter Room Number' id="room_no" value={product.room_no} suggestions={filteredCountries} completeMethod={search} onChange={(e) => onInputChangeRoomNo(e, 'room_no')} required  className={classNames({ 'p-invalid': submitted && !product.room_no })} />
                                {submitted && !product.room_no && <small className="p-invalid">Room Number: Name is required.</small>}
                            </div>


                            <div className="field col">
                                <label htmlFor="room_type">Room Type:</label>
                                <Dropdown id="room_type" value={product.room_type} onChange={(e) => onInputNumberChange(e, 'room_type')} options={rooms} optionLabel="name" placeholder="Select Room Type" required className={classNames({ 'p-invalid': submitted && !product.room_type })} />
                                {submitted && !product.room_type && <small className="p-invalid">Room Type: is required.</small>}
                            </div>
                        </div>
                        <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="id_no">ID Number:</label>
                                <InputText placeholder='Enter ID Number' id="id_no" value={product.id_no} onChange={(e) => onInputChange(e, 'id_no')} required  className={classNames({ 'p-invalid': submitted && !product.id_no })} />
                                {submitted && !product.id_no && <small className="p-invalid">ID Number: Name is required.</small>}
                            </div>

                            <div className="field col">
                                <label htmlFor="payment">Payment:</label>
                                <InputNumber placeholder='Enter Amount in Tsh' id="payment" value={product.payment} onChange={(e) => onInputNumberChange(e, 'payment')} required  className={classNames({ 'p-invalid': submitted && !product.payment })} mode="currency" currency="TZS" locale="en-TZ" />
                                {submitted && !product.payment && <small className="p-invalid">Payment: is required.</small>}
                            </div>
                        </div>

                       

                    </Dialog>

                    <Dialog visible={deleteProductDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {product && (
                                <span>
                                    Are you sure you want to delete <b>{product.name}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteProductsDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteProductsDialogFooter} onHide={hideDeleteProductsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {product && <span>Are you sure you want to delete the selected products?</span>}
                        </div>
                    </Dialog>

                    <Dialog visible={lowPriceProductsDialog} style={{ width: '450px' }} header="Confirm" modal footer={lowPriceProductsDialogFooter} onHide={hidelowPriceProductsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem'}} />
                            <span>Are you sure you want to sell this room with price less than <span className='text-lg text-red-500'>{formatNumberWithCommas(roomMinPrice)}{'/='}</span> ?</span>
                        </div>
                    </Dialog>
                    <Dialog visible={addDateToUserProductsDialog} style={{ width: '450px' }} header="Confirm" modal footer={addDateToUserProductsDialogFooter} onHide={hideAddDateToUserProductsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem'}} />
                            <span>Are you sure you want to add <span className='text-lg text-red-500'>1 Day</span> form <span className='text-lg text-red-500'>{getFormattedDateToday().toLocaleDateString("sw-TZ")}-{getFormattedDateTomorrow().toLocaleDateString("sw-TZ")}</span> to this Client(<span className='text-lg text-red-500'>{capitalizeFirstLetter(product.f_name) +" "+capitalizeFirstLetter(product.l_name)}</span>)  ?</span>
                        </div>
                    </Dialog>

                </div>
            </div>
        </div>
    );
};

export default Product;
