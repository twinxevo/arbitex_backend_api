import * as fs from "fs";
import { level, logger } from "../../config/logger";

import userModel from "../../model/user";
import tradesModel from "../../model/trades";
import { Storage } from "@google-cloud/storage";


const googleCloud = new Storage({
  projectId: process.env.PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  },
});

const profileBucket = googleCloud.bucket(process.env.GOOGLE_BUCKET);

export const userAccount = async (_id: any) => {
  logger.log(level.info, `>> userAccount()`);
  const userData = await userModel.find({
    _id,
    status: "ACTIVE",
  });

  if (userData && userData.length > 0) {

    const userJson = {
      userId: userData[0]._id,
      email: userData[0].email,
      fullName: userData[0].fullName,
      username: userData[0].username,
      role: userData[0].role,
      kycStatus: userData[0].kycStatus,
      createdAt: userData[0].createdAt,
      updatedAt: userData[0].updatedAt,
      status: userData[0].status,
      authProvider: userData[0].authProvider,
      mobileNumber: userData[0].mobileNumber,
      avatar: userData[0].avatar,
      bio: userData[0].bio,
      coverImage: userData[0].coverImage,
      connectedWallet: userData[0].connectedWallet,
    };
    const data = {
      error: false,
      message: "User Data fetched successfully",
      data: userJson,
    };
    return data;
  }
  const data = {
    error: true,
    message: "User not found",
  };
  return data;
};

export const checkUsername = async (
  username: string,
) => {
  logger.log(level.info, `>> checkUsername()`);

  //checking username exists
  const existUsername = await userModel.findOne({ username: username.toLocaleLowerCase() });
  if (existUsername) {
    const data = { error: false, body: { available: false }, message: "Username is not Available" };
    return data;
  } else {
    const data = { error: false, body: { available: true }, message: "Username is Available" };
    return data;
  }
};

export const editProfile = async (_id: string, body: any) => {
  logger.log(level.info, `>> editProfile()`);

  const userExist = await userModel.find({
    _id,
    status: "ACTIVE",
  });
  if (!userExist || userExist.length <= 0) {
    const data = {
      error: true,
      message: "User not found",
    };
    return data;
  }

  let updateData = {};

  if (body.username) {
    const usernameAvailable = await checkUsername(body.username)
    if (!usernameAvailable.body.available) {
      const data = {
        error: true,
        message: "Username is taken"
      };
      return data;
    }

    updateData = { ...updateData, username: body.username };
  }

  if (body.bio && body.bio.length > 200) {
    const data = {
      error: true,
      message: "About me length must be less than 200 characters",
    };
    return data;
  }


  if (body.bio && body.bio.length > 0) {
    updateData = {
      ...updateData,
      bio: body.bio,
    };
  }

  if (body.fullName && body.fullName.length > 0) {
    updateData = {
      ...updateData,
      fullName: body.fullName,
    };
  }

  if (body.mobileNumber && body.mobileNumber.length > 0) {
    updateData = {
      ...updateData,
      mobileNumber: body.mobileNumber,
    };
  }
 


  await userModel.findOneAndUpdate({ _id }, { $set: updateData });
  const userData = await userModel.find({
    _id,
    status: "ACTIVE",
  });
  const data = {
    error: false,
    message: "Profile Updated Successfully",
    data: userData[0],
  };
  return data;
};

export const connectWallet = async (_id: string, body: any) => {
  logger.log(level.info, `>> editProfile()`);

  const userExist = await userModel.find({
    _id,
    status: "ACTIVE",
  });
  if (!userExist || userExist.length <= 0) {
    const data = {
      error: true,
      message: "User not found",
    };
    return data;
  }

  let updateData = {};


  if (body && body.walletId.length > 0) {

    updateData = { ...updateData, connectedWallet: body };
  }


  await userModel.findOneAndUpdate({ _id }, { $set: updateData });

  const data = {
    error: false,
    message: "Profile Updated Successfully",
  };
  return data;
};

