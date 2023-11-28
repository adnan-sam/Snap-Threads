"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { fetchLikeCount, fetchLikeStatus, likeThread } from "@/lib/actions/thread.actions";
import { useEffect, useState } from "react";

interface Props {
  threadId: string;
  currentUserId: string;
}

function LikeThread({
  threadId,
  currentUserId,
}: Props) {
  const router = useRouter();
  const [like, setLike] = useState<boolean | undefined>(undefined);
  const [likeCount, setLikeCount] = useState<number>(0);

  useEffect(()=> {
    const fetchData = async () => {
      if(currentUserId) {
        const isLiked = await fetchLikeStatus(JSON.parse(threadId),JSON.parse(currentUserId))
        setLike(isLiked);
      }
      setLikeCount(await fetchLikeCount(JSON.parse(threadId)));
    };
    fetchData();
  }, [threadId, currentUserId])

  const handleLikeClick = async () => {
    if(!currentUserId || currentUserId.trim() === "") {
      router.push('/sign-in');
      return;
    }

    setLike(await likeThread(JSON.parse(threadId),JSON.parse(currentUserId)));
    setLikeCount(await fetchLikeCount(JSON.parse(threadId)));
  }
  return (
    <div>
      {like === true ? (
        <div className="flex items-center">
          {likeCount && <p className="mr-2 text-subtle-medium text-light-2">{likeCount}</p>}
          <Image
            src='/assets/heart-filled.svg'
            alt='heart'
            width={24}
            height={24}
            className={`cursor-pointer object-contain`}
            onClick={handleLikeClick}
          />
        </div>
      ) : (
        <div className="flex items-center">
          {likeCount>0 && <p className="mr-2 text-subtle-medium text-light-2">{likeCount}</p>}
          <Image
            src='/assets/heart-gray.svg'
            alt='heart'
            width={24}
            height={24}
            className={`cursor-pointer object-contain`}
            onClick={handleLikeClick}
          />
        </div>
      )}
    </div>
  );
}

export default LikeThread;