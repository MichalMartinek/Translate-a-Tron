import "./globals.css";

import { GeistSans } from "geist/font/sans";

let title = "Translate-a-Tron 🤖";
let description =
  "Translate-a-Tron is a cutting-edge translation device that allows users to instantly translate languages in real-time. With advanced technology and a sleek design, Translate-a-Tron makes communicating with people from different cultures and backgrounds easier than ever before. Whether you're traveling abroad or conducting business internationally, Translate-a-Tron is the perfect tool to break down language barriers and connect with others on a global scale. Say goodbye to language misunderstandings and hello to seamless communication with Translate-a-Tron.";

export const metadata = {
  title,
  description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={GeistSans.variable}>{children}</body>
    </html>
  );
}
