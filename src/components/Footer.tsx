export default function Footer({ text }: { text: string }) {
  return (
    <footer className="site-footer">
      <span className="footer-rule" aria-hidden="true" /><p>&copy; {new Date().getFullYear()} {text}</p><span className="footer-rule" aria-hidden="true" />
    </footer>
  );
}
