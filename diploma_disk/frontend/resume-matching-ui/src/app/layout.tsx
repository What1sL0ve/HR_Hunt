
import MuiThemeProvider from './theme-provider';
import NavBar from '@/components/NavBar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <MuiThemeProvider>
          <NavBar />
          {children}
        </MuiThemeProvider>
      </body>
    </html>
  );
}
