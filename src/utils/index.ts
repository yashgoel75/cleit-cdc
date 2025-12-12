import { getAuth } from "firebase/auth";

export async function getFirebaseToken(): Promise<string | null> {
  const user = getAuth().currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
}