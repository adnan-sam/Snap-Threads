"use server";

import { revalidatePath } from "next/cache";

import { connectToDB } from "../mongoose";

import User from "../models/user.model";
import Thread from "../models/thread.model";
import Community from "../models/community.model";

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  connectToDB();

  // Calculate the number of posts to skip based on the page number and page size.
  const skipAmount = (pageNumber - 1) * pageSize;

  // Create a query to fetch the posts that have no parent (top-level threads) (a thread that is not a comment/reply).
  const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
    })
    .populate({
      path: "community",
      model: Community,
    })
    .populate({
      path: "children", // Populate the children field
      populate: {
        path: "author", // Populate the author field within children
        model: User,
        select: "_id name parentId image", // Select only _id and username fields of the author
      },
    });

  // Count the total number of top-level posts (threads) i.e., threads that are not comments.
  const totalPostsCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  }); // Get the total count of posts

  const posts = await postsQuery.exec();

  const isNext = totalPostsCount > skipAmount + posts.length;

  return { posts, isNext };
}

interface Params {
  text: string,
  author: string,
  communityId: string | null,
  path: string,
}

export async function createThread({ text, author, communityId, path }: Params) {
    try {
      connectToDB();
  
      const communityIdObject = await Community.findOne(
        { id: communityId },
        { _id: 1 }
      );

      // Streak functionality starts
      const currentTime = new Date().getTime();
      const user = await User.findById(author);
      if(user.streaks) {
        const len=user.threads.length;
        if(len>0) {
          const threadId = user.threads[len-1];
          const thread = await fetchThreadById(threadId);
          const lastThreadTime = thread.createdAt.getTime();
          // console.log("LAST thread time -- ", lastThreadTime);
          if (lastThreadTime && (currentTime - lastThreadTime) / (1000 * 60 * 60) > 24 && (currentTime- lastThreadTime) / (1000 * 60 * 60) < 48) {
            // If the next thread is posted after 24 hrs and before 48 hrs
            // console.log("IF called >24 <48 so update");
            user.streaks.current += 1;
            user.streaks.max = Math.max(user.streaks.max, user.streaks.current);
          }
          // else if (lastThreadTime && currentTime - lastThreadTime / (1000 * 60 * 60) < 24) {
          //   user.streaks.current = user.streaks.current;
          //   user.streaks.max = user.streaks.max;
          // }
          else if (lastThreadTime && (currentTime - lastThreadTime) / (1000 * 60 * 60) > 48) {
            // console.log("ELSE if called > 48 so reset");
            user.streaks.current = 1;
            user.streaks.max = Math.max(user.streaks.max, 1);
          }
        }
        else {
          // console.log("PEHLA thread hai, else called");
          user.streaks.current = 1;
          user.streaks.max = 1;
        }
      }
      // Streak functionality ends
  
      const createdThread = await Thread.create({
        text,
        author,
        community: communityIdObject, // Assign communityId if provided, or leave it null for personal account
        likedBy: [],
      });
  
      // Update User model
      await User.findByIdAndUpdate(author, {
        $push: { threads: createdThread._id },
        $set: { 'streaks.current': user.streaks.current, 'streaks.max': user.streaks.max },
      });
  
      if (communityIdObject) {
        // Update Community model
        await Community.findByIdAndUpdate(communityIdObject, {
          $push: { threads: createdThread._id },
        });
      }
  
      revalidatePath(path);
    } catch (error: any) {
      throw new Error(`Failed to create thread: ${error.message}`);
    }
  }

async function fetchAllChildThreads(threadId: string): Promise<any[]> {
  const childThreads = await Thread.find({ parentId: threadId });

  const descendantThreads = [];
  for (const childThread of childThreads) {
    const descendants = await fetchAllChildThreads(childThread._id);
    descendantThreads.push(childThread, ...descendants);
  }

  return descendantThreads;
}

