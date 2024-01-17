export interface Block {
  text?: string;
  style?: string;
}

export interface DraftPostContent {
  blocks?: Block[];
}

export interface ParagraphTextStyle {
  textAlignment?: string;
}

export interface ParagraphData {
  textStyle?: ParagraphTextStyle;
  indentation?: number;
}

export interface TextData {
  type?: string;
  text?: string;
  decorations?: any[];
}

export interface ImageSource {
  url?: string;
}

export interface ImageObject {
  src?: ImageSource;
  width?: number;
  height?: number | null;
}

export interface ImageContainerWidth {
  size?: string;
}

export interface ImageContainer {
  width?: ImageContainerWidth;
  alignment?: string;
  textWrap?: boolean;
}

export interface ImageData {
  containerData?: ImageContainer;
  image?: ImageObject;
  altText?: string;
}

export interface DraftPostNode {
  nodes?: DraftPostNode[];
  type?: string;
  textData?: TextData;
  imageData?: ImageData;
  paragraphData?: ParagraphData;
}

export interface DraftPostRichContent {
  nodes?: DraftPostNode[];
}

export interface DraftPost {
  title?: string;
  content?: DraftPostContent;
  richContent?: DraftPostRichContent;
  memberId?: string;
}

export interface CreateDraftPostRequest {
  draftPost: DraftPost;
  publish: boolean;
  fieldsets: string[];
}
