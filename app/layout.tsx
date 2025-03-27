import { Providers } from '@/components/ui/providers';
import BadgesImage from '@/public/badges.png';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Rank Compare',
  description: 'Compare rankings between different games.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      style={{
        backgroundImage: `url(${BadgesImage.src})`,
        backgroundRepeat: 'repeat-x',
      }}
      suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