export const getUserProfile = async (_id: any) => {
  logger.log(level.info, `>> userAccount()`);
  const userData = await userModel.find({
    _id,
  });

  if (userData && userData.length > 0) {
    const [totalCreations] = await Promise.all([
      tradesModel
        .find({
          $or: [
            {
              $and: [
                { contract_type: { $eq: "ERC721" } },
                { ownerId: { $eq: _id } },
                { creatorId: { $eq: _id } },
              ],
            },
            {
              $and: [
                { contract_type: { $eq: "ERC721" } },
                { ownerId: { $eq: _id } },
                { creatorId: { $ne: _id } },
              ],
            },
            {
              $and: [
                { contract_type: { $eq: "ERC721" } },
                { ownerId: { $ne: _id } },
                { creatorId: { $eq: _id } },
              ],
            },
            {
              $and: [
                { contract_type: { $eq: "ERC1155" } },
                { ownerId: { $eq: _id } },
                { creatorId: { $eq: _id } },
              ],
            },
            {
              $and: [
                { contract_type: { $eq: "ERC1155" } },
                { ownerId: { $ne: _id } },
                { creatorId: { $eq: _id } },
              ],
            },
          ],
        })
        .count(),
    ]);

    const userJson = {
      userId: userData[0]._id,
      email: userData[0].email,
      fullName: userData[0].fullName,
      username: userData[0].username,
      role: userData[0].role,
      kycStatus: userData[0].kycStatus,
      createdAt: userData[0].createdAt,
      updatedAt: userData[0].updatedAt,
      status: userData[0].status,
      authProvider: userData[0].authProvider,
      avatar: userData[0].avatar,
      bio: userData[0].bio,
      coverImage: userData[0].coverImage,
    };
    const data = {
      error: false,
      message: "User Data fetched successfully",
      data: userJson,
    };
    return data;
  }
  const data = {
    error: true,
    message: "User not found",
  };
  return data;
};

export const uploadProfile = async (_id: string, file: any, body: any) => {
  logger.log(level.info, `>> uploadProfile()`);
  const userExist = await userModel.find({
    _id,
    status: "ACTIVE",
  });

  if (!userExist || userExist.length <= 0) {
    const data = {
      error: true,
      message: "User not found",
    };
    return data;
  }
  let uploadData = {};
  if (body.isAvatar === "true" || body.isAvatar === true) {
    await userModel.findOneAndUpdate(
      { _id },
      { $set: { avatar: body.avatar } }
    );
    uploadData = { ...uploadData, avatar: body.avatar };
  }
  if (body.isAvatar === "false" || body.isAvatar === false) {
    uploadData = await uploadProfilePromise(_id, file);
  }

  const data = {
    error: false,
    message: "Profile Image Updated Successfully",
    data: uploadData,
  };
  return data;
};

export const uploadProfilePromise = async (_id, file) => {
  let updateData = {};
  const profileData = fs.readFileSync(file.path);
  const blobProfile = profileBucket.file(`profile-${file.filename}`);

  return new Promise((resolve, reject) => {
    const blobStream = blobProfile.createWriteStream({ resumable: false });
    blobStream.on("error", (err) => {
      fs.unlink(file.path, () => {
        console.log("successfully Deleted");
      });
    });

    blobStream.on("finish", async () => {
      updateData = {
        ...updateData,
        avatar: `https://storage.googleapis.com/${profileBucket.name}/${blobProfile.name}`,
      };
      await userModel.findOneAndUpdate({ _id }, { $set: updateData });
      resolve(updateData);
    });
    blobStream.end(profileData);
    fs.unlink(file.path, () => {
      console.log("successfully Deleted");
    });
  });
};

export const uploadCoverImage = async (_id: string, file: any) => {
  logger.log(level.info, `>> uploadCoverImage()`);
  const userExist = await userModel.find({
    _id,
    status: "ACTIVE",
  });
  if (!userExist || userExist.length <= 0) {
    const data = {
      error: true,
      message: "User not found",
    };
    return data;
  }

  const uploadData = await uploadCoverPromise(_id, file);

  const data = {
    error: false,
    message: "Cover Image Updated Successfully",
    data: uploadData,
  };
  return data;
};

export const uploadCoverPromise = async (_id, file) => {
  let updateData = {};
  const coverData = fs.readFileSync(file.path);
  const blobCover = profileBucket.file(`cover-${file.filename}`);
  const blobStream = blobCover.createWriteStream();

  return new Promise((resolve, reject) => {
    blobStream.on("error", (err) => {
      fs.unlink(file.path, () => {
        console.log("successfully Deleted");
      });
    });

    blobStream.on("finish", async () => {
      console.log(
        `https://storage.googleapis.com/${profileBucket.name}/${blobCover.name}`
      );
      updateData = {
        ...updateData,
        coverImage: `https://storage.googleapis.com/${profileBucket.name}/${blobCover.name}`,
      };
      await userModel.findOneAndUpdate({ _id }, { $set: updateData });
      resolve(updateData);
    });
    blobStream.end(coverData);
    fs.unlink(file.path, () => {
      console.log("successfully Deleted");
    });
  });
};