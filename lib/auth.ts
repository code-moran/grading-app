import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              studentProfile: true,
              instructorProfile: true,
            },
          });

          if (!user) {
            return null;
          }

          // Verify password
          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!passwordMatch) {
            return null;
          }

          // Check if instructor is approved
          if (user.role === 'instructor' && user.instructorProfile) {
            if (!user.instructorProfile.isApproved) {
              throw new Error('Your instructor account is pending approval');
            }
          }

          // Get additional profile data
          let studentId = null;
          let registrationNumber = null;

          if (user.role === 'student' && user.studentProfile) {
            studentId = user.studentProfile.studentId;
            registrationNumber = user.studentProfile.registrationNumber;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            studentId: studentId || undefined,
            registrationNumber: registrationNumber || undefined,
          };
        } catch (error: any) {
          console.error("Auth error:", error);
          if (error.message) {
            throw error;
          }
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.studentId = user.studentId;
        token.registrationNumber = user.registrationNumber;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.studentId = token.studentId as string;
        session.user.registrationNumber = token.registrationNumber as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key",
};
