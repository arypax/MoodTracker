import { auth, provider, signInWithPopup } from "../config/firebase";

export const useGoogleAuth = () => {
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("User Info:", user);
      return user; 
    } catch (error) {
      console.error("Google Sign-In Error:", error.message);
    }
  };

  return { signInWithGoogle };
};