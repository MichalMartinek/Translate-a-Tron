import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcrypt-ts";
import { getUser } from "app/db";
import { authConfig } from "app/auth.config";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize({ email, password }: any) {
        let user = await getUser(email);
        if (user.length === 0) return null;
        let passwordsMatch = await compare(password, user[0].password!);
        console.log("user");
        console.log(user);
        if (passwordsMatch) return user[0] as any;
      },
    }),
  ],
  callbacks:{
    // the callbacks will be executed after a well done login
    async jwt ({ token, user }) {
      if (user?.id) token._id = user.id
      return token
    },
    async session ({ session, token, user }) {
        // user id is stored in ._id when using credentials provider
        if (token?._id) session.user.id = token._id
    
        // user id is stored sub ._id when using google provider
        if (token?.sub) session.user.id = token.sub
  
        // we'll update the session object with those 
        // informations besides the ones it already has
        return session
    },
  },
});
