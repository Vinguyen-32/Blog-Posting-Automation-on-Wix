'use client';

import CriteriaModel from '@/models/criteria-model';
import { Button, Checkbox, Form, Input } from 'antd';
import React, { useState } from 'react';
import { createDraftPost, generateBlog as generateBlogServer } from './actions';
import GeneratedContentModel from '@/models/generated-content-model';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { enqueueSnackbar } from 'notistack';

const { TextArea } = Input;

const SpinIndicator = () => <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />;

const CreateBlogPage: React.FC = () => {
  const [form] = Form.useForm<CriteriaModel>();
  const [createDraftBlogForm] = Form.useForm<GeneratedContentModel>();
  const [content, setContent] = useState<GeneratedContentModel>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const generateBlog = async (values: CriteriaModel) => {
    setIsLoading(true);
    setContent(null);
    const result = await generateBlogServer(values);
    result.published = result.published ?? false;
    setContent({ ...result });
    createDraftBlogForm.setFieldsValue(result);
    setIsLoading(false);
  };

  const createDraftBlog = async (values: GeneratedContentModel) => {
    setIsLoading(true);
    const result = await createDraftPost(values);
    if (result) {
      enqueueSnackbar('Succeed', { variant: 'success' });
    } else {
      enqueueSnackbar('Failed', { variant: 'error' });
    }
    setIsLoading(false);
  };

  return (
    <main className="flex justify-center">
      <div className="container">
        <Form form={form} layout="vertical" onFinish={generateBlog}>
          <Form.Item
            label="Keywords"
            name="keywords"
            required
            rules={[
              {
                required: true,
                message: 'Keyword is required',
              },
            ]}
          >
            <Input disabled={isLoading} />
          </Form.Item>
          <Form.Item label="Industry" name="industry">
            <Input disabled={isLoading} />
          </Form.Item>
          <Form.Item label="Tone" name="tone">
            <Input disabled={isLoading} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" disabled={isLoading}>
              {isLoading && <SpinIndicator />} Generate content
            </Button>
          </Form.Item>
        </Form>

        {content && (
          <Form form={createDraftBlogForm} layout="vertical" onFinish={createDraftBlog}>
            <Form.Item
              label="Title"
              name="title"
              required
              rules={[
                {
                  required: true,
                  message: 'Title is required',
                },
                {
                  max: 100,
                  message: 'Title must be less than 100 characters',
                },
              ]}
            >
              <Input disabled={isLoading} />
            </Form.Item>
            <Form.Item label="Description" name="description">
              <Input disabled={isLoading} />
            </Form.Item>
            <Form.Item
              label="Content"
              name="content"
              required
              rules={[
                {
                  required: true,
                  message: 'Content is required',
                },
              ]}
            >
              <TextArea rows={10} disabled={isLoading} />
            </Form.Item>
            <Form.Item name="published" valuePropName="checked">
              <Checkbox>Published?</Checkbox>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" disabled={isLoading}>
                {isLoading && <SpinIndicator />} Create blog
              </Button>
            </Form.Item>
          </Form>
        )}
      </div>
    </main>
  );
};

export default () => <CreateBlogPage />;
