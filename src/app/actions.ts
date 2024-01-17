'use server';
import fs from 'fs';

import { createClient } from '@supabase/supabase-js';
import child_process from 'child_process';
import GeneratedContentModel from '@/models/generated-content-model';
import CriteriaModel from '@/models/criteria-model';
import { CreateDraftPostRequest, DraftPostNode, DraftPostRichContent } from '@/models/draft-post-model';
import { createDraftPost as wixCreateDraftPost } from './wix-actions';

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL as string, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string);

export async function generateBlog(criteria: CriteriaModel): Promise<GeneratedContentModel> {
  const now = Date.now();
  const filename = `./python-script-${now}.py`;
  try {
    const { data: res } = await supabase.from('wix_config').select('script');

    const script = res ? res[0] : null;
    if (!script) {
      throw 'Script not found';
    }

    fs.writeFileSync(filename, script.script);

    const execSync = child_process.execSync;

    const pythonProcess = execSync(
      `${process.env.NODE_ENV === 'development' ? 'python' : 'python3'} ${filename} ` +
        `--Keywords "${criteria.keywords}" ${criteria.industry ? `--Industry "${criteria.industry}" ` : ' '} ${
          criteria.tone ? `--Tone "${criteria.tone}" ` : ' '
        }`
    );
    const result = pythonProcess.toString();

    return getResult(result);
  } finally {
    fs.unlinkSync(filename);
  }
}

function getResult(content: string) {
  var result: GeneratedContentModel = { title: '', description: '', content: '' };
  var titlePattern = /Title: (.*?)(\r\n|\r|\n|$)/;
  var titleMatch = content.match(titlePattern);

  if (titleMatch !== null && titleMatch.length > 1) {
    var title = titleMatch[1];
    result.title = title.trim();
  }

  var descriptionPattern = /Description: (.*?)(\r\n|\r|\n|$)/;
  var descriptionMatch = content.match(descriptionPattern);

  if (descriptionMatch !== null && descriptionMatch.length > 1) {
    var description = descriptionMatch[1];
    result.description = description.trim();
  }

  var descriptionEndIndex = descriptionMatch ? (descriptionMatch.index as number) + descriptionMatch[0].length : 0;
  var remainingString = content.substring(descriptionEndIndex).trim();
  result.content = remainingString.trim();

  return result;
}

export async function createDraftPost(command: GeneratedContentModel): Promise<boolean> {
  try {
    const request: CreateDraftPostRequest = {
      draftPost: {
        title: command.title,
        richContent: convertContentToDraftPost(command.content),
        memberId: process.env.WIX_MEMBER_ID as string,
      },
      publish: command.published ?? false,
      fieldsets: [],
    };
    const res = await wixCreateDraftPost(request, true);
    return res;
  } catch (err) {
    console.error(err);
    return false;
  }
}

function convertContentToDraftPost(content: string): DraftPostRichContent {
  const lines: string[] = content.split(/\r\n|\r|\n/);

  return {
    nodes: lines.map((line) => {
      const pattern = /<img[^>]+src\s*=\s*"([^"]+)"[^>]+alt\s*=\s*"([^"]+)"/;
      const match = line.match(pattern);

      if (match) {
        const src: string = match[1];
        const alt: string = match[2];

        return {
          imageData: {
            altText: alt,
            image: {
              src: { url: src },
              width: 900,
              height: null,
            },
            containerData: {
              alignment: 'CENTER',
              textWrap: true,
              width: {
                size: 'CONTENT',
              },
            },
          },
          type: 'IMAGE',
        } as DraftPostNode;
      } else {
        return {
          paragraphData: {
            textStyle: { textAlignment: 'AUTO' },
            indentation: 0,
          },
          nodes: [
            {
              textData: {
                type: 'TEXT',
                text: line.trim(),
                decorations: [],
              },
            },
          ],
          type: 'PARAGRAPH',
        } as DraftPostNode;
      }
    }),
  };
}
