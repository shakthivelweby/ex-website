import "@flaticon/flaticon-uicons/css/all/all.css";
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
      <body className="pb-24 pt-[52px] sm:pt-[60px]" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
