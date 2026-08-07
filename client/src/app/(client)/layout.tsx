import { Navbar } from '@/components/client/Navbar';
import { Footer } from '@/components/client/Footer';
import { ReadingProgress } from '@/components/ui/ReadingProgress';
import { Toaster } from 'react-hot-toast';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ReadingProgress />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--color-ink-muted)',
            color: 'var(--color-parchment)',
            border: '1px solid rgba(255,255,255,0.08)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
          },
        }}
      />
    </>
  );
}
