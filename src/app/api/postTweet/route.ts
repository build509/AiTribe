import { NextRequest, NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Twitter API credentials from environment variables
const apiKey = process.env.TWITTER_API_KEY || '';
const apiSecret = process.env.TWITTER_API_SECRET || '';
const accessToken = process.env.TWITTER_ACCESS_TOKEN || '';
const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET || '';

// Create a Twitter client using OAuth 1.0a for v1.1 media uploads and v2 tweets
const twitterClient = new TwitterApi({
  appKey: apiKey,
  appSecret: apiSecret,
  accessToken: accessToken,
  accessSecret: accessTokenSecret,
});

// Helper function to download the image and save it temporarily
const downloadImage = async (imageUrl: string, filename: string): Promise<string> => {
  const localPath = path.resolve('./', filename);
  const writer = fs.createWriteStream(localPath);

  const response = await axios({
    url: imageUrl,
    method: 'GET',
    responseType: 'stream',
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(localPath));
    writer.on('error', reject);
  });
};

// Function to upload image to Twitter
async function uploadImageToTwitter(imagePath: string) {
  try {
    const mediaResponse = await twitterClient.v1.uploadMedia(imagePath);
    console.log('Media uploaded successfully, media ID:', mediaResponse);
    return mediaResponse;
  } catch (error) {
    console.error('Error uploading media:', error);
    throw new Error('Failed to upload media');
  }
}

// Function to post tweet with the uploaded media
async function postTweetWithMedia(mediaId: string, tweetText: string) {
  try {
    const tweetResponse = await twitterClient.v2.tweet({
      text: tweetText,
      media: { media_ids: [mediaId] },
    });
    console.log('Tweet posted successfully:', tweetResponse);
    // return tweetResponse;
    return {
      success: true,
      data: {
        id: tweetResponse.data.id,
        text: tweetResponse.data.text,
      },
    };
  } catch (error) {
    console.error('Error posting tweet:', error);
    throw new Error('Failed to post tweet');
  }
}

// API route handler
export async function POST(req: NextRequest) {
  try {
    const { imageUrl, message } = await req.json();

    if (!imageUrl || !message) {
      return NextResponse.json(
        { error: 'Missing imageUrl or message' },
        { status: 400 }
      );
    }

    console.log('Received request to post tweet:', { imageUrl, message });

    // Step 1: Download the image from the URL
    const localImagePath = await downloadImage(imageUrl, 'temp-image.png');

    // Step 2: Upload the image to Twitter
    const mediaId = await uploadImageToTwitter(localImagePath);

    // Step 3: Post the tweet with the uploaded media
    const tweetResponse = await postTweetWithMedia(mediaId, message);

    return NextResponse.json({ success: true, tweet: tweetResponse });

  } catch (error) {
    console.error('Error posting tweet:', error.message);
    return NextResponse.json(
      { error: error.message || 'Error posting tweet' },
      { status: 500 }
    );
  }
}
