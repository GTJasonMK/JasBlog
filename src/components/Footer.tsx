export default function Footer({ text }: { text: string }) {
  return (
    <footer className="border-t border-[var(--color-paper-darker)] mt-16 py-8">
      <div className="max-w-4xl mx-auto px-6 text-center text-sm text-[var(--color-gray)]">
        <p>&copy; {new Date().getFullYear()} {text}</p>
      </div>
    </footer>
  );
}