export async function deleteThread(id: string, path: string): Promise<void> {
  try {
    connectToDB();

    // Find the thread to be deleted (the main thread)
    const mainThread = await Thread.findById(id).populate("author community");

    if (!mainThread) {
      throw new Error("Thread not found");
    }

    // Fetch all child threads and their descendants recursively
    const descendantThreads = await fetchAllChildThreads(id);

    // Get all descendant thread IDs including the main thread ID and child thread IDs
    const descendantThreadIds = [
      id,
      ...descendantThreads.map((thread) => thread._id),
    ];

    // Extract the authorIds and communityIds to update User and Community models respectively
    const uniqueAuthorIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.author?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainThread.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    const uniqueCommunityIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.community?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainThread.community?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    // Recursively delete child threads and their descendants
    await Thread.deleteMany({ _id: { $in: descendantThreadIds } });

    // Update User model
    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    // Update Community model
    await Community.updateMany(
      { _id: { $in: Array.from(uniqueCommunityIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to delete thread: ${error.message}`);
  }
}

export async function fetchThreadById(threadId: string) {
  connectToDB();

  try {
    const thread = await Thread.findById(threadId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      }) // Populate the author field with _id and username
      .populate({
        path: "community",
        model: Community,
        select: "_id id name image",
      }) // Populate the community field with _id and name
      .populate({
        path: "children", // Populate the children field
        populate: [
          {
            path: "author", // Populate the author field within children
            model: User,
            select: "_id id name parentId image", // Select only _id and username fields of the author
          },
          {
            path: "children", // Populate the children field within children
            model: Thread, // The model of the nested children (assuming it's the same "Thread" model)
            populate: {
              path: "author", // Populate the author field within nested children
              model: User,
              select: "_id id name parentId image", // Select only _id and username fields of the author
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (err) {
    console.error("Error while fetching thread:", err);
    throw new Error("Unable to fetch thread");
  }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectToDB();

  try {
    // Find the original thread by its ID
    const originalThread = await Thread.findById(threadId);

    if (!originalThread) {
      throw new Error("Thread not found");
    }

    // Create the new comment thread
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId, // Set the parentId to the original thread's ID
    });

    // Save the comment thread to the database
    const savedCommentThread = await commentThread.save();

    // Add the comment thread's ID to the original thread's children array
    originalThread.children.push(savedCommentThread._id);

    // Save the updated original thread to the database
    await originalThread.save();

    revalidatePath(path);
  } catch (err) {
    console.error("Error while adding comment:", err);
    throw new Error("Unable to add comment");
  }
}

export async function likeThread(
  threadId: string,
  currrentUserId: string,
) {
  connectToDB();

  if (!threadId || !currrentUserId) {
    console.error('Thread ID or Current User ID is empty.');
    return;
  }

  try {
    // Find the original thread by its ID
    const orgThread = await Thread.findById(threadId);

    if (!orgThread) {
      throw new Error("Thread not found");
    }

    // Check whether the user has already liked the thread or not, if yes then remove like
    
    if(orgThread.likedBy.includes(currrentUserId)) {
      const index = orgThread.likedBy.indexOf(currrentUserId);
      orgThread.likedBy.splice(index, 1);
      await orgThread.save();
      console.log("User removed from the likedBy array.");
      return false;
    }
    else {
      orgThread.likedBy.push(currrentUserId);
      await orgThread.save();
      console.log("User liked the thread successfully");
      return true;
    }
    // console.log("The original thread is--", orgThread);

  } catch(error: any) {
    throw new Error("Failed to Like the Thread ", error.message);
  }
}

export async function fetchLikeStatus(
  threadId: string,
  currrentUserId: string,
) {
  connectToDB();

  if (!threadId || !currrentUserId) {
    console.error('Thread ID or Current User ID is empty.');
    return;
  }

  try {
    // Find the original thread by its ID
    const orgThread = await Thread.findById(threadId);

    if (!orgThread) {
      throw new Error("Thread not found");
    }
    
    if(orgThread.likedBy.includes(currrentUserId)) {
      return true;
    }
    else {
      return false;
    }

  } catch(error: any) {
    throw new Error("Failed in fetching the Like Status ", error.message);
  }
}

export async function fetchLikeCount(
  threadId: string,
) {
  connectToDB();

  if (!threadId) {
    console.error('Thread ID is empty.');
    return;
  }

  try {
    // Find the original thread by its ID
    const orgThread = await Thread.findById(threadId);

    if (!orgThread) {
      throw new Error("Thread not found");
    }
    
    return orgThread.likedBy.length;

  } catch(error: any) {
    throw new Error("Failed in fetching the Like Status ", error.message);
  }
}