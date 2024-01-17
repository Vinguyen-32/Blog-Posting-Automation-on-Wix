'use client';

import TokenModel from '@/models/token-model';
import { Button, Form, Input, Popconfirm } from 'antd';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { saveTokens, generateNewTokens as wixGenerateNewTokens } from './actions';

const TokenSettingPageClient: React.FC = () => {
  const [form] = Form.useForm<TokenModel>();
  const [tokens, setTokens] = useState<TokenModel>(null);

  useEffect(() => {
    fetch('/api/settings/token', {
      cache: 'no-store',
    })
      .then((res) => res.json())
      .then((token) => {
        setTokens(token);
        form.setFieldsValue(token);
      });
  }, []);

  const onSave = async (values: TokenModel) => {
    const result = await saveTokens(values);
    if (result >= 200 && result < 300) {
      enqueueSnackbar('Succeed', { variant: 'success' });
    } else {
      enqueueSnackbar('Failed', { variant: 'error' });
    }
  };

  const generateNewToken = async () => {
    const authorization_code = form.getFieldValue('authorization_code');
    if (!authorization_code) {
      enqueueSnackbar('Authorization code is required', { variant: 'warning' });
    } else {
      const result = await wixGenerateNewTokens(authorization_code);
      if (result) {
        enqueueSnackbar('Succeed', { variant: 'success' });
        window.location.reload();
      } else {
        enqueueSnackbar('Failed', { variant: 'error' });
      }
    }
  };

  return (
    <main className="flex justify-center">
      <div className="container">
        <Form form={form} layout="vertical" onFinish={onSave} initialValues={tokens}>
          <Form.Item label="Authorization code" name="authorization_code">
            <Input />
          </Form.Item>
          <Form.Item>
            <Popconfirm title="Generate new tokens" description="Are you sure?" onConfirm={generateNewToken} okText="Yes" cancelText="No">
              <Button type="default">Generate new tokens</Button>
            </Popconfirm>
          </Form.Item>
          <Form.Item label="Access token" name="access_token">
            <Input />
          </Form.Item>
          <Form.Item
            label="Refresh token"
            name="refresh_token"
            required
            rules={[
              {
                required: true,
                message: 'Refresh token is required',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Form.Item>
        </Form>
      </div>
    </main>
  );
};

export default TokenSettingPageClient;
