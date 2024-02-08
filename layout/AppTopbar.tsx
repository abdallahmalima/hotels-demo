/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { classNames } from 'primereact/utils';
import React, { forwardRef, useContext, useImperativeHandle, useRef, useState } from 'react';
import { AppTopbarRef } from '../types/types';
import { LayoutContext } from './context/layoutcontext';
import { sendPasswordResetEmail, signOut } from 'firebase/auth';
import { FIREBASE_AUTH } from '../firebase.config';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Menu } from 'primereact/menu';
import { Menubar } from 'primereact/menubar';
import { InputText } from 'primereact/inputtext';
import { useUser } from '../demo/hook/DataFetcher';
import { capitalizeFirstLetter } from '../demo/lib/strings';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';


const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);
    const router=useRouter()
    const menu2 = useRef<Menu>(null);
    const toast = useRef<Toast>(null);
    const [deleteProductDialog, setDeleteProductDialog] = useState(false);

    

    const deleteProduct = async() => {
          sendPasswordResetEmail(FIREBASE_AUTH,FIREBASE_AUTH.currentUser?.email)
          setDeleteProductDialog(false);
          toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Email Link Sent Successful', life: 3000 });
       
         
 
     };

     const hideDeleteProductDialog = () => {
        setDeleteProductDialog(false);
    };

    const confirmDeleteProduct = () => {;
        setDeleteProductDialog(true);
    };

     const deleteProductDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteProductDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteProduct} />
        </>
    );

    const [
        isLoadingUser,
        setIsLoadingUser,
        user,
        setUser,
      ]=useUser(FIREBASE_AUTH.currentUser?.uid)

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));


    const nestedMenuitems = [
      
        {
            label: capitalizeFirstLetter(user?.f_name || '')+" "+capitalizeFirstLetter(user?.l_name || ''),
            icon: 'pi pi-fw pi-user',
            items: [
                {
                    label: 'Reset Password',
                    icon: 'pi pi-lock-open',
                    command:()=>{
                     confirmDeleteProduct()
                    }
                },
                {
                    label: 'Sign Out',
                    icon: 'pi pi-sign-out',
                    command:()=>{
                        signOut(FIREBASE_AUTH).then(()=>{
                            router.push('/auth/login');
                           }) 
                       }
                }
            ]
        },
    ];

    return (
        <div className="layout-topbar">
            <Link href="/" className="layout-topbar-logo">
                <img src={`/layout/images/logo-${layoutConfig.colorScheme !== 'light' ? 'white' : 'dark'}.svg`} width="47.22px" height={'35px'} alt="logo" />
                <span>JASMAI HOTEL</span>
            </Link>

            <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
                <i className="pi pi-bars" />
            </button>

            <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={showProfileSidebar}>
                <i className="pi pi-ellipsis-v" />
            </button>

            <div ref={topbarmenuRef} className={classNames('layout-topbar-menu', { 'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible })}>
                  {/* <Button type="button" label="Comments" icon="pi pi-users" severity="warning">
                            <Badge value="8" severity="danger"></Badge>
                    </Button> */}
                <Menubar model={nestedMenuitems} ></Menubar>
               
            </div>
            <Dialog visible={deleteProductDialog} style={{ width: '450px' }} header="Confirm Reset Password" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-lock-open mr-3" style={{ fontSize: '2rem' }} />
                            {user && (
                                <span>
                                    Are you sure you want to reset Password <b>{user?.email}</b>?
                                </span>
                            )}
                        </div>
            </Dialog>
            <Toast ref={toast} />
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;
