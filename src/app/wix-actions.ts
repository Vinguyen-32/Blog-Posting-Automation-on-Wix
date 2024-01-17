import axios from 'axios';
import { getTokens, saveTokens } from './token-setting/actions';
import { WixTokensModel } from '@/models/wix-tokens-model';
import { CreateDraftPostRequest } from '@/models/draft-post-model';

const baseURL = process.env.WIX_API_URL;

export async function generateNewTokens(authorizationCode: string): Promise<WixTokensModel | boolean> {
  const apiClient = axios.create({
    baseURL,
  });

  try {
    const response = await apiClient.post('oauth/access', {
      grant_type: 'authorization_code',
      client_id: process.env.WIX_CLIENT_ID,
      client_secret: process.env.WIX_CLIENT_SECRET,
      code: authorizationCode,
    });

    if (response.status >= 200 && response.status < 300) {
      const content = response.data;
      return content;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
}

async function refreshAccessToken(): Promise<WixTokensModel | boolean> {
  const currentTokens = await getTokens();
  const apiClient = axios.create({
    baseURL,
    headers: {
      Authorization: currentTokens.access_token,
    },
  });
  const { refresh_token } = currentTokens;

  if (refresh_token) {
    const response = await apiClient.post('oauth/access', {
      grant_type: 'refresh_token',
      client_id: process.env.WIX_CLIENT_ID,
      client_secret: process.env.WIX_CLIENT_SECRET,
      refresh_token: refresh_token,
    });

    if (response.status >= 200 && response.status < 300) {
      const content = response.data;
      return content;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

export async function createDraftPost(post: CreateDraftPostRequest, retry: boolean): Promise<boolean> {
  const currentTokens = await getTokens();
  const apiClient = axios.create({
    baseURL,
    headers: {
      Authorization: currentTokens.access_token,
    },
  });
  const response = await apiClient.post('blog/v3/draft-posts', post);

  if (response.status >= 200 && response.status < 300) {
    return true;
  } else {
    if (retry) {
      const token = await refreshAccessToken();
      if (token !== false) {
        await saveTokens({
          access_token: (token as WixTokensModel).access_token,
          refresh_token: (token as WixTokensModel).refresh_token,
          authorization_code: currentTokens.authorization_code,
        });
        return await this.createDraftPost(post, false);
      }
    }
    return false;
  }
}
