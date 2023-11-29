"use client";

import Image from "next/image";
import { fetchLikeCount, fetchLikeStatus, likeThread } from "@/lib/actions/thread.actions";
import { useEffect, useState } from "react";
import { useRouter, redirect } from "next/navigation";

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
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(()=> {
    const fetchData = async () => {
      try {
        if (currentUserId) {
          const isLiked = await fetchLikeStatus(
            JSON.parse(threadId),
            JSON.parse(currentUserId)
          );
          setLike(isLiked);
        }
        setLikeCount(await fetchLikeCount(JSON.parse(threadId)));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [threadId, currentUserId]);

  const handleLikeClick = async () => {
    if(currentUserId.trim() === '""' || currentUserId === '""') {
      router.push('/sign-in');
      return;
    }

    // setLoading(true);
    setLike(await likeThread(JSON.parse(threadId), JSON.parse(currentUserId)));
    setLikeCount(await fetchLikeCount(JSON.parse(threadId)));
    // setLoading(false);
  }

  return (
    <div>
      {loading ? (
        // Render loading spinner while data is being fetched
        <div className="flex items-center">
          <Image
            src="/assets/heart-gray.svg"
            alt="heart"
            width={24}
            height={24}
            className={`cursor-pointer object-contain`}
            onClick={handleLikeClick}
          />
        </div>
      ) : like === true ? (
        <div className="flex items-center">
          {likeCount > 0 && (
            <p className="mr-2 text-subtle-medium text-light-2">{likeCount}</p>
          )}
          <Image
            src="/assets/heart-filled.svg"
            alt="heart"
            width={24}
            height={24}
            className={`cursor-pointer object-contain`}
            onClick={handleLikeClick}
          />
        </div>
      ) : (
        <div className="flex items-center">
          {likeCount > 0 && (
            <p className="mr-2 text-subtle-medium text-light-2">{likeCount}</p>
          )}
          <Image
            src="/assets/heart-gray.svg"
            alt="heart"
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