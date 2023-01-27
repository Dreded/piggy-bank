import pb from "lib/pocketbase";
import { useMutation, useQueryClient } from "react-query";

export default function useCreateTransaction() {
  const id = pb.authStore.model?.id;
  const queryClient = useQueryClient();
  async function create({ description, ammount, date }) {
    if (id !== undefined) {
      const credit = ammount > 0;
      ammount = Math.abs(ammount);
      const createData = {
        description: description,
        value: ammount,
        owner: id,
        credit: credit,
        date: date,
      };
      const Data = await pb.collection("transactions").create(createData);

      queryClient.invalidateQueries("transactions");
      return Data;
    }
    return false;
  }

  return useMutation(create);
}
