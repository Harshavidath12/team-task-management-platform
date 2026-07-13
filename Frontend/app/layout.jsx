import './globals.css';

export const metadata = {
  title: 'Project Dashboard',
  description: 'Team Task Management Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
