import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';
import "../globals.css";
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  // First-Run Check
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';

  // Prevent infinite redirect loop
  if (!pathname.includes('/login')) {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      redirect(`/${locale}/login`);
    }
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>

            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
