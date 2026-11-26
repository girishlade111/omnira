import styles from './page.module.css';

export default function HomePage() {
  return (
    <main className={styles.main}>
      <section className={styles.card}>
        <h1 className={styles.title}>Omnira</h1>
        <p className={styles.subtitle}>
          Next.js App Router workspace scaffolded with TypeScript, CSS Modules, and design token
          custom properties.
        </p>
      </section>
    </main>
  );
}
