import Feed from "./Feed";

/**
 * Index route. Previously this was a full-screen iframe wrapping
 * lumini.html. Now it renders the real React Feed inside the Layout.
 */
const Index = () => <Feed />;
export default Index;
