"use client"

import React, { useState } from 'react';
import Image from "next/image";
import { 
    FacebookIcon, 
    PinterestIcon, 
    RedditIcon, 
    WhatsappIcon, 
    LinkedinIcon,
    TelegramIcon,
    InstagramIcon,
    TwitterIcon, 
  } from 'next-share'; 

  interface Props {
    threadId: string;
  }

const ShareThread = (
    {
        threadId,
    }: Props
) => {
  // State to manage the overlay visibility
  const [overlayVisible, setOverlayVisible] = useState(false);

  // Function to toggle the overlay visibility
  const toggleOverlay = () => {
    setOverlayVisible(!overlayVisible);
  };

  // Function to handle click on the image
  const handleImageClick = () => {
    toggleOverlay();
    // Additional logic or API calls can be added here for thread details
  };

  const handleShare = (platform: string) => {
    // Replace 'yourThreadLink' with the actual link
    const thread = threadId;
    const sanitizedThreadId = threadId.replace(/"/g, "");
    const threadLink = `https://snapthreads.vercel.app/thread/${sanitizedThreadId}`;

    // Encode the thread link for URL
    const encodedThreadLink = encodeURIComponent(threadLink);

    // Construct share URLs based on the selected platform
    let shareURL = '';
    switch (platform) {
      case 'whatsapp':
        shareURL = `https://wa.me/?text=${encodedThreadLink}`;
        break;
      case 'telegram':
        shareURL = `https://t.me/share/url?url=${encodedThreadLink}`;
        break;
    //   case 'instagram':
        // Instagram doesn't support direct sharing via URL due to restrictions.
        // You can provide a link to the thread and let the user copy and paste.
        // Adjust this logic based on Instagram's API or sharing capabilities.
        // break;
      case 'twitter':
        shareURL = `https://twitter.com/intent/tweet?url=${encodedThreadLink}&text=Check out this thread!`;
        break;
    case 'facebook':
        shareURL = `https://www.facebook.com/sharer/sharer.php?u=${encodedThreadLink}`;
        break;
    case 'pinterest':
        shareURL = `https://pinterest.com/pin/create/button/?url=${encodedThreadLink}`;
        break;
    case 'reddit':
        shareURL = `https://www.reddit.com/submit?url=${encodedThreadLink}&title=Check out this thread!`;
        break;
    case 'linkedin':
        shareURL = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedThreadLink}`;
        break;
  default:
        break;
    }

    // Open the share URL in a new tab
    window.open(shareURL, '_blank');
  };

  return (
    <div>
      <Image
        src='/assets/share.svg'
        alt='heart'
        width={24}
        height={24}
        className='cursor-pointer object-contain'
        onClick={handleImageClick}
      />

      {overlayVisible && (
       <div className='fixed inset-0 z-50 flex items-center justify-center backdrop-filter backdrop-blur-lg'>
       <div className="overlay-content relative bg-white p-4 rounded-md">
            <Image
                className='mr-2 mt-1 close-btn absolute top-0 right-0 cursor-pointer'
                onClick={toggleOverlay}
                src='assets/icons8-close.svg'
                alt='Close'
                width={24}
                height={24}
            />
            <p className='text-black mb-4'>Share this SnapThread</p>
            <div className='flex'>
            <WhatsappIcon
                className='m-2 cursor-pointer'
                onClick={() => handleShare('whatsapp')}
                size={32}
                round
              />
              <TelegramIcon
                className='m-2 cursor-pointer'
                onClick={() => handleShare('telegram')}
                size={32}
                round
              />
              {/* <InstagramIcon
                className='m-2 cursor-pointer'
                onClick={() => handleShare('instagram')}
                size={32}
                round
              /> */}
              <TwitterIcon
                className='m-2 cursor-pointer'
                onClick={() => handleShare('twitter')}
                size={32}
                round
              />
            <FacebookIcon
                className='m-2 cursor-pointer'
                onClick={() => handleShare('facebook')}
                size={32}
                round
              />
              <PinterestIcon
                className='m-2 cursor-pointer'
                onClick={() => handleShare('pinterest')}
                size={32}
                round
              />
              <RedditIcon
                className='m-2 cursor-pointer'
                onClick={() => handleShare('reddit')}
                size={32}
                round
              />
              <LinkedinIcon
                className='m-2 cursor-pointer'
                onClick={() => handleShare('linkedin')}
                size={32}
                round
              />
            </div>
            <p className="mt-4 text-gray-500 text-xs flex items-center justify-center">Developed by Adnan Sameer</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareThread