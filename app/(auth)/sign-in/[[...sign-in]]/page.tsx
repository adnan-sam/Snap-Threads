"use client"
import { SignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
    const router = useRouter();
    const [rendered, setIsRendered] = useState(false);

    useEffect(() => {
        setTimeout(()=> {
            setIsRendered(true);
        },1000)   
    })
    return (
    <div>
        <SignIn/>
        {rendered && 
        <div onClick={() => router.push('/')}>
        <p className='mx-auto mt-4 text-center text-small-regular text-light-2 cursor-pointer hover:text-light-3'>Continue without Signing in?</p>
        <p className='mx-auto mt-0 text-center text-small-regular text-light-3'>(You can just see the threads)</p>
        </div>}
    </div>
    );
}