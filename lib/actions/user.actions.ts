"use server";

import { FilterQuery, SortOrder } from "mongoose";
import { revalidatePath } from "next/cache";

import Community from "../models/community.model";
import Thread from "../models/thread.model";
import User from "../models/user.model";

import { connectToDB } from "../mongoose";

import { currentUser } from "@clerk/nextjs";
import { fetchThreadById } from "./thread.actions";


// Added new function for the Streaks functionality, as it was a problem passing userId to TopBar and then to Streaks
export async function fetchCurrentUserId() {
  const user = JSON.parse(JSON.stringify(await currentUser()));
  return user?.id;
}

export async function fetchUser(userId: string) {
  try {
    connectToDB();

    const user = await User.findOne({ id: userId }).populate({
      path: "communities",
      model: Community,
    });

    return JSON.parse(JSON.stringify(user));

  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export async function updateUser({
  userId,
  bio,
  name,
  path,
  username,
  image,
}: Params): Promise<void> {
  try {
    connectToDB();

    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      { upsert: true }
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`${501}: Failed to create/update user: ${error.message}`);
  }
}

export async function fetchUserPosts(userId: string) {
  try {
    connectToDB();

    // Find all threads authored by the user with the given userId
    const threads = await User.findOne({ id: userId }).populate({
      path: "threads",
      model: Thread,
      populate: [
        {
          path: "community",
          model: Community,
          select: "name id image _id", // Select the "name" and "_id" fields from the "Community" model
        },
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "name image id", // Select the "name" and "_id" fields from the "User" model
          },
        },
      ],
    });
    return threads;
  } catch (error) {
    console.error("Error fetching user threads:", error);
    throw error;
  }
}

// Almost similar to Thead (search + pagination) and Community (search + pagination)
export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectToDB();

    // Calculate the number of users to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Create a case-insensitive regular expression for the provided search string.
    const regex = new RegExp(searchString, "i");

    // Create an initial query object to filter users.
    const query: FilterQuery<typeof User> = {
      id: { $ne: userId }, // Exclude the current user from the results.
    };

    // If the search string is not empty, add the $or operator to match either username or name fields.
    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    // Define the sort options for the fetched users based on createdAt field and provided sort order.
    const sortOptions = { createdAt: sortBy };

    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    // Count the total number of users that match the search criteria (without pagination).
    const totalUsersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();

    // Check if there are more users beyond the current page.
    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function getActivity(userId: string) {
  try {
    connectToDB();

    // Find all threads created by the user
    const userThreads = await Thread.find({ author: userId });

    // Collect all the child thread ids (replies) from the 'children' field of each user thread
    const childThreadIds = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children);
    }, []);

    // Find and return the child threads (replies) excluding the ones created by the same user
    const replies = await Thread.find({
      _id: { $in: childThreadIds },
      author: { $ne: userId }, // Exclude threads authored by the same user
    }).populate({
      path: "author",
      model: User,
      select: "name image _id",
    });

    return replies;
  } catch (error) {
    console.error("Error fetching replies: ", error);
    throw error;
  }
}

// export async function fetchStreaks(userId: string) {
//   try {
//     connectToDB();

//     // Find streaks of the user and return it
//     const user = await User.findOne({ id: userId });
//     // console.log("Streak called");
//     if (user) {
//       const streaks = user.streaks.toObject();
//       // console.log(streaks)
//       return streaks;
//     } else {
//       throw new Error('User not found');
//     }

//   } catch (error) {
//     console.error("Error fetching streaks: ", error);
//     throw error;
//   }
// }

export async function fetchUserUpdatedDetails(userId: string) {
  try {
    connectToDB();
    const user = await User.findOne({ id: userId });
    if(user) {
      return JSON.parse(JSON.stringify(user));
    }
    else {
      throw new Error('User not found');
    }
  } catch (error) {
    console.error("Error fetching User Details: ", error);
    throw error;
  }
}

export async function fetchAllUsers() {
  try {
    connectToDB();
    const userData = await User.find();
    return JSON.parse(JSON.stringify(userData));

  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function fetchCurrentStreaks(userId: string) {
  connectToDB();

  try {
    // Find the original thread by its ID
    const user = await User.findOne({id: userId});
    if(!user) return null;

    const threads = user.threads;
    if(threads.length===0) return JSON.parse(JSON.stringify({ current: 0, max: user.streaks.max }));
    
    const lastThreadId = threads[threads.length-1];
    const lastThread = await fetchThreadById(lastThreadId);
    const currTime = new Date();
    const timeDiff = currTime.getTime() - new Date(lastThread.createdAt).getTime();
    // console.log(timeDiff);
    const minTimeThreshold = 24 * 60 * 60 * 1000; // 24 hours
    const maxTimeThreshold = 36 * 60 * 60 * 1000; // 48 hours

    // Check if timeDiff is between 24 and 48 hours
    if(timeDiff <= minTimeThreshold || timeDiff<=maxTimeThreshold) {
      // console.log("within 24hrs");
      return JSON.parse(JSON.stringify(user.streaks));
    }
    else if (timeDiff>=maxTimeThreshold) {
      // console.log('Time difference is more than 48 hours.');
      //set current streaks to zero
      const currStreak = user.streaks.current;
      const maxStreak = user.streaks.max;
      const newStreak = { currStreak, maxStreak };
      await User.findOneAndUpdate(
        { id: userId },
        {
          streaks: newStreak,
        },
      );
      return newStreak;
    }

    return JSON.parse(JSON.stringify({ current: 0, max: user.streaks.max }));

  } catch(error: any) {
    throw new Error("Failed in fetching last thread time ", error.message);
  }
}