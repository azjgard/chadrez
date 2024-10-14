import React from "react";
import { ClerkProvider } from "@clerk/clerk-react";

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

interface Props {
  children: React.ReactNode;
}

export default function AuthWrapper(props: Props) {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY!} telemetry={false}>
      {props.children}
    </ClerkProvider>
  );
}
