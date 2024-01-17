'use client';

import ScriptModel from '@/models/script-model';
import { Button, Form, Input } from 'antd';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { saveScript } from './actions';

const { TextArea } = Input;

const ScriptSettingPageClient: React.FC = () => {
  const [form] = Form.useForm<ScriptModel>();
  const [script, setScript] = useState<ScriptModel>();
  useEffect(() => {
    fetch('/api/settings/script', {
      cache: 'no-store',
    })
      .then((res) => res.json())
      .then((script) => {
        setScript(script);
        form.setFieldsValue(script);
      });
  }, []);

  const onSave = async (values: ScriptModel) => {
    const result = await saveScript(values);
    if (result >= 200 && result < 300) {
      enqueueSnackbar('Succeed', { variant: 'success' });
    } else {
      enqueueSnackbar('Failed', { variant: 'error' });
    }
  };

  return (
    <main className="flex justify-center">
      <div className="container">
        <Form form={form} layout="vertical" onFinish={onSave} initialValues={script}>
          <Form.Item label="Script code" name="script">
            <TextArea rows={20} />
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

export default ScriptSettingPageClient;
