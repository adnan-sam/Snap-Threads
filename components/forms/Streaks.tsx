"use client"
import Image from "next/image";
import { fetchStreaks } from "@/lib/actions/user.actions";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import fire_filled from "@/public/assets/fire_filled.gif";
import fire_empty from "@/public/assets/fire_empty.png";

interface Props {
    currentUserId: string;
}

function Streaks({ currentUserId }: Props) {
    const [loading, setLoading] = useState<boolean>(true);
    const [currStreaks, setCurrStreaks] = useState<number>(0);
    // const [maxStreaks, setMaxStreaks] = useState<number>(0);
    const pathname = usePathname();
    // console.log(pathname);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if(currentUserId) {
                    // console.log("Fetching streaks data...");
                    const streaksData = await fetchStreaks(currentUserId);
                    setCurrStreaks(streaksData.current);
                    // setMaxStreaks(streaksData.max);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentUserId, pathname]);

    return (
        <div>
            {!loading && (
                <div className="flex items-center gap-2 mr-4">
                    {currStreaks>0 && <Image src={fire_filled} alt="fire" width={40} height={40} />}
                    {currStreaks<=0 && <Image src={fire_empty} alt="fire" width={40} height={40} />}
                  <p className="text-heading3-bold text-light-1">{currStreaks}</p>
                </div>
            )}
        </div>
    );
}

export default Streaks;
