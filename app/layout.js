import './globals.css';
import { Inter } from 'next/font/google';
import Head from 'next/head';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Power Alley CrossFit',
  description: 'The best hour of your day in Buckhannon, WV.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <body className={inter.className}>
        {children}
        <SpeedInsights />
        <footer className="footer">
          <p>Power Alley CrossFit is an independently owned and operated affiliate of CrossFit, LLC.</p>
          <p>CrossFit® is a registered trademark of CrossFit, LLC.</p>
          <div className="footer-links">
            <a href="#contact">Contact</a>
            <a href="#about">About</a>
            <a href="https://www.facebook.com/dtfitness26201" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://www.instagram.com/poweralleycf/" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://www.crossfit.com/what-is-crossfit" target="_blank" rel="noopener noreferrer">
              What Is CrossFit?
            </a>
            <p>
              📧 <a href="mailto:info@poweralleycrossfit.com">info@poweralleycrossfit.com</a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
