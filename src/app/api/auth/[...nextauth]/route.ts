import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import AuthConstant from '@/libs/constants/authConstant';
import { Provider } from 'next-auth/providers/index';

const nextProviders: Provider[] = [
  CredentialsProvider({
    id: AuthConstant.CredentialProviderName,
    name: AuthConstant.CredentialProviderName,
    credentials: {
      username: { label: 'username', type: 'text' },
      password: { label: 'password', type: 'password' },
    },
    async authorize(credentials, req) {
      if (credentials && credentials.username === process.env.NEXTAUTH_USERNAME && credentials.password === process.env.NEXTAUTH_PASSWORD) {
        return {
          id: '1',
        };
      }
      return null;
    },
  }),
];

const nextAuthOptions: NextAuthOptions = {
  providers: nextProviders,
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(nextAuthOptions);

export { handler as GET, handler as POST };
