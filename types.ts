
export interface User {
  name: string;
  email: string;
  picture: string;
}

export interface UserContribution {
  email: string;
  name: string;
  count: number;
  lat?: number;
  lng?: number;
  picture?: string;
}

export interface CounterState {
  count: number;
}

export interface MapResult {
  text: string;
  links: {
    uri: string;
    title: string;
  }[];
}

export interface ImageState {
  originalUrl: string | null;
  editedUrl: string | null;
  loading: boolean;
  error: string | null;
}
