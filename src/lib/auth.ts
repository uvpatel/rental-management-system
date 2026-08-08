import { betterAuth } from "better-auth";


import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@/db";

export const auth = betterAuth({
  //...other options
  database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
    }),
  emailAndPassword: { 
    enabled: true, 
  }, 
  socialProviders: { 
    github: { 
      clientId: process.env.GITHUB_CLIENT_ID as string, 
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
    }, 
  }, 
});