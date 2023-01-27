import { useMutation } from "react-query";
import pb from "lib/pocketbase";

export default function useLogin(data) {
  async function login({ email, password }) {
    await pb
      .collection("users")
      .authWithPassword(email, password);
  }
  return useMutation(login);
}
