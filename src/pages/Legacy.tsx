/**
 * Fallback view: loads the original lumini.html inside an iframe. Used for
 * screens we haven't migrated yet — chat, calls, settings, stories viewer,
 * admin, etc. Linked to from the navbar's "Classic" tab.
 *
 * To remove this once everything is migrated:
 *   1. Delete this file.
 *   2. Remove the route in App.tsx.
 *   3. Delete public/lumini.html.
 *   4. Remove the "Classic" NavPill in Navbar.tsx.
 */
export default function Legacy() {
  return (
    <iframe
      src="/lumini.html"
      title="Lumini — Classic"
      className="fixed inset-0 z-50 h-screen w-screen border-0"
    />
  );
}
