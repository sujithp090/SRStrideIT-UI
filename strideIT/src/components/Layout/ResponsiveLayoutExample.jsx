/**
 * Example responsive layout structure using classes from globals.css.
 *
 * Usage:
 * <ResponsiveLayoutExample>
 *   <YourPageContent />
 * </ResponsiveLayoutExample>
 */
export default function ResponsiveLayoutExample({ children }) {
  return (
    <main className="container p-4">
      <section className="layout-example">
        <aside className="layout-example__sidebar surface p-4">
          <h2>Sidebar</h2>
          <p>Navigation / filters / quick actions.</p>
        </aside>

        <article className="layout-example__content surface p-4">
          <h1>Primary Content</h1>
          {children ?? <p>Main page content goes here.</p>}
        </article>

        <aside className="layout-example__panel surface p-4 md:block hidden">
          <h2>Secondary Panel</h2>
          <p>Insights, activity feed, or metadata.</p>
        </aside>
      </section>
    </main>
  );
}
