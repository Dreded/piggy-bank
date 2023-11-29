import pb from "lib/pocketbase";
import { useMutation, useQueryClient } from "react-query";

function convertDateToUTC(date) { 
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()); 
}
function addXDays(date, X) {
  return new Date(date.setDate(date.getDate() + X));
}

export default function useCreateTransaction() {
  const id = pb.authStore.model?.id;
  const queryClient = useQueryClient();
  async function create({ description, ammount, debit, date,multi,date_start,date_end }) {
    var myDate = convertDateToUTC(new Date(date));
    myDate = addXDays(myDate,7).toLocaleDateString('en-CA');
    if (id !== undefined) {
      var credit = ammount > 0;
      if (debit === true) {
        credit = false;
      }
      ammount = Math.abs(ammount);
      if (multi) {
        const startDate = convertDateToUTC(new Date(date_start));
        const endDate = convertDateToUTC(new Date(date_end));
        var nextDate = startDate;
        var weeks = 0;

        while (nextDate <= endDate) {
          var tempDate = nextDate.toLocaleDateString('en-CA');
          const createData = {
            description: description,
            value: ammount,
            owner: id,
            credit: credit,
            date: tempDate,
          };
          const Data = await pb.collection("transactions").create(createData);
          queryClient.invalidateQueries("transactions");
          weeks++;
          addXDays(nextDate,7);
        }
      }
      else {
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
    }
    return false;
  }

  return useMutation(create);
}
