// Register every knowledge set here. The key must match the account id, except
// for "public", which is the set answered without signing in.
// Regenerate the JSON with: npm run index-docs
import publicSet from "./public.json" with { type: "json" };

export default {
  public: publicSet,
};
