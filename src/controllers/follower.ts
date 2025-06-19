// import { Request, Response, NextFunction } from 'express';
// import { followersCollection, usersCollection } from '../models/fireStoreCollection';
// import ApiError from '../utils/ApiError';


// export const getFollowing = async (req: Request, res: Response, next: NextFunction) => {
//     const { userId } = req.params;

//     if (!userId) {
//         throw new ApiError(400, 'User ID is required');
//     }

//     // get all users
//     const allUsers = await usersCollection.get();

//     const followingusersData = await followersCollection.where('followerUserId', '==', userId).get();

//     if (followingusersData.empty) {
//         res.status(200).json({ followingUsers: [] });
//         return
//     }
//     const followingUsers = followingusersData.docs.map(doc => {
//         const followingUserId = doc.data().followingUserId;
//         const user = allUsers.docs.find(u => u.id === followingUserId);
//         if (user) {
//             return {
//                 id: user.id,
//                 ...user.data()
//             };
//         }
//         return null;
//     }).filter(user => user !== null);
//     if (followingUsers.length === 0) {
//         res.status(200).json({ followingUsers: [] });
//         return
//     }

//     res.status(200).json({ followingUsers });

// }

// export const followUser = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { userId } = req.body;
//         const { user } = req;

//         if (!user) {
//             throw new ApiError(401, 'Unauthorized');
//         }
//         if (!userId) {
//             throw new ApiError(400, 'User ID is required');
//         }

//         if (userId === user.id) {
//             throw new ApiError(400, 'You cannot follow yourself');
//         }

//         const docId = `${user.id}${userId}`;

//         // Check if the follower relationship already exists
//         followersCollection.doc(docId).get()
//             .then((doc) => {
//                 if (doc.exists) {
//                     throw new ApiError(400, 'You are already following this user');
//                 }

//                 // Create the follower relationship
//                 return followersCollection.doc(docId).set({
//                     followerUserId: user.id,
//                     followingUserId: userId,
//                     createdAt: new Date()
//                 });
//             })
//             .then(() => {
//                 res.status(200).json({ message: 'Successfully followed the user' });
//             })
//             .catch(error => {
//                 if (error instanceof ApiError) {
//                     next(error);
//                 } else {
//                     console.error('Error following user:', error);
//                     next(new ApiError(500, 'Internal Server Error'));
//                 }
//             });

//     } catch (error) {
//         next(error)
//     }
// }

// export const getFollowers = async (req: Request, res: Response, next: NextFunction) => {
//     const { userId } = req.params;

//     if (!userId) {
//         throw new ApiError(400, 'User ID is required');
//     }

//     // get all users
//     const allUsers = await usersCollection.get();

//     const followersData = await followersCollection.where('followingUserId', '==', userId).get();

//     if (followersData.empty) {
//         res.status(200).json({ followers: [] });
//         return
//     }

//     const followers = followersData.docs.map(doc => {
//         const followerUserId = doc.data().followerUserId;
//         const user = allUsers.docs.find(u => u.id === followerUserId);
//         if (user) {
//             return {
//                 id: user.id,
//                 ...user.data()
//             };
//         }
//         return null;
//     }).filter(user => user !== null);

//     if (followers.length === 0) {
//         res.status(200).json({ followers: [] });
//         return
//     }

//     res.status(200).json({ followers });
// }

// export const getUsersWhichAreNotFollowing = async (req: Request, res: Response, next: NextFunction) => {
//     const { userId } = req.params;

//     if (!userId) {
//         throw new ApiError(400, 'User ID is required');
//     }

//     const allUsers = await usersCollection.get();

//     const followingUsersData = await followersCollection.where('followerUserId', '==', userId).get();

//     const followingUserIds = followingUsersData.docs.map(doc => doc.data().followingUserId);

//     const notFollowingUsers = allUsers.docs.filter(user => !followingUserIds.includes(user.id) && user.id !== userId)
//         .map(user => ({
//             id: user.id,
//             ...user.data()
//         }));

//     res.status(200).json({message: "Users not followed by the user", data:notFollowingUsers });
// }

// export const getRecentFollowUpdates = async (req: Request, res: Response, next: NextFunction) => {
//     try {

//         let limit:number = parseInt(req.query.limit as string) || 5;

//         const usersData = await usersCollection.get();
//         if (usersData.empty) {
//             throw new ApiError(404, 'No users found');
//         }
//         const allUsers = usersData.docs.map(doc => ({
//             id: doc.id,
//             ...doc.data()
//         }));

//         const followingUsersData = await followersCollection.orderBy('createdAt', 'desc').limit(limit).get();
//         if (!followingUsersData) {
//             throw new ApiError(404, 'No follow updates found');
//         }

//         const recentFollowUpdates = followingUsersData.docs.map(doc => {
//             const followData = doc.data();
//             const followerUser = allUsers.find(user => user.id === followData.followerUserId);
//             const followingUser = allUsers.find(user => user.id === followData.followingUserId);

//             if (followerUser && followingUser) {
//                 return {
//                     id: doc.id,
//                     followerUserId: {
//                         ...followerUser
//                     },
//                     followingUserId: {
//                         ...followingUser
//                     },
//                     createdAt: followData.createdAt.toDate()
//                 };
//             }
//             return null;

//         }).filter(update => update !== null);

//         if (recentFollowUpdates.length === 0) {
//             res.status(200).json({ data: [] });
//             return;
//         }


//         res.status(200).json({"message": "Recent follow updates fetched successfully", data:recentFollowUpdates});
//     } catch (error) {
//         next(error);
//     }
// }