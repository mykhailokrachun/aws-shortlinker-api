export interface User {
  email: string;
  password: string;
}

export interface CreateLink {
  link: string;
  expiresIn: 0 | 1 | 3 | 7;
}

export interface MeResponse {
  email: string;
  linksCreated: {
    link: string;
    timesVisited: any;
    ogUrl: any;
  }[];
}

export interface LoginResponse {
  auth: boolean;
  token: string;
}

export interface RegisterResponse {
  msg: string;
  token: string;
}

export interface DeactivateLinkResponse {
  msg: string;
}

export interface CreateLinkResponse {
  shortUrl: string;
}
