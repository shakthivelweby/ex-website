import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Explore World",
  description: "Book rentals, activities, events and packages",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="pt-12 pb-24">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
