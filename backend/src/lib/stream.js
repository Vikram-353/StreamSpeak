import { StreamChat } from "stream-chat";

import "dotenv/config";

const apiKey = process.env.STREAM_KEY;
const apiSecret = process.env.STREAM_SECRET;

if (!apiKey || !apiSecret) {
  console.error("Stream API key or secret is missing.");
}
const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
  try {
    await streamClient.upsertUsers([userData]); //upsert-create or update
    return userData;
  } catch (error) {
    console.error("Error upserting userdata", error);
  }
};

//TODO:

export const generateStreamToken = (userId) => {
  try {
    const userIdStr = userId.toString();
    return streamClient.createToken(userIdStr);
  } catch (error) {
    console.error("Error generating stream token.", error);
  }
};
