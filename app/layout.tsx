import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TripTimeTable",
  description: "Your personal travel companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
