import Image from "next/image";
import Link from "next/link";

import { Button } from "../ui/button";

interface Props {
  id: string;
  name: string;
  username: string;
  imgUrl: string;
  bio: string;
  members: {
    image: string;
  }[];
  type?: string;
}

function CommunityCard({ id, name, username, imgUrl, bio, members, type }: Props) {
  return (
    <article className={type==='small' ? 'suggested-community-card' : 'community-card'}>
      <div className='flex flex-wrap items-center gap-3'>
        <Link href={`/communities/${id}`} className={type==='small' ? 'relative h-9 w-9' : 'relative h-12 w-12'}>
          <Image
            src={imgUrl}
            alt='community_logo'
            fill
            className='rounded-full object-cover'
          />
        </Link>

        <div>
          <Link href={`/communities/${id}`}>
            <p className={type==='small' ? 'text-xl text-light-1' : 'text-base-semibold text-light-1'}>{name}</p>
          </Link>
          <p className='text-small-medium text-gray-1'>@{username}</p>
        </div>
      </div>

      {type!=="small" && <p className='mt-4 text-subtle-medium text-gray-1'>{bio}</p>}

      {type !== "small" && <div className='mt-5 flex flex-wrap items-center justify-between gap-3'>
        <Link href={`/communities/${id}`}>
          <Button size='sm' className='community-card_btn'>
            View
          </Button>
        </Link>

        {members.length > 0 && (
          <div className='flex items-center'>
            {members.map((member, index) => (
              <Image
                key={index}
                src={member.image}
                alt={`user_${index}`}
                width={28}
                height={28}
                className={`${
                  index !== 0 && "-ml-2"
                } rounded-full object-cover`}
              />
            ))}
            {members.length > 3 && (
              <p className='ml-1 text-subtle-medium text-gray-1'>
                {members.length}+ Users
              </p>
            )}
          </div>
        )}
      </div>}
    </article>
  );
}

export default CommunityCard;